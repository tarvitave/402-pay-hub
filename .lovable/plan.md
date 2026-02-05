
# Automated Weekly Newsletter Generation

## Overview

This plan creates an automated system that uses AI to generate a new x402 Protocol newsletter every week, saving it as a draft for your review before publishing.

---

## How It Will Work

```text
Every Monday at 9:00 AM UTC
         │
         ▼
+------------------+       +-------------------+
│  Cron Job        │──────>│  generate-        │
│  (pg_cron)       │       │  newsletter       │
+------------------+       │  Edge Function    │
                           +--------+----------+
                                    │
                      +-------------+-------------+
                      │             │             │
                      ▼             ▼             ▼
               Fetch Latest   Call AI Model   Get Rotating
               x402 News     (Lovable AI)     Sponsor
                      │             │             │
                      +-------------+-------------+
                                    │
                                    ▼
                          +------------------+
                          │ Save to Database │
                          │ (as Draft)       │
                          +------------------+
                                    │
                                    ▼
                          +------------------+
                          │ Send Email       │
                          │ Notification     │
                          +------------------+
```

---

## What Gets Generated

Each week, the AI will create a complete newsletter following your existing template structure:

| Section | AI-Generated Content |
|---------|---------------------|
| Status 402 | Recent x402 specification updates, SDK changes |
| Clearing & Settlement | News from Base, Solana, Avalanche facilitators |
| Agent Shopping | New APIs accepting x402 payments |
| Reputation & Safety | ERC-8004 and security developments |
| The 1-Line Integration | A practical code snippet example |
| Sponsor | Rotates through your 5 configured sponsors |

---

## Implementation Steps

### Step 1: Create the AI Edge Function

A new `generate-newsletter` edge function that:
- Uses Lovable AI (google/gemini-2.5-flash) to generate content
- Follows your weekly template structure
- Automatically calculates the week number and date
- Rotates through sponsors (OSVue, WheelOfPopups, RaffleSelect, Phlorin, NoCodeAPI)
- Saves the newsletter to the database as a draft

### Step 2: Set Up Weekly Cron Job

Configure pg_cron to run every Monday at 9:00 AM UTC:
- Triggers the generate-newsletter function
- Creates draft newsletters automatically

### Step 3: Add Admin Notification

After generating:
- Optionally sends you an email notification that a new draft is ready
- You can review/edit in the Admin panel before publishing

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/generate-newsletter/index.ts` | Create | AI newsletter generation logic |
| `supabase/config.toml` | Modify | Add function configuration |
| Database | SQL | Enable pg_cron and pg_net extensions, create cron job |

---

## AI Prompt Strategy

The AI will be given:
1. Your newsletter template structure
2. Context about x402 protocol (HTTP 402, micropayments, agent payments)
3. Instructions to generate realistic, informative content
4. The current date/week for timely references

The generated content will be realistic placeholder content that you can edit with actual news, or you can enhance the system later to pull from real news sources.

---

## Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| Schedule | Monday 9:00 AM UTC | When to generate |
| AI Model | google/gemini-2.5-flash | Fast, cost-effective generation |
| Auto-publish | No | Always creates as draft |
| Email notification | Optional | Alert when new draft ready |

---

## Immediate Catch-Up

After implementation, I'll also generate the missing newsletters for:
- Week ending Jan 25, 2026
- Week ending Feb 1, 2026

This brings you current before the automated schedule takes over.

---

## What You'll See

1. **Every Monday**: A new newsletter draft appears in Admin → Newsletters
2. **Draft Status**: All auto-generated newsletters start as drafts
3. **Your Control**: Review, edit, and publish when ready
4. **Sponsor Rotation**: Each week features a different sponsor from your list

---

## Cost

Lovable AI usage:
- ~1 request per week
- Uses gemini-2.5-flash (cost-effective model)
- Falls within free tier for most workspaces
