# Dental Automation OS — Final Client Demo

Routes:
- `/` — premium public landing page
- `/login/` — private demo login + authenticated dashboard

Demo credentials are configured server-side in Netlify environment variables.

The dashboard reads a fresh-start client view from the Supabase `dental-dashboard-snapshot` Edge Function. Internal backend-test records created before the final client-demo cutoff remain in the database for audit but are not shown to the client.

Dashboard actions proxy to the existing n8n `dental-v3-dashboard-action` webhook. The n8n workflow must be published before real booking/reschedule/cancel/complete actions can run.

Current demo stack shown in System Health:
- Google Calendar + Sheets
- n8n Dental V3 workflow
- TextBee SMS gateway
- Vapi voice backend

Production note: `public.appointment_followups` still requires an RLS policy decision before a public production deployment. Do not enable RLS blindly until the existing n8n Supabase credential behavior is confirmed.
