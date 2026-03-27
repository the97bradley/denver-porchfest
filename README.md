# Denver Porchfest Site

Next.js site for Denver Porchfest.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Volunteer signup backend (Google Sheet)

The volunteer form posts to `/api/volunteer`, which forwards to a Google Apps Script webhook URL.

Set this env var in `.env.local`:

```bash
VOLUNTEER_APPS_SCRIPT_URL="https://script.google.com/macros/s/REPLACE_ME/exec"
```

If this is not set, volunteer submissions will return a backend-not-configured error.

## Application forms

Two application buttons are currently wired as Google Form links in:

- `src/app/page.tsx` → `hostApplicationUrl`
- `src/app/page.tsx` → `bandApplicationUrl`

Replace those placeholders with your real Google Form URLs.

## Deploy (free)

1. Push to GitHub
2. Import repo into Vercel
3. Add `VOLUNTEER_APPS_SCRIPT_URL` in Vercel project environment variables
4. Deploy
