# Migration off Lovable Cloud

Branch `migrate-off-lovable`. Code changes only; no servers, DNS or secrets were touched.
Production domain: **https://x402info.com**.

## Secrets / env vars (edge functions)

| Var | Used by | Notes |
|---|---|---|
| `SUPABASE_URL` | most functions | provided by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | most functions | provided by Supabase runtime |
| `ANTHROPIC_API_KEY` | social-queue, generate-newsletter, seo-analyzer | **NEW** (replaces `LOVABLE_API_KEY`) |
| `AI_MODEL` | same as above | **NEW**, optional, default `claude-opus-5-5` |
| `SITE_URL` | seo-analyzer (default base URL to crawl) | **NEW**, optional, falls back to `https://x402info.com` |
| `POSTMARK_API_KEY` | send-newsletter, send-invite, send-invites, daily-watchdog | existing |
| `POSTMARK_ACCOUNT_API_TOKEN` | send-invites | existing |
| `X_BEARER_TOKEN` | social-queue | existing, optional (publishing to X) |
| `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN` | social-queue | existing, optional |

`LOVABLE_API_KEY` is no longer used.

## Frontend env vars

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (existing; point at the new Supabase instance).
- No new `VITE_*` vars: the real domain is hardcoded (`https://x402info.com`) in canonical/OG/share URLs.

## Scheduled jobs

No `cron.schedule` calls are in the migrations (only `pg_cron`/`pg_net` extensions are enabled); the jobs
were created directly in the Lovable Cloud DB. From `.lovable/` notes and code they must be recreated:

| Job (old name) | Schedule (UTC) | Call |
|---|---|---|
| `daily-watchdog-report` | `0 12 * * *` (8:00 New York) | POST `daily-watchdog` `{}` (email footer says "08:00 UTC"; pick one) |
| `weekly-social-drafts` | `0 13 * * 1` | POST `social-queue` `{"action":"generate"}` |
| `hourly-social-publish` | `5 * * * *` | POST `social-queue` `{"action":"publish-due"}` |
| `endpoint-health-checks` | `*/30 * * * *` | POST `registry` `{"action":"check-all"}` |
| weekly newsletter (plan.md) | `0 9 * * 1` | POST `generate-newsletter` `{}` (verify it actually existed in the old DB) |

Dump the real list from the old DB (`select * from cron.job;`) before cutover to confirm.

## Webhooks & OAuth callbacks

- Postmark (delivery/bounce/open/click webhooks) -> `postmark-webhook`. Re-point in the Postmark server
  settings to the new functions URL. The function does not verify any signature/basic-auth.
- No OAuth providers / auth callbacks found.

## Storage buckets

None found in migrations or code.

## Changes made

- Removed `lovable-tagger`, `@lovable.dev/vite-plugin-*`; `vite.config.ts` keeps port 8080, `@` alias, react plugin, dedupe.
- Deleted `bun.lock`/`bun.lockb`; npm + refreshed `package-lock.json`.
- Replaced all `https://x402info.lovable.app` URLs (index.html canonical/og:url, 15 page canonicals,
  SocialShareButtons, seo-analyzer default) with `https://x402info.com`.
- Removed Lovable default `og:image`/`twitter:image` (no suitable image in `public/`); `twitter:card` changed to `summary`.
- New `supabase/functions/_shared/ai.ts` (Anthropic SDK). Converted 3 AI call sites from the Lovable
  gateway (Gemini 2.5 Flash) to Claude: `social-queue` and `seo-analyzer` now use structured JSON output
  instead of parsing free text; `generate-newsletter` uses plain text. Rate limits map to HTTP 429.

## Open questions / needs decision

- **OG image**: none exists. Add a 1200x630 image to `public/` and restore `og:image`/`twitter:image` (+ `summary_large_image`).
- **No sitemap.xml** exists in `public/` (and robots.txt does not reference one); consider adding.
- **No auth on admin functions**: all functions have `verify_jwt = false` and none check the caller, yet
  `social-queue` (generate/publish/delete), `seo-analyzer`, `generate-newsletter`, `admin-stats` and
  `registry` admin actions run with the service role. Anyone who finds the URL can call them. Recommend
  adding an admin check before going live on the new stack.
- `postmark-webhook` accepts unauthenticated payloads; consider Postmark basic-auth on the webhook URL.
- Cost: Claude Opus replaces Gemini Flash for weekly/periodic jobs; set `AI_MODEL` to a cheaper Claude model if desired.
- `generate-newsletter` stores `hero_image` as `/src/assets/...jpg`, which will not resolve in a production build (pre-existing).
- GitHub: `Technology-Resolution-Group/402-pay-hub` redirects to `tarvitave/402-pay-hub` (same repo id); see report.
