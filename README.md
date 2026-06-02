# MediNest

Exported from Whacka — this is the **complete frontend source code** for your app.

## What's in here

- `src/App.jsx` and your components — your application code.
- `src/lib/*` — the Whacka client SDK (data, AI, audio, storage, auth, payments, push, …).
- `index.html`, `vite.config.js`, `package.json`, Tailwind/PostCSS config — the build setup.

## How it runs (please read)

This is the **frontend only**. Your app's data, AI, file storage, auth, payments and
push features are powered by **Whacka's hosted backend**. The code in `src/lib/` makes
authenticated calls to:

    https://whacka.app/api/app/a60d8d35-752d-4c3a-b5f8-8003ea1a6c96/...

It is **not a standalone server** — it needs the Whacka backend to function.

## Running locally (development)

Create a `.env.local` in this folder:

```
VITE_PROJECT_ID=a60d8d35-752d-4c3a-b5f8-8003ea1a6c96
VITE_API_BASE=https://whacka.app
VITE_SUPABASE_URL=<your Supabase URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon key>
```

Then:

```bash
npm install
npm run dev
```

`VITE_PROJECT_ID` and `VITE_API_BASE` above are yours and ready to use. The two
`SUPABASE` values are public keys already embedded in your published app. With these
set, the app runs against your **live** Whacka backend and uses your Whacka account
and credits.

## Ownership

Your application code is yours. The Whacka client libraries in `src/lib/` are provided
to run your app on the Whacka platform. Running entirely without Whacka's backend would
require replacing those backend services yourself, which this export does not include.
