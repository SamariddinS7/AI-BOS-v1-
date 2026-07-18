-- Fix for Infinite Recursion Error in RLS
-- PostgreSQL throws infinite recursion when a policy queries the same table that the policy protects.
-- To solve this, we create a SECURITY DEFINER function to check the tenant id without running RLS.

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    t_id UUID;
BEGIN
    SELECT tenant_id INTO t_id
    FROM public.user_profiles
    WHERE auth_user_id = auth.uid()
    LIMIT 1;
    RETURN t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop old recursive policies
DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
DROP POLICY IF EXISTS user_profile_isolation_policy ON user_profiles;
DROP POLICY IF EXISTS customer_isolation_policy ON customers;
DROP POLICY IF EXISTS transaction_isolation_policy ON transactions;

-- Create new safely isolated policies
CREATE POLICY tenant_isolation_policy ON tenants
    FOR ALL
    USING (id = public.get_current_tenant_id());

CREATE POLICY user_profile_isolation_policy ON user_profiles
    FOR ALL
    USING (tenant_id = public.get_current_tenant_id() OR auth_user_id = auth.uid());

CREATE POLICY customer_isolation_policy ON customers
    FOR ALL
    USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY transaction_isolation_policy ON transactions
    FOR ALL
    USING (tenant_id = public.get_current_tenant_id());

