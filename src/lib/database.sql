
-- ===============================================================================================
-- 1. TABLES
-- ===============================================================================================

-- Create profiles table to store public user data
-- This table is linked to the auth.users table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  phone_number text,
  api_key text not null unique,
  wallet_balance numeric(10, 2) not null default 0.00,
  updated_at timestamp with time zone,
  
  primary key (id),
  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Create transactions table to log all user financial activities
create table public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles on delete cascade,
    transaction_code text,
    transaction_type text not null, -- e.g., 'deposit', 'purchase', 'refund'
    recipient_msisdn text,
    network_id integer,
    shared_bundle integer,
    bundle_amount text,
    amount numeric(10, 2) not null,
    status text not null, -- e.g., 'success', 'failed', 'pending'
    description text,
    balance_before numeric(10, 2),
    balance_after numeric(10, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ===============================================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ===============================================================================================

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

-- Policies for profiles table
-- Allow users to view their own profile
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Policies for transactions table
-- Allow users to view their own transactions
create policy "Users can view their own transactions."
  on public.transactions for select
  using ( auth.uid() = user_id );

-- Allow users to insert their own transactions (will be handled by functions)
create policy "Users can insert their own transactions."
  on public.transactions for insert
  with check (auth.uid() = user_id);


-- ===============================================================================================
-- 3. DATABASE FUNCTIONS
-- ===============================================================================================

-- Function to handle new user setup
-- This function is triggered when a new user signs up in the auth.users table
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a new profile
  insert into public.profiles (id, full_name, phone_number, api_key)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number',
    -- Generate a unique API key
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  );

  -- Create initial wallet deposit record if you want to give a welcome bonus
  -- Example: Give every new user a 1.00 GHS bonus
  -- insert into public.transactions (user_id, transaction_type, amount, status, description, balance_before, balance_after)
  -- values (new.id, 'deposit', 1.00, 'success', 'Welcome Bonus', 0.00, 1.00);
  
  -- update public.profiles
  -- set wallet_balance = 1.00
  -- where id = new.id;

  return new;
end;
$$;


-- ===============================================================================================
-- 4. DATABASE TRIGGERS
-- ===============================================================================================

-- Trigger to execute handle_new_user function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to automatically update the 'updated_at' timestamp on profile change
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure moddatetime (updated_at);


-- ===============================================================================================
-- 5. STORED PROCEDURES (RPC)
-- ===============================================================================================

-- Function to securely add funds to a user's wallet and log the transaction
-- This is an RPC (Remote Procedure Call) function
create function public.add_to_wallet_and_log_transaction(
    p_user_id uuid,
    p_amount numeric,
    p_transaction_type text,
    p_status text,
    p_transaction_code text,
    p_description text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_balance_before numeric;
  v_balance_after numeric;
begin
  -- 1. Get the current balance
  select wallet_balance into v_balance_before from public.profiles where id = p_user_id;

  -- 2. Calculate the new balance
  v_balance_after := v_balance_before + p_amount;

  -- 3. Update the user's wallet balance
  update public.profiles
  set wallet_balance = v_balance_after
  where id = p_user_id;

  -- 4. Log the transaction
  insert into public.transactions (
    user_id,
    transaction_code,
    transaction_type,
    amount,
    status,
    description,
    balance_before,
    balance_after
  ) values (
    p_user_id,
    p_transaction_code,
    p_transaction_type,
    p_amount,
    p_status,
    p_description,
    v_balance_before,
    v_balance_after
  );
end;
$$;


-- Function to securely process a data bundle purchase
create function public.purchase_bundle_and_log_transaction(
    p_user_id uuid,
    p_amount numeric,
    p_transaction_code text,
    p_status text,
    p_recipient_msisdn text,
    p_network_id integer,
    p_shared_bundle integer,
    p_bundle_amount text,
    p_description text
)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_balance_before numeric;
  v_balance_after numeric;
begin
  -- 1. Get current balance and lock the row for update
  select wallet_balance into v_balance_before from public.profiles where id = p_user_id for update;

  -- 2. Check if the user has sufficient funds
  if v_balance_before < p_amount then
    raise exception 'Insufficient funds';
  end if;

  -- 3. Calculate new balance
  v_balance_after := v_balance_before - p_amount;

  -- 4. Update user's wallet balance
  update public.profiles
  set wallet_balance = v_balance_after
  where id = p_user_id;

  -- 5. Log the transaction
  insert into public.transactions (
    user_id,
    transaction_code,
    transaction_type,
    amount,
    status,
    recipient_msisdn,
    network_id,
    shared_bundle,
    bundle_amount,
    description,
    balance_before,
    balance_after
  ) values (
    p_user_id,
    p_transaction_code,
    'purchase',
    -p_amount, -- Log purchase as a negative amount
    p_status,
    p_recipient_msisdn,
    p_network_id,
    p_shared_bundle,
    p_bundle_amount,
    p_description,
    v_balance_before,
    v_balance_after
  );

  -- 6. Return the new balance
  return v_balance_after;
end;
$$;


-- ===============================================================================================
-- 6. INITIAL DATA (Optional)
-- ===============================================================================================
-- You can add any initial data seeding here if necessary.

-- Note: The `moddatetime` function is a common utility for triggers.
-- If it doesn't exist in your Supabase project, you can create it with:
--
-- CREATE OR REPLACE FUNCTION moddatetime()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- However, Supabase often includes this by default.
-- ===============================================================================================
-- END OF SCRIPT
-- ===============================================================================================
