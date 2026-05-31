# Auth setup — DANSEL SHOP

Login, signup, and admin access use **Supabase** (free tier).

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Create a new project (note your database password)
3. Wait for project to finish setting up

## 2. Run database schema

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Copy all contents of `supabase/schema.sql` and **Run**
3. If the project already existed before username login, also run `supabase/schema-username-migration.sql`
4. For in-app buyer ↔ admin chat, run `supabase/schema-messages.sql`

## 3. Get API keys

1. **Project Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public** key

## 4. Add to Vercel (live site)

1. Vercel → your project → **Settings** → **Environment Variables**
2. Add:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon key |

3. **Redeploy** the project

## 5. Local development

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then: `npm run dev`

## 6. Create admin account

1. Sign up on your site at `/signup`
2. In Supabase **SQL Editor**, run (replace email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your-email@gmail.com');
```

3. Log in at `/admin/login`

## Routes

| URL | Purpose |
|-----|---------|
| `/signup` | Username + email + password (terms required) |
| `/login` | Username **or** email + password |
| `/order` | Checkout (login required) |
| `/account` | View profile |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |

## Email confirmation (4-digit OTP)

Signup and forgot-password use a **4-digit code** (not Supabase’s default 6–8 digit token).

### One-time Supabase setup

1. **Authentication** → **Providers** → **Email** → turn **OFF** `Confirm email`  
   (Supabase SMTP will stop blocking signup; our 4-digit OTP still verifies the account.)
2. **SQL Editor** → run `supabase/schema-email-otp-4.sql` (after `schema-flow-fix.sql`)
3. **SQL Editor** → run `supabase/schema-signup-fix.sql`
4. **SQL Editor** → run `supabase/setup-vault-resend.sql`  
   Replace `YOUR_RESEND_API_KEY` with your Resend API key (`re_...`)
5. **SQL Editor** → run `supabase/patch-resend-email-fn.sql`
6. **SQL Editor** → run `supabase/verify-email-otp-4.sql`  
   Expect: `otp_table` = `email_otp_verifications`, 3 functions, `resend_key_configured` = 1
7. **Redeploy** the site on Vercel so the latest app code is live.

### Signup test checklist

1. Open `/signup` → create account with a **new email**
2. Email should show **exactly 4 digits** (subject: “Your DANSEL SHOP signup code”)
3. Enter **4 digits only** on the verify screen → “Verified successfully!”
4. Sign in at `/login` with username/email + password

If you still receive a long code from Supabase, ignore it and use the **4-digit** email from Resend. To stop duplicate mails later, add an Auth **Send Email** hook (optional).
