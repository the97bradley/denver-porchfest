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
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_BROWSER_SAFE_GOOGLE_MAPS_KEY"
```

If `VOLUNTEER_APPS_SCRIPT_URL` is not set, volunteer submissions will return a backend-not-configured error.

If `GOOGLE_MAPS_API_KEY` is not set, business cover images in "The Neighborhood" section will fall back to gradient placeholders.

If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set, the Event Snapshot polygon map will show a setup message instead of the map.

For Google Maps photos, enable the **Places API (New)** in Google Cloud and use an API key with proper restrictions.
For the Event Snapshot map, enable **Maps JavaScript API** on the browser-safe key.

## Application forms

Two application buttons are currently wired as Google Form links in:

- `src/app/page.tsx` → `hostApplicationUrl`
- `src/app/page.tsx` → `bandApplicationUrl`

Replace those placeholders with your real Google Form URLs.

## Deploy (free)

1. Push to GitHub
2. Import repo into Vercel
3. Add `VOLUNTEER_APPS_SCRIPT_URL` and `GOOGLE_MAPS_API_KEY` in Vercel project environment variables
4. Deploy

## Google Search Console setup

1. Go to Google Search Console → Add property
2. Use **Domain** property for `denverporchfest.com`
3. Add the DNS TXT verification record in Cloudflare
4. After verification, submit sitemap URL:
   - `https://denverporchfest.com/sitemap.xml`
5. Request indexing for key pages:
   - `/`
   - `/lineup`
   - `/volunteer`
   - `/sponsors`
