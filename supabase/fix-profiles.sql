-- Run this in Supabase SQL Editor if "Launch League" fails silently
-- (usually means profile row or RLS policy is missing)

-- Allow users to create their own profile (fallback if trigger missed)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Security-definer function: create profile for current user if missing
create or replace function public.ensure_user_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, email, username)
  values (auth.uid(), v_email, split_part(v_email, '@', 1))
  on conflict (id) do update
    set email = excluded.email
  returning * into v_profile;

  return v_profile;
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;
