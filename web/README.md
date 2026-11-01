# CTRL Club

Event registration with QR tickets. Next.js on Vercel, Supabase for the database, auth, file storage and Edge Functions.

## Run locally

Copy `.env.example` to `.env.local`, then:

```bash
npm install
npm run dev
```

## Roles

| Role | Access |
|---|---|
| `user` | Events, registration, My Tickets |
| `scanner` | QR scanner |
| `admin` | Everything, plus `/admin` |

New sign-ups are always `user`. To create the first admin, sign up, then run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Supabase setup

Project ref: `ztnorzbajrebenknhxge`. The schema, access rules and Edge Functions (`admin-users`, `send-tickets`, `send-contact`) are already deployed. Their source is in `supabase/`.

1. **SMTP** (Authentication > Emails > SMTP settings): host `smtp.gmail.com`, port `587`, your Gmail address, and a Google app password.
2. **Confirm signup template** (Authentication > Emails): put `{{ .Token }}` in the body so the email contains the verification code (6 to 10 digits, set by the project's Email OTP length).
3. **URLs** (Authentication > URL Configuration): set Site URL to the Vercel address and add `<site>/**` and `http://localhost:3000/**` to the redirect URLs.
4. **Edge Function secrets** (Edge Functions > Secrets): `EMAIL`, `EMAIL_PASSWORD` and `SITE_URL`.

## Deploy to Vercel

Import the repository, set the root directory to `web`, and add the two variables from `.env.example`.
