-- Create categories table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  icon_name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table categories enable row level security;

-- Create policies
create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id and is_default = false);

-- Function to handle new user creation
create or replace function public.handle_new_user_categories()
returns trigger as $$
begin
  insert into public.categories (user_id, label, icon_name, is_default)
  values (new.id, 'Projetos', 'Cpu', true);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
-- Note: This assumes there's a trigger on auth.users. 
-- If the user already exists, we might need a migration script to backfill.
drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.handle_new_user_categories();
