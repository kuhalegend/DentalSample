# DentalSample

Client-ready foundation for a Dental AI Receptionist web/PWA.

## Stack
- React + Vite frontend
- Netlify hosting
- Supabase Auth + Postgres database
- n8n orchestration
- Google Calendar integration
- Twilio calls/SMS
- Vapi AI receptionist

## Current state
- Responsive dashboard/PWA shell with sample clinic data
- Supabase multi-clinic schema is installed separately in project `Dental Sample`
- RLS enabled on all app tables
- Integration credentials are intentionally not stored in this public repository

## Supabase environment variables
Copy `.env.example` to `.env.local` locally or add these in Netlify environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never place Twilio auth tokens, Vapi private keys, n8n secrets, or Supabase service-role keys in frontend environment variables or this repository.

## Development
```bash
npm install
npm run dev
```

## Production
Netlify build command: `npm run build`
Publish directory: `dist`

## Next build stage
1. Supabase sign-in / onboarding
2. Clinic setup wizard
3. Live appointments and patients from Supabase
4. n8n webhook/API bridge
5. Google Calendar booking/reschedule/cancel
6. Twilio SMS/call events
7. Vapi call tools and transcripts
8. Realtime notifications and final end-to-end test
