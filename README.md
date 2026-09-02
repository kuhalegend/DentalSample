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

## Riley browser demo

The authenticated Overview includes a browser-based **Talk to Riley** demo powered by the restricted Vapi public key. Configure these Netlify environment variables and redeploy:

- `VAPI_PUBLIC_KEY` — a Vapi public key restricted to the production site origin and the Riley assistant
- `VAPI_ASSISTANT_ID` — Riley's assistant ID

The browser demo requires explicit consent and microphone permission, limits calls to five minutes, and refreshes dashboard data shortly after a call ends. Never expose the Vapi private key in the browser or in these variables.

Production note: `public.appointment_followups` still requires an RLS policy decision before a public production deployment. Do not enable RLS blindly until the existing n8n Supabase credential behavior is confirmed.
