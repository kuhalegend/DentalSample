# JGPSPH Dental Premium Dashboard V1

A premium, Netlify-ready clinic dashboard connected to the tested Dental V3 backend.

## What is real in this dashboard

- Appointments are loaded from Supabase.
- Appointment KPI cards are calculated from real records.
- Communication history is loaded from `communications`.
- Reminder status is loaded from `appointment_reminders`.
- Post-treatment/review status is loaded from `appointment_followups`.
- Integration status is loaded from `integration_connections`.
- New booking, availability check, reschedule, cancel and complete actions call the existing n8n `dental-v3-dashboard-action` webhook through a **server-side Netlify proxy**.
- No n8n secret, Supabase service-role key, or dashboard password is sent to browser JavaScript.

## Demo login requested

Set these Netlify environment variables:

- `DASHBOARD_USERNAME=dentalsample`
- `DASHBOARD_PASSWORD=123456`

The password is intentionally **not hardcoded into browser code**. This is a demo-only credential. Do not use this simple shared password with real patient/medical data.

## Required Netlify environment variables

Copy values from `.env.example` into Netlify Site configuration → Environment variables.

1. `DASHBOARD_USERNAME`
2. `DASHBOARD_PASSWORD`
3. `DASHBOARD_SESSION_SECRET` — generate a long random value, 32+ characters
4. `SUPABASE_URL`
5. `SUPABASE_SERVICE_ROLE_KEY`
6. `DENTAL_CLINIC_ID`
7. `DENTAL_N8N_WEBHOOK_URL`
8. `DENTAL_INTERNAL_SECRET`

## Important before testing real mutations

The n8n workflow must be **published** for its production webhook to receive dashboard actions. Publishing also activates its 5-minute scheduled workers. Clean old test reminder/follow-up queue rows first and deliberately decide whether SMS sending should be live.

The dashboard displays real data even when n8n is unpublished, but mutation actions cannot reach an unpublished production webhook.

## Security issue discovered during audit

`public.appointment_followups` currently has RLS disabled in the test Supabase project. This project does not expose the Supabase anon key in the frontend, but the database table itself should still be secured before public production deployment.

Do **not** enable RLS blindly until the n8n Supabase credential type is confirmed. If n8n is using a service-role key, server-only access can continue after RLS is enabled. If it is using anon/authenticated access, policies must be designed first.

## Deployment

Push to the connected GitHub repository, set the environment variables in Netlify, deploy, then sign in with the demo credentials above.
