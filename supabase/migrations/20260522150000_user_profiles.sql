-- Create a table for extended user profiles
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone_number text,
  github_username text,
  last_login timestamp with time zone default timezone('utc'::text, now()),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_profiles enable row level security;

create policy "Users can only view their own profile."
  on user_profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on user_profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup and create a profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url, phone_number, github_username, metadata)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.phone,
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data
  );
  return new;
end;
$$;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
