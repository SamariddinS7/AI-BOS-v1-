-- Supabase RLS policies rely on the user ID provided by `auth.uid()`.
-- When a policy on the `user_profiles` table queries the `user_profiles` table itself
-- to find the user's `tenant_id`, it causes an "infinite recursion" error (42P17).

-- 1. Create a function that runs with maximum privileges (SECURITY DEFINER)
-- to safely fetch the tenant_id without repeatedly triggering RLS.
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id 
    FROM public.user_profiles 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop the existing broken policies
DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
DROP POLICY IF EXISTS user_profile_isolation_policy ON user_profiles;
DROP POLICY IF EXISTS customer_isolation_policy ON customers;
DROP POLICY IF EXISTS transaction_isolation_policy ON transactions;

-- 3. Recreate the policies using the safe function
CREATE POLICY tenant_isolation_policy ON tenants
    FOR ALL USING (id = public.get_auth_tenant_id());

CREATE POLICY user_profile_isolation_policy ON user_profiles
    FOR ALL USING (tenant_id = public.get_auth_tenant_id() OR auth_user_id = auth.uid());

CREATE POLICY customer_isolation_policy ON customers
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY transaction_isolation_policy ON transactions
    FOR ALL USING (tenant_id = public.get_auth_tenant_id());
