# CupLeague ⚽

Private FIFA 2026 prediction leagues — mobile-first, dark football theme, built with Next.js 15.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) — magic-link auth & realtime
- **Razorpay** — ₹499 one-time premium upgrade
- **lucide-react**, **date-fns**

## Quick Start

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local` and fill in values:
   ```bash
   cp .env.example .env.local
   ```

3. **Supabase** — run `supabase/schema.sql` then `supabase/seed.sql` in the SQL Editor.

4. **Auth redirect** — in Supabase Dashboard → Authentication → URL Configuration, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

5. **Realtime** — enable replication for `predictions`, `reactions`, `matches` tables.

6. **Run**
   ```bash
   npm run dev
   ```

## Customisation

Edit `lib/constants.ts` to change pricing, hero text, emojis, and share messages without touching component code.

Scoring logic lives in `utils/points.ts`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Magic-link sign in |
| `/create` | Create a league |
| `/[inviteCode]` | Join a league |
| `/[inviteCode]/dashboard` | Matches, leaderboard, invite |
| `/api/create-order` | Razorpay order creation |
| `/api/verify-payment` | Payment verification |

## Premium (Freemium)

- Free users: **1 league**
- Premium (₹499 one-time): **unlimited leagues** for full FIFA 2026
