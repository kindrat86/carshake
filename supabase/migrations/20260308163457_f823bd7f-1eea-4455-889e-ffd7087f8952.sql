-- USERS
create table user_profiles (
  id uuid primary key references auth.users(id),
  email text,
  display_name text,
  role text default 'owner' check (role in ('owner','staff','business_admin')),
  plan text default 'free' check (plan in ('free','shield_founding','shield','pro','enterprise')),
  scans_this_month integer default 0,
  billing_cycle_start timestamptz default now(),
  stripe_customer_id text,
  referral_code text unique default gen_random_uuid()::text,
  referred_by text,
  referrals_count integer default 0,
  email_preferences jsonb default '{"sequences":true,"transactional":true}'::jsonb,
  payment_failed boolean default false,
  cancel_at timestamptz,
  created_at timestamptz default now()
);

-- SCANS
create table scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text not null check (type in ('dropoff','pickup')),
  paired_scan_id uuid references scans(id),
  gps_lat double precision,
  gps_lon double precision,
  address text,
  hash_sha256 text,
  status text default 'active' check (status in ('active','paired','completed')),
  confirmed_by_fingerprint text,
  confirmed_at timestamptz,
  confirmed_device_info text,
  confirmation_method text check (confirmation_method in ('qr','sms','audio','badge_photo','none')),
  created_at timestamptz default now()
);

-- SCAN PHOTOS
create table scan_photos (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  angle integer not null check (angle between 1 and 8),
  angle_name text not null,
  storage_path text not null,
  client_timestamp timestamptz,
  server_timestamp timestamptz default now(),
  quality_score integer default 100
);

-- CONFIRMATIONS
create table confirmations (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  confirmed_at timestamptz default now(),
  device_fingerprint text,
  device_info text,
  ip_address text,
  method text default 'qr' check (method in ('qr','sms','audio','badge_photo'))
);

-- AI COMPARISONS
create table comparisons (
  id uuid primary key default gen_random_uuid(),
  dropoff_scan_id uuid references scans(id),
  pickup_scan_id uuid references scans(id),
  ai_result_json jsonb,
  status text default 'pending' check (status in ('pending','processing','no_changes','changes','failed')),
  total_differences integer default 0,
  processing_time_ms integer,
  created_at timestamptz default now()
);

-- COMPARISON FINDINGS
create table comparison_findings (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid references comparisons(id) on delete cascade,
  angle integer,
  location text not null,
  description text not null,
  severity text check (severity in ('minor','moderate','severe'))
);

-- SIGNUPS CAP
create table signups_cap (
  id uuid primary key default gen_random_uuid(),
  total_signups integer default 0,
  founding_cap integer default 100,
  founding_price_active boolean default true
);

-- BLOG
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  excerpt text,
  content text not null,
  meta_title text,
  meta_description text,
  target_keyword text,
  intent_tier text check (intent_tier in ('buyer','research','awareness')),
  tags text[] default '{}',
  status text default 'published',
  read_time_minutes integer default 8,
  created_at timestamptz default now(),
  published_at timestamptz default now()
);

create table blog_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text unique not null,
  category text,
  intent_tier text check (intent_tier in ('buyer','research','awareness')),
  used boolean default false,
  post_id uuid references blog_posts(id),
  created_at timestamptz default now()
);

-- EMAIL LOG
create table email_sequence_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  sequence_name text not null,
  step_number integer not null,
  email_subject text,
  resend_id text,
  sent_at timestamptz default now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

-- RLS
alter table user_profiles enable row level security;
alter table scans enable row level security;
alter table scan_photos enable row level security;
alter table confirmations enable row level security;
alter table comparisons enable row level security;
alter table comparison_findings enable row level security;
alter table blog_posts enable row level security;

create policy "Users read own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users update own profile" on user_profiles for update using (auth.uid() = id);
create policy "Create profile on signup" on user_profiles for insert with check (auth.uid() = id);

create policy "Users read own scans" on scans for select using (auth.uid() = user_id);
create policy "Users insert own scans" on scans for insert with check (auth.uid() = user_id);
create policy "Public read scan by id" on scans for select using (true);

create policy "Users read own photos" on scan_photos for select using (
  scan_id in (select id from scans where user_id = auth.uid())
);
create policy "Public read photos by scan" on scan_photos for select using (true);
create policy "Users insert photos" on scan_photos for insert with check (
  scan_id in (select id from scans where user_id = auth.uid())
);

create policy "Anyone can confirm" on confirmations for insert with check (true);
create policy "Owner reads confirmations" on confirmations for select using (
  scan_id in (select id from scans where user_id = auth.uid())
);
create policy "Public reads confirmations" on confirmations for select using (true);

create policy "Owner reads comparisons" on comparisons for select using (
  dropoff_scan_id in (select id from scans where user_id = auth.uid())
);

create policy "Owner reads findings" on comparison_findings for select using (
  comparison_id in (select id from comparisons where dropoff_scan_id in (select id from scans where user_id = auth.uid()))
);

create policy "Public reads blogs" on blog_posts for select using (status = 'published');
create policy "Public reads signups cap" on signups_cap for select using (true);

-- Storage bucket for scan photos
insert into storage.buckets (id, name, public) values ('scan-photos', 'scan-photos', true);

create policy "Anyone can view scan photos" on storage.objects for select using (bucket_id = 'scan-photos');
create policy "Authenticated users upload scan photos" on storage.objects for insert with check (bucket_id = 'scan-photos' and auth.role() = 'authenticated');

-- Insert initial signups cap data
insert into signups_cap (total_signups) values (47);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS on signups_cap
alter table signups_cap enable row level security;