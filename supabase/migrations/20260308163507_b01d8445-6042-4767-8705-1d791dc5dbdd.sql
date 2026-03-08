-- Enable RLS on missing tables
alter table blog_keywords enable row level security;
alter table email_sequence_log enable row level security;

-- RLS policies for blog_keywords (admin only, public read)
create policy "Public reads keywords" on blog_keywords for select using (true);

-- RLS policies for email_sequence_log (user reads own)
create policy "Users read own email log" on email_sequence_log for select using (auth.uid() = user_id);
create policy "System inserts email log" on email_sequence_log for insert with check (true);