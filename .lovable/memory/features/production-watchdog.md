---
name: Production Watchdog Daily Report
description: Daily 8AM New York email report to colin@tarvit.com covering traffic, dwell time, errors, actions and signups
type: feature
---
- `daily-watchdog` edge function builds an HTML report and emails it via Postmark (From newsletter@x402info.com, MessageStream "outbound") to colin@tarvit.com.
- Cron job `daily-watchdog-report` runs `0 12 * * *` UTC = 8:00 AM New York.
- Accepts `{ hours }` (default 24, max 168) and `{ dry_run: true }` to return HTML without sending.
- Report sections: summary cards, most popular pages, pages with longest dwell time, actions/config changes, errors encountered, new subscribers, project submissions, email delivery events, top referrers.
- Data sources: page_views (now has duration_seconds + referrer), client_errors, user_actions, subscribers, ecosystem_submissions, email_events. All service_role only.
- Client tracking: `usePageTracking` records dwell time on visibilitychange/unmount; `useErrorTracking` captures window errors + unhandled rejections; `trackAction(action, label, metadata)` logs user actions (newsletter subscribe, demo run, project submission).
