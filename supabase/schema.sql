-- ============================================================
--  CupLeague Supabase Schema
--  Run this in the Supabase SQL Editor for a fresh project.
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  is_premium boolean default false,
  leagues_created int default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup (username = part before @ in email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leagues
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text default '⚽',
  invite_code text unique not null,
  creator_id uuid references public.profiles(id) not null,
  created_at timestamptz default now()
);

-- League members
create table if not exists public.league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references public.leagues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(league_id, user_id)
);

-- Matches (global — shared across all leagues)
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  match_date timestamptz not null,
  home_score int,
  away_score int,
  status text default 'upcoming' check (status in ('upcoming', 'finished')),
  created_at timestamptz default now()
);

-- Predictions (per user, per match, per league)
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  match_id uuid references public.matches(id) not null,
  league_id uuid references public.leagues(id) not null,
  predicted_home int,
  predicted_away int,
  predicted_result text check (predicted_result in ('1', 'X', '2')),
  points_earned int default 0,
  created_at timestamptz default now(),
  unique(user_id, match_id, league_id)
);

-- Reactions (+5 bonus points to target user)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references public.leagues(id) not null,
  target_user_id uuid references public.profiles(id) not null,
  reactor_id uuid references public.profiles(id) not null,
  emoji text not null,
  points_awarded int default 5,
  created_at timestamptz default now()
);

-- ============================================================
--  Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.reactions enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

-- Leagues: anyone authenticated can read; creators can insert
create policy "Leagues are viewable by authenticated users"
  on public.leagues for select to authenticated using (true);

create policy "Authenticated users can create leagues"
  on public.leagues for insert to authenticated
  with check (auth.uid() = creator_id);

-- League members
create policy "Members viewable by authenticated users"
  on public.league_members for select to authenticated using (true);

create policy "Users can join leagues"
  on public.league_members for insert to authenticated
  with check (auth.uid() = user_id);

-- Matches: everyone can read
create policy "Matches are viewable by everyone"
  on public.matches for select using (true);

-- Predictions
create policy "Predictions viewable by league members"
  on public.predictions for select to authenticated using (true);

create policy "Users can insert own predictions"
  on public.predictions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on public.predictions for update to authenticated
  using (auth.uid() = user_id);

-- Reactions
create policy "Reactions viewable by authenticated users"
  on public.reactions for select to authenticated using (true);

create policy "Users can send reactions"
  on public.reactions for insert to authenticated
  with check (auth.uid() = reactor_id);

-- ============================================================
--  Realtime (enable in Supabase Dashboard → Database → Replication)
-- ============================================================
alter publication supabase_realtime add table public.predictions;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.matches;

-- ============================================================
--  Function to score predictions when a match is marked finished
--  (Call via trigger or manually in SQL Editor)
-- ============================================================
create or replace function public.score_match_predictions(p_match_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_match record;
  v_pred record;
  v_points int;
  v_actual_result text;
  v_pred_result text;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.status != 'finished' or v_match.home_score is null then return; end if;

  v_actual_result := case
    when v_match.home_score > v_match.away_score then '1'
    when v_match.home_score < v_match.away_score then '2'
    else 'X'
  end;

  for v_pred in select * from public.predictions where match_id = p_match_id loop
    v_points := 0;

    -- Determine predicted result
    if v_pred.predicted_home is not null and v_pred.predicted_away is not null then
      v_pred_result := case
        when v_pred.predicted_home > v_pred.predicted_away then '1'
        when v_pred.predicted_home < v_pred.predicted_away then '2'
        else 'X'
      end;
    else
      v_pred_result := v_pred.predicted_result;
    end if;

    if v_pred_result = v_actual_result then
      v_points := 3;
      if v_pred.predicted_home is not null and v_pred.predicted_away is not null then
        if (v_pred.predicted_home - v_pred.predicted_away) = (v_match.home_score - v_match.away_score) then
          v_points := v_points + 2;
        end if;
        if v_pred.predicted_home = v_match.home_score and v_pred.predicted_away = v_match.away_score then
          v_points := v_points + 1;
        end if;
      end if;
    end if;

    update public.predictions set points_earned = v_points where id = v_pred.id;
  end loop;
end;
$$;
