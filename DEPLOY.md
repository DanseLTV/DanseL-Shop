# Deploy DANSEL SHOP (Vercel — recommended)

## Before you deploy

1. Add your **GCash / Maya numbers** in `src/data/shopPayments.ts`
2. Run locally: `npm run build` (must succeed)

## Option A: Vercel (easiest, free)

1. Create a free account at [vercel.com](https://vercel.com)
2. Push this project to **GitHub** (see below if you don't have a repo yet)
3. In Vercel: **Add New Project** → Import your GitHub repo
4. Settings (auto-detected for Vite):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**

Your site will get a URL like `https://dansel-shop.vercel.app`

### Custom domain — danselshop.site

Full step-by-step: **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)**

Short version:

1. Vercel → Project → **Settings** → **Domains** → add `danselshop.site` and `www.danselshop.site`
2. At your domain registrar DNS: **A** `@` → `76.76.21.21`, **CNAME** `www` → `cname.vercel-dns.com`
3. Wait until Vercel shows **Valid Configuration**
4. Supabase → **Authentication** → **URL Configuration** → Site URL `https://danselshop.site` + redirect URLs for the new domain

## Push to GitHub (first time)

```powershell
cd "c:\Users\admin\Downloads\DanseL Shop"
git init
git add .
git commit -m "DANSEL SHOP initial release"
```

Create a new repo on [github.com/new](https://github.com/new), then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/dansel-shop.git
git branch -M main
git push -u origin main
```

## Option B: Netlify

1. [netlify.com](https://www.netlify.com) → Add new site → Import from Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `_redirects` file (already handled via `vercel.json`; for Netlify create `public/_redirects` with `/* /index.html 200`)

## After deploy

- Test all routes: `/`, `/shop`, `/order`, `/policies`
- Open order page and confirm payment details + Telegram link work
- Share your live URL on Telegram [@DanseL_VIP](https://t.me/DanseL_VIP)
