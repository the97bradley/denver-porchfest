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
NEXT_PUBLIC_SITE_URL="https://denverporchfest.com"
VOLUNTEER_APPS_SCRIPT_URL="https://script.google.com/macros/s/REPLACE_ME/exec"
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_PLATFORM_KEY"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_BROWSER_SAFE_GOOGLE_MAPS_KEY"
NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
```

If `VOLUNTEER_APPS_SCRIPT_URL` is not set, volunteer submissions will return a backend-not-configured error.

If `GOOGLE_MAPS_API_KEY` is not set, business cover images in "The Neighborhood" section will fall back to gradient placeholders.

If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set, the Event Snapshot polygon map will show a setup message instead of the map.

For Google Maps photos, enable the **Places API (New)** in Google Cloud and use an API key with proper restrictions.
For the Event Snapshot map, enable **Maps JavaScript API** on the browser-safe key.

## CMS (Sanity)

- Studio URL (local): `http://localhost:3000/studio`
- Studio URL (prod): `https://denverporchfest.com/studio`

### First-time setup

1. Create a Sanity project (https://sanity.io)
2. Put project values into env:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
3. Run site and open `/studio`
4. Create/edit:
   - **Event Settings** (hero and snapshot content)
   - **Neighborhood Spot** documents

Home page will use CMS values when available and fall back to defaults when not configured.

## Application forms

Two application buttons are currently wired as Google Form links in:

- `src/app/page.tsx` → `hostApplicationUrl`
- `src/app/page.tsx` → `bandApplicationUrl`

Replace those placeholders with your real Google Form URLs.

## Deploy (free)

1. Push to GitHub
2. Import repo into Vercel
3. Add env vars in Vercel project settings:
   - `NEXT_PUBLIC_SITE_URL`
   - `VOLUNTEER_APPS_SCRIPT_URL`
   - `GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
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
