-- ============================================
-- Artspace — Initial Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Users table (extends Supabase auth.users)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  type        text not null check (type in ('artist', 'buyer')),
  display_name text not null,
  avatar_url  text,
  about_me    text,
  mediums     text[] default '{}',
  categories  text[] default '{}',
  topics      text[] default '{}',
  training_start_year int,
  lat         double precision,
  lng         double precision,
  country     text,
  approved    boolean default false,
  created_at  timestamptz default now()
);

-- Artworks table
create table public.artworks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  medium      text,
  category    text,
  year        int,
  description text,
  image_url   text not null,
  in_portfolio boolean default false,
  created_at  timestamptz default now()
);

-- Likes table
create table public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  artwork_id  uuid not null references public.artworks(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, artwork_id)
);

-- Comments table
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  artwork_id  uuid not null references public.artworks(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

-- ── Row Level Security ──
alter table public.users    enable row level security;
alter table public.artworks enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;

-- Users: anyone can read, only the user can update their own row
create policy "Users are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own record"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own record"
  on public.users for insert with check (auth.uid() = id);

-- Artworks: anyone can read, only the artist can insert/update/delete their own
create policy "Artworks are viewable by everyone"
  on public.artworks for select using (true);

create policy "Artists can insert own artworks"
  on public.artworks for insert with check (auth.uid() = user_id);

create policy "Artists can update own artworks"
  on public.artworks for update using (auth.uid() = user_id);

create policy "Artists can delete own artworks"
  on public.artworks for delete using (auth.uid() = user_id);

-- Likes: anyone can read, authenticated users can insert/delete their own
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Authenticated users can like"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike"
  on public.likes for delete using (auth.uid() = user_id);

-- Comments: anyone can read, authenticated users can insert, only owner can delete
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ── Indexes ──
create index idx_artworks_user_id on public.artworks(user_id);
create index idx_likes_artwork_id on public.likes(artwork_id);
create index idx_comments_artwork_id on public.comments(artwork_id);
