# Drexa — Frontend

A modern crypto spot trading platform built with Next.js 16, React 19, and TypeScript.

---

## Overview

Drexa is a frontend for a crypto trading application focused exclusively on **spot trading** (not futures or derivatives). It provides:

- Multi-step user registration with KYC (identity & face verification)
- Email/password and Google OAuth authentication via Firebase
- Live market data browsing and per-asset detail pages
- A trading interface with candlestick charts and order panels
- Portfolio dashboard with holdings, PnL, and balance history
- Order management (active orders, history, fills)
- Wallet with fiat on-ramp (card, bank transfer, Apple/Google Pay) and crypto deposit addresses

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, React Compiler) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Authentication | Firebase (email/password & Google OAuth) |
| Backend | Go REST API at `http://localhost:8080` |
| Date handling | date-fns, react-day-picker |

---

## Project Structure

```
drexa-frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Geist fonts)
│   ├── page.tsx                # Redirects to /home
│   ├── globals.css             # Design tokens & CSS variables
│   ├── home/                   # Home dashboard
│   ├── login/                  # Login page
│   ├── forgot_password/        # Password reset
│   ├── register/               # Multi-step registration
│   │   ├── page.tsx            # Step 1: account creation
│   │   ├── details/            # Step 2: personal info
│   │   ├── identity/           # Step 3: ID document upload (KYC)
│   │   ├── face/               # Step 4: face verification
│   │   ├── pin/                # Step 5: security PIN setup
│   │   └── complete/           # Step 6: confirmation
│   ├── markets/
│   │   ├── page.tsx            # All assets listing
│   │   └── [sym]/page.tsx      # Individual asset detail
│   ├── trade/                  # Trading interface
│   ├── portfolio/              # Portfolio dashboard
│   ├── orders/                 # Active & historical orders
│   └── wallet/                 # Deposits & withdrawals
│
├── features/                   # Feature modules (clean architecture)
│   ├── auth/
│   │   └── presentation/
│   │       ├── hooks/          # useEmailAuth, useGoogleAuth, useRegister
│   │       └── pages/          # Auth page components
│   ├── core/
│   │   ├── domain/
│   │   │   ├── model/          # Shared data models (CoinData, Holding, etc.)
│   │   │   └── data/           # mock_data.ts, trading_utils.ts
│   │   ├── presentation/
│   │   │   └── components/     # TopNav, TradingLayout, primitives
│   │   └── store/              # firebase.ts
│   ├── home/
│   ├── markets/
│   ├── trade/
│   ├── portfolio/
│   ├── orders/
│   └── wallet/
│
├── components/
│   └── ui/                     # shadcn/ui components
│
├── lib/
│   └── utils.ts                # cn() Tailwind class utility
│
└── public/
    └── assets/                 # SVGs, logos, icons
```

---

## Architecture

The project follows a **clean architecture** pattern per feature:

```
features/<name>/
  domain/
    model/     ← data types and interfaces
    data/      ← mock data and utilities
  presentation/
    pages/     ← Next.js page components
    hooks/     ← business logic hooks
    components/ ← UI components specific to this feature
```

`app/` contains only thin route files that delegate to the corresponding `features/*/presentation/pages/` component.

---

## Authentication Flow

1. User signs in via Firebase (email/password or Google popup)
2. Firebase issues an ID token
3. Frontend exchanges the token with the Go backend:
   - `POST /api/v1/auth/login` — email login
   - `POST /api/v1/auth/google` — Google login
   - `POST /api/v1/auth/register` — registration + OTP
4. Backend returns an access token + refresh token, stored in `localStorage`
5. Firebase session is signed out (Firebase is auth-only, not session-persistent)

---

## Design System

Defined via CSS custom properties in [app/globals.css](app/globals.css):

| Token | Value | Usage |
|---|---|---|
| `--brand-mint` | `#00FFA3` | Primary accent, gains |
| `--brand-blue` | `#3B82F6` | Secondary accent |
| `--bg-base` | `#0D0F1C` | Page background |
| `--surface` | `#15182B` | Card surfaces |
| `--up` | `#00FFA3` | Price gains |
| `--down` | `#FF4D4D` | Price losses |

**Fonts:** Manrope (sans-serif) + Inter (monospace)

---

## Core Domain Models

Defined in [features/core/domain/model/coin.ts](features/core/domain/model/coin.ts):

- `CoinData` — symbol, name, price, 24h change, volume, market cap, sparkline
- `Holding` — user's asset quantity and average cost
- `HoldingRow` — holding enriched with current price, value, and PnL
- `OpenOrder` — active buy/sell orders
- `HistoryOrder` — completed orders with fill details
- `Activity` — deposit/withdrawal records
- `PortfolioTotals` — aggregated portfolio metrics

---

## Getting Started

**Prerequisites:** Node.js 20+, npm

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in Firebase config values (NEXT_PUBLIC_FIREBASE_*)

# Start development server
npm run dev
```

The app runs at `http://localhost:3000`. It expects the Go backend at `http://localhost:8080`.

**Other scripts:**

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

---

## Notes

- Currently uses **mock data** for market prices, portfolio, and orders — backend integration is in progress.
- Spot trading only — no futures, margin, or derivatives.
- KYC (identity + face verification) is implemented in the registration flow.
- The React Compiler is enabled in `next.config.ts` for automatic memoization optimizations.

---

## License

Proprietary software. All rights reserved. Unauthorized copying, modification, or distribution is not permitted.
