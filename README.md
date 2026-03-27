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

Set these env vars in `.env.local`:

```bash
VOLUNTEER_APPS_SCRIPT_URL="https://script.google.com/macros/s/REPLACE_ME/exec"
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_PLATFORM_KEY"
```

If `VOLUNTEER_APPS_SCRIPT_URL` is not set, volunteer submissions will return a backend-not-configured error.

If `GOOGLE_MAPS_API_KEY` is not set, business cover images in "The Neighborhood" section will fall back to gradient placeholders.

For Google Maps photos, enable the **Places API (New)** in Google Cloud and use an API key with proper restrictions.

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
