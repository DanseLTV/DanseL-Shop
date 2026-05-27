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

## Email confirmation

Supabase may require email confirmation by default.

To disable for testing: **Authentication** → **Providers** → **Email** → turn off **Confirm email**.

For production, keep confirmation enabled.
