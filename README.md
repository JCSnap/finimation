# Finimation

Finimation is an interactive visual learning app for finance concepts, basically "visual algorithms" for topics from fundamentals to derivatives.

## Live App

https://jcsnap.github.io/finimation

## What It Covers

- Options payoff (call/put payoff at expiry)
- Bond pricing (price vs. yield, coupon, and maturity)
- Efficient frontier (two-asset mean-variance view)
- Time value of money (PV/FV/annuity intuition)

## Tech Stack

- React + TypeScript + Vite
- Recharts for visualizations
- React Router (hash routing for GitHub Pages)
- Tailwind CSS
- Vitest + Testing Library

## Local Development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Type-check and build production assets
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Deployment

The app is configured for GitHub Pages and deploys from `main` via `.github/workflows/deploy.yml`.
