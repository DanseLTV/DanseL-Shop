# Custom domain — danselshop.site

Use this guide to point **danselshop.site** to your Vercel deployment (DANSEL SHOP).

---

## Step 1 — Add domain in Vercel

1. Open [vercel.com](https://vercel.com) → your **DANSEL SHOP** project  
2. **Settings** → **Domains**  
3. Add both (recommended):
   - `danselshop.site`
   - `www.danselshop.site`
4. Vercel will show **Invalid Configuration** until DNS is correct — that is normal at first.

Keep this page open. You will copy the DNS records Vercel shows you.

---

## Step 2 — DNS at your domain registrar

Log in where you bought **danselshop.site** (Namecheap, GoDaddy, Cloudflare, etc.) → **DNS** / **Manage DNS**.

### Option A — Vercel DNS records (most registrars)

Add these records (use the **exact values** Vercel shows if they differ):

| Type  | Name / Host | Value                    | TTL  |
|-------|-------------|--------------------------|------|
| **A** | `@`         | `76.76.21.21`            | Auto |
| **CNAME** | `www`   | `cname.vercel-dns.com`   | Auto |

- `@` = root domain → **danselshop.site**
- `www` → **www.danselshop.site**

Remove old A/CNAME records that conflict (old parking page, old host).

### Option B — Cloudflare (if DNS is on Cloudflare)

1. Add the same **A** and **CNAME** records in Cloudflare DNS.  
2. For the first setup, set proxy status to **DNS only** (grey cloud), not orange cloud.  
3. After Vercel shows **Valid**, you can turn proxy back on if you want.

### Option C — Use Vercel nameservers (advanced)

In Vercel → Domains → your domain → **Nameservers**, Vercel may offer to manage DNS.  
At your registrar, change nameservers to Vercel’s — then add the domain only in Vercel.

---

## Step 3 — Wait for DNS

- Usually **5–30 minutes**, sometimes up to **48 hours**
- In Vercel → Domains, status should change to **Valid Configuration**
- Test: https://danselshop.site and https://www.danselshop.site

Vercel usually redirects `www` → root (or the opposite). Pick one primary URL in Vercel if asked.

---

## Step 4 — Supabase (required for login)

If login/signup breaks on the new domain, update Supabase:

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **Authentication** → **URL Configuration**  
3. Set **Site URL** to:
   ```
   https://danselshop.site
   ```
4. Under **Redirect URLs**, add:
   ```
   https://danselshop.site/**
   https://www.danselshop.site/**
   ```
   Keep `https://danselshop.vercel.app/**` while testing if you still use the Vercel URL.

5. **Save**

No code change needed in the repo for the domain.

---

## Step 5 — Share the new link

Update links everywhere to:

- **https://danselshop.site**

The old `*.vercel.app` URL will still work unless you remove it in Vercel.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| Vercel says **Invalid Configuration** | Double-check A record `@` → `76.76.21.21` and CNAME `www` → `cname.vercel-dns.com`. Wait 30+ min. |
| Site opens on Vercel URL but not on .site | DNS not propagated yet, or wrong registrar DNS panel. |
| **SSL / certificate** pending | Wait up to 24h after DNS is valid; Vercel issues HTTPS automatically. |
| Login works on .vercel.app but not .site | Complete **Step 4** (Supabase redirect URLs). |
| Only `www` works (or only root) | Add **both** domains in Vercel; check redirect setting in Domains. |

---

## Quick checklist

- [ ] `danselshop.site` added in Vercel → Domains  
- [ ] `www.danselshop.site` added in Vercel  
- [ ] A + CNAME records set at registrar  
- [ ] Vercel shows **Valid Configuration**  
- [ ] https://danselshop.site loads the shop  
- [ ] Supabase Site URL + Redirect URLs updated  
- [ ] Test `/login` and `/signup` on the new domain  
