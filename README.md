# PNubic — React + TypeScript edition

PNubic is a private, dark music-player UI using React, TypeScript, Tailwind CSS and Audius.

## Run locally

Requirements: Node 18+.

```powershell
npm install
npm run dev
```

Then open the URL Vite prints.

## Optional Audius API key

Audius documents that a free API plan exists and that the API key is safe to include in frontend code. For local development, create `.env.local`:

```env
VITE_AUDIUS_API_KEY=your_api_key
```

Never put an Audius bearer token in frontend code.

## Production build

```powershell
npm run build
```

The static site is generated in `dist/` and can be deployed to GitHub Pages.

## GitHub Pages

This repo includes a workflow under `.github/workflows/pages.yml` that builds the React app and deploys `dist/` to GitHub Pages.

In GitHub: Settings → Pages → Source: GitHub Actions.

The Vite base path is `./`, so the app works as a project site such as `https://USERNAME.github.io/PNubic/`.

## ASP.NET Core host

The `PNubicHost` folder is a minimal ASP.NET Core 8 host. Copy the contents of `dist/` into `PNubicHost/wwwroot/`, then run the host with .NET 8.

GitHub Pages itself cannot execute ASP.NET Core; use the static React build there. Use the ASP.NET Core host when you want a .NET server deployment.

## Search behavior

Search is intentionally closer to a modern streaming-app experience: it debounces input, creates a few normalization/spelling variants, searches the Audius catalog with relevance sorting, merges duplicates and applies a client-side relevance score using title, artist, play count and repost count. It does not claim access to the full Spotify/YouTube/Apple commercial catalog.

## Intro / background playback

On first load per session, PNubic shows a ~1.6s occult-inspired animated intro and attempts a brief synthesized bass drop. Browser autoplay policy may block the sound; the visual intro still plays. Media Session metadata/actions are wired to the HTML audio element for supported browsers/operating systems.
# PNubic
