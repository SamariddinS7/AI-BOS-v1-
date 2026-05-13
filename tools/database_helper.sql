-- Standard database helpers, triggers, and functions

-- Function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Standard table template (pseudo-code/reference)
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
-- tenant_id UUID NOT NULL,
-- created_at TIMESTAMPTZ DEFAULT NOW(),
-- updated_at TIMESTAMPTZ DEFAULT NOW(),
-- deleted_at TIMESTAMPTZ,
-- updated_by UUID,
-- created_by UUID

-- Role checking helper for RLS
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
