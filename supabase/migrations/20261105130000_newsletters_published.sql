-- Lets a newsletter be taken off the site without deleting it. The public can only read published ones.
alter table public.newsletters add column if not exists published boolean not null default true;

drop policy if exists "Anyone can view newsletters" on public.newsletters;
create policy "Anyone can view published newsletters" on public.newsletters
  for select using (published);

-- These link to releases and repositories that don't exist.
update public.newsletters set published = false
where slug in ('week-ending-2025-11-30', 'week-ending-2025-12-21', 'week-ending-2026-01-11', 'week-ending-2026-01-18');
