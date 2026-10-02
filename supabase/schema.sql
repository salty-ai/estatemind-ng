-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users & Agents)
create type user_role as enum ('seeker', 'agent', 'admin');

create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role user_role default 'seeker',
  is_verified boolean default false, -- For agents (NIN/BVN check)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROPERTIES
create type property_type as enum ('rent', 'sale', 'short_let');
create type property_status as enum ('draft', 'pending', 'active', 'sold', 'leased');

create table properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'NGN',
  period text, -- 'year', 'month', 'night' (nullable for sales)
  type property_type not null,
  status property_status default 'pending',

  -- Location
  address text not null,
  area text, -- e.g. Lekki Phase 1
  city text default 'Lagos',
  state text default 'Lagos',

  -- Specs
  bedrooms integer default 0,
  bathrooms integer default 0,
  toilets integer default 0,
  parking integer default 0,

  -- Media
  images text[] default '{}',
  video_url text,

  -- Trust
  is_verified_listing boolean default false, -- TrueVerify video check

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEATURES (Many-to-Many for Properties)
create table features (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null -- e.g. "Swimming Pool", "24/7 Power"
);

create table property_features (
  property_id uuid references properties(id) on delete cascade,
  feature_id uuid references features(id) on delete cascade,
  primary key (property_id, feature_id)
);

-- RLS POLICIES (Security)
alter table profiles enable row level security;
alter table properties enable row level security;

-- Profiles: users can view/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Public can view active properties
create policy "Public properties are viewable by everyone"
  on properties for select
  using ( status = 'active' );

-- Owners can view their own properties (any status including draft/pending)
create policy "Owners can view own properties"
  on properties for select
  using ( auth.uid() = owner_id );

-- Owners can delete their own properties
create policy "Owners can delete own properties"
  on properties for delete
  using ( auth.uid() = owner_id );

-- Agents can insert their own properties
create policy "Agents can insert their own properties"
  on properties for insert
  with check ( auth.uid() = owner_id );

-- Agents can update their own properties
create policy "Agents can update own properties"
  on properties for update
  using ( auth.uid() = owner_id );

-- TRIGGERS
-- Handle new user signup -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case
      when new.raw_user_meta_data->>'role' in ('seeker', 'agent', 'admin')
        then new.raw_user_meta_data->>'role'
      else 'seeker'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
