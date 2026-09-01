# JGPSPH Dental Premium Dashboard V1

Premium Netlify dashboard connected to the tested Dental V3 backend.

## Real dashboard behavior

- Real Supabase appointments, reminders, follow-ups, communications, calls and integration status.
- Real KPI calculations; no sample patient metrics.
- New booking, availability, reschedule, cancel and treatment-complete actions proxy to the existing n8n `dental-v3-dashboard-action` webhook.
- Login and backend secrets stay server-side in Netlify Functions.
- Dashboard reads are served by the custom-auth Supabase Edge Function `dental-dashboard-snapshot`; no Supabase service-role key is stored in Netlify.

## Demo login

Set in Netlify environment variables:
- `DASHBOARD_USERNAME=dentalsample`
- `DASHBOARD_PASSWORD=123456`

This easy shared login is for a private demo containing test data only.

## Required Netlify environment variables

1. `DASHBOARD_USERNAME`
2. `DASHBOARD_PASSWORD`
3. `DASHBOARD_SESSION_SECRET`
4. `SUPABASE_URL`
5. `DENTAL_CLINIC_ID`
6. `DENTAL_DASHBOARD_SECRET`
7. `DENTAL_N8N_WEBHOOK_URL`
8. `DENTAL_INTERNAL_SECRET`

## Important before live mutation testing

The n8n workflow must be published for production webhook actions. Publishing also enables its scheduled reminder/follow-up workers, so old test queues must be cleaned first and SMS sending should be deliberately enabled only when ready.

## Database security item

`public.appointment_followups` currently has RLS disabled. Do not enable RLS blindly until the working n8n Supabase credential type/policies are confirmed.
