# DANSEL SHOP

Premium digital accounts and subscription-based access — built with React, Tailwind CSS, and Framer Motion.

## Design Direction

- **Theme:** Dark luxury with violet/cyan gradient accents
- **Style:** Glassmorphism cards, glowing hover effects, animated mesh backgrounds
- **Typography:** Space Grotesk (headings) + Inter (body)
- **Motion:** Scroll reveals, floating elements, carousel reviews, accordion FAQ

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured products, categories, why us, how to order, reviews, FAQ preview |
| `/shop` | Full product catalog with search, filter, and sort |
| `/order` | Checkout form with payment proof upload |
| `/policies` | Replacement, refund, terms, customer responsibility + full FAQ |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Customization

- **Products & prices:** Edit `src/data/productCatalog.ts` — change `price`, names, availability, etc. (see comments at top of file)
- **Shop settings:** Edit `src/data/shopConfig.ts` — currency symbol, default duration
- **Category icons:** Edit `src/data/categoryMeta.ts`
- **Reviews:** Edit `src/data/reviews.ts`
- **FAQ & Policies:** Edit `src/data/faq.ts` and `src/data/policies.ts`
- **Contact info:** Edit `src/data/policies.ts` → `contactInfo`
- **Site copy:** Edit `src/data/site.ts`

## Replacing Product Images

Product cards currently use gradient placeholders. To add real images:

1. Add images to `public/products/`
2. Add an `image` field to the `Product` type in `src/types/index.ts`
3. Update `ProductCard.tsx` and `ProductDetailModal.tsx` to render `<img>` when `image` is set

## Build

```bash
npm run build
npm run preview
```
