# Phase 11: Onboarding Automation + Smart Notifications

## New Entities
- **OnboardingChecklist** — 8-step per-client checklist (quote → kickoff)
- **Notification** — system-wide smart notifications with read/snooze/action
- **LeadScore** — composite 0-100 score with grade (Cold/Warm/Hot/Qualified)

## New Backend Function: `onboardingActions`
Actions: `create_checklist`, `update_step`, `get_checklist`, `list_active`,
`calculate_score`, `get_scores`, `create_notification`, `get_notifications`,
`mark_read`, `mark_all_read`, `snooze`

## New Pages
- `/admin/onboarding` — Onboarding Checklists dashboard (progress bars, step toggles)
- `/admin/notifications` — Full Notifications Centre (filter, snooze, mark read)

## New Component
- `NotificationBell` — live bell in admin header, polls every 60s, dropdown with snooze

## Integrations
- `onQuoteAccepted` now auto-creates an onboarding checklist and a system notification
  when a quote is accepted, and auto-marks quote_accepted + invoice_sent steps as done

## Sidebar
- Marketing group: Campaigns + Notifications
- New Onboarding group: Client Onboarding