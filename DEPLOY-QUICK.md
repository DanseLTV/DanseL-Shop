# Quick deploy — DANSEL SHOP

Payment number is set: **09481913107** (GCash & Maya).

---

## Way 1: Vercel without Git (fastest if no Git installed)

1. Open terminal in this folder:

```powershell
cd "c:\Users\admin\Downloads\DanseL Shop"
npm run build
npx vercel login
npx vercel --prod
```

2. Follow prompts (email login, project name e.g. `dansel-shop`).
3. You get a live URL like `https://dansel-shop.vercel.app`.

---

## Way 2: GitHub + Vercel (best long-term)

### Step A — Install Git

Download: https://git-scm.com/download/win  
Restart Cursor after install.

### Step B — Push to GitHub

```powershell
cd "c:\Users\admin\Downloads\DanseL Shop"
git init
git add .
git commit -m "DANSEL SHOP launch"
```

1. Go to https://github.com/new  
2. Repository name: `dansel-shop` → Create (empty, no README)  
3. Run (replace YOUR_USERNAME):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/dansel-shop.git
git branch -M main
git push -u origin main
```

### Step C — Vercel

1. https://vercel.com → Sign up with GitHub  
2. **Add New Project** → Import `dansel-shop`  
3. Build: `npm run build` | Output: `dist`  
4. **Deploy**

---

## After live

- Test: `/order` — GCash/Maya shows **09481913107**  
- Share link on Telegram: https://t.me/DanseL_VIP
