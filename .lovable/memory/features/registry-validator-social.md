---
name: Registry, Validator & Social Automation
description: Endpoint registry with health checks, free 402 validator tool, and AI social autoposting queue
type: feature
---
- `/registry` (src/pages/Registry.tsx) lists approved `x402_endpoints` with 24h uptime, latency, price, network; public submissions land unapproved. Backed by `registry` edge function (`check-all`, `list`, `submit`, admin approve). Cron `endpoint-health-checks` runs every 30 min.
- `/validator` (src/pages/Validator.tsx) uses `validate-402` edge function: follows redirects, reads the challenge from the JSON body OR the base64 `payment-required` header (x402 v2), scores status/accepts/network/amount/payTo/version/CORS.
- Social automation: `social-queue` edge function generates drafts with google/gemini-2.5-flash, stored in `social_posts`; admin UI at Admin → Social. Crons: `weekly-social-drafts` (Mon 13:00 UTC) and `hourly-social-publish` (:05 each hour, publishes approved/due posts). Publishing to X/LinkedIn requires API credentials secrets; without them posts stay approved but unsent.
