--
-- SB Bundles Supabase Schema
--

-- 1. EXTENSIONS
-- Ensure required extensions are enabled
create extension if not exists "uuid-ossp";

-- 2. TABLE CREATION

-- Networks Table: Stores the mobile network operators
CREATE TABLE IF NOT EXISTS public.networks (
    id smallint PRIMARY KEY,
    name varchar(20) NOT NULL UNIQUE
);
COMMENT ON TABLE public.networks IS 'Stores the mobile network operators like MTN, Telecel, etc.';

-- Packages Table: Stores available data bundle packages.
-- This can be periodically synced from the external API.
CREATE TABLE IF NOT EXISTS public.packages (
    id serial PRIMARY KEY,
    network_id smallint NOT NULL REFERENCES public.networks(id),
    shared_bundle_id int NOT NULL,
    data_amount varchar(50) NOT NULL,
    validity varchar(50) NOT NULL,
    price numeric(10, 2) NOT NULL,
    UNIQUE(network_id, shared_bundle_id)
);
COMMENT ON TABLE public.packages IS 'Caches available data packages from the external API.';

-- Users Table: Stores public user profile information.
-- This is linked one-to-one with Supabase's auth.users table.
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone_number varchar(15) UNIQUE,
    api_key uuid NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);
COMMENT ON TABLE public.users IS 'Stores public user profile data, linked to auth.users.';

-- Transaction Type Enum: Defines the types of transactions possible.
CREATE TYPE public.transaction_type AS ENUM (
    'purchase',
    'deposit',
    'refund'
);

-- Transaction Status Enum: Defines the status of a transaction.
CREATE TYPE public.transaction_status AS ENUM (
    'completed',
    'failed',
    'pending'
);

-- Transactions Table: Logs all financial activities for all users.
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id),
    transaction_code varchar(100),
    transaction_type public.transaction_type NOT NULL,
    status public.transaction_status NOT NULL,
    
    -- For purchases
    recipient_msisdn varchar(15),
    package_id int REFERENCES public.packages(id),
    
    -- Financials
    amount numeric(10, 2) NOT NULL,
    balance_before numeric(10, 2) NOT NULL,
    balance_after numeric(10, 2) NOT NULL,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.transactions IS 'Logs all user purchases, deposits, and other financial activities.';

-- 3. TRIGGERS & FUNCTIONS

-- Function to create a user profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, phone_number)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'fullName',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile upon new user registration.';

-- Trigger to call the function after a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle timestamp updates on user profile
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at timestamp on row modification.';

-- Trigger to update user's updated_at timestamp
CREATE TRIGGER handle_user_update
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


-- 4. ROW LEVEL SECURITY (RLS)
-- Enable RLS for all tables
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for `networks` table
-- Allow anyone (authenticated or not) to read network information
CREATE POLICY "Allow public read access to networks"
    ON public.networks FOR SELECT
    USING (true);

-- RLS Policies for `packages` table
-- Allow anyone (authenticated or not) to read package information
CREATE POLICY "Allow public read access to packages"
    ON public.packages FOR SELECT
    USING (true);

-- RLS Policies for `users` table
-- Users can see their own profile
CREATE POLICY "Allow individual read access"
    ON public.users FOR SELECT
    USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Allow individual update access"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for `transactions` table
-- Users can only see their own transactions
CREATE POLICY "Allow individual read access on transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);
-- Users can't directly create, update, or delete transactions.
-- This must be handled by secure server-side logic (e.g., via RPC functions).


-- 5. SEED DATA
-- Insert initial data for networks
INSERT INTO public.networks (id, name) VALUES
    (1, 'MTN'),
    (2, 'Telecel'),
    (3, 'AirtelTigo')
ON CONFLICT (id) DO NOTHING;

-- Insert some example packages (you can sync this with the API)
INSERT INTO public.packages (network_id, shared_bundle_id, data_amount, validity, price) VALUES
    (1, 101, '500 MB', '3 Days', 5.00),
    (1, 102, '1 GB', '7 Days', 10.00),
    (1, 103, '2 GB', '30 Days', 20.00),
    (2, 201, '700 MB', '3 Days', 5.00),
    (2, 202, '1.5 GB', '7 Days', 10.00),
    (2, 203, '3 GB', '30 Days', 20.00),
    (3, 301, '600 MB', '3 Days', 5.00),
    (3, 302, '1.2 GB', '7 Days', 10.00),
    (3, 303, '2.5 GB', '30 Days', 20.00)
ON CONFLICT (network_id, shared_bundle_id) DO NOTHING;


-- 6. RPC FUNCTIONS (for secure operations)
-- Example function to securely credit a user's wallet.
-- This should only be called from a trusted server environment (e.g., a backend webhook).
CREATE OR REPLACE FUNCTION public.credit_wallet(
    p_user_id uuid,
    p_amount numeric,
    p_transaction_code text
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance_before numeric;
    v_new_balance numeric;
BEGIN
    -- Get the current balance
    SELECT wallet_balance INTO v_balance_before FROM public.users WHERE id = p_user_id;

    -- Update the user's wallet
    UPDATE public.users
    SET wallet_balance = wallet_balance + p_amount
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;

    -- Log the deposit transaction
    INSERT INTO public.transactions (
        user_id,
        transaction_code,
        transaction_type,
        status,
        amount,
        balance_before,
        balance_after
    )
    VALUES (
        p_user_id,
        p_transaction_code,
        'deposit',
        'completed',
        p_amount,
        v_balance_before,
        v_new_balance
    );

    RETURN v_new_balance;
END;
$$;
COMMENT ON FUNCTION public.credit_wallet(uuid, numeric, text) IS 'Securely adds funds to a user''s wallet and logs the transaction. Should be called from a trusted server environment.';

-- Grant execute permission to the 'service_role' for backend use
-- REVOKE EXECUTE ON FUNCTION public.credit_wallet(uuid, numeric, text) FROM public; -- remove public access
-- GRANT EXECUTE ON FUNCTION public.credit_wallet(uuid, numeric, text) TO service_role; -- grant backend access

-- That concludes the initial setup.

