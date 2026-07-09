# Frontend Conventions (Next.js / TypeScript)

## Patterns

- All pages are `"use client"` components (App Router client components).
- API calls go through the `/api/proxy/[...path]` route handler — never hit the backend directly from the browser.
- Auth token stored in `localStorage`, injected via `Authorization: Bearer` header.
- Use `lucide-react` for icons. Use Tailwind utility classes for styling.
- State management via React Context (`AuthContext`, `I18nContext`) — no Redux.
- New primary navigation routes must be added to `components/Sidebar.tsx`.

## i18n

- Translations live in `lib/i18n/`. Access via the `useI18n()` hook.
- Default language: English. Supported: English, Spanish.
- Do NOT change translation keys unless explicitly asked.

## Charts

- Use `recharts` for data visualizations (bar charts, pie charts, funnels).
- Already installed as a project dependency.
