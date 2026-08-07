# Pooja Raviendran Kutty — Portfolio (Next.js + Admin Dashboard)

Same architecture as [ramjithr-portfolio](https://github.com/Novarispc/ramjithr-portfolio): Next.js 15 + TypeScript
+ Tailwind, JWT/bcrypt admin auth, file-based JSON content storage with version history, and a full content
dashboard for editing every section and uploading files.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Generate your admin login credentials:

```bash
npm run hash-password -- "your-chosen-password"
```

Paste the printed hash into `.env.local` as `ADMIN_PASSWORD_HASH`, set `ADMIN_USERNAME`, and set `SESSION_SECRET`
to a random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

## Run locally

```bash
npm run dev
```

- Public site: **http://localhost:3000**
- Admin dashboard: **http://localhost:3000/admin/dashboard** (redirects to `/admin/login` if not signed in)

## Architecture

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Auth | JWT session cookie (`jose`), bcrypt password hash, `HttpOnly`/`SameSite=Strict` cookie, 8h TTL |
| Content storage | `data/content.json` (gitignored), versioned snapshots in `data/history/` (last 30 kept) |
| File uploads | Saved to `public/uploads/`, served statically |
| Route protection | `middleware.ts` guards `/admin/**`, `/api/admin/**`, `/api/content/**` (except `/api/content/public`), `/api/backup/**`, `/api/upload/**` |

## Content editing flow

1. Sign in at `/admin/login`
2. Edit any section in the dashboard (Profile, About, Expertise, Projects, Portfolio files, Experience,
   Education, Tools, Milestones, Contact/Footer)
3. **Save Draft** persists without going live; **Publish** makes it the live content immediately
4. Every publish archives the previous `content.json` under `data/history/` — restore any snapshot from the
   **Data Management** section
5. **Export JSON** downloads a full backup; **Import JSON** restores from one
