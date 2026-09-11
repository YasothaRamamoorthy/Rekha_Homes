# RehkaHomes Gallery

A React/Vite portfolio for RehkaHomes with a rotating homepage image, a full horizontal gallery, testimonials, feedback submission, and team applications.

## Setup

Install dependencies:

```bash
cd /Users/yaso/Documents/GitHub/vscode/Keerthans_website
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local URL shown by Vite.

The default frontend URL is `http://localhost:5173/`; the API runs on `http://localhost:5174/`.

GitHub Pages deploys from GitHub Actions. For this repository the deployed URL is `https://yasotharamamoorthy.github.io/Websites/`. If the repository is renamed to `Rehka_Homes`, the workflow automatically uses the matching `/Rehka_Homes/` base path.

## Build

```bash
npm run build
```

## Project Structure

- `src/GalleryApp.tsx` - active homepage, gallery, About, Contact, testimonials, feedback, and careers views
- `src/projects.ts` - editable gallery data and local image paths
- `src/index.css` - gallery and responsive styles
- `src/main.tsx` - React entry point
- `public/assets/` - gallery photography served by Vite
- `server.js` - API for testimonials, image uploads, and applications
- `data/testimonials.json` - stored feedback entries

The homepage shows one rotating image from the full gallery. The Our Work view presents all gallery images in one continuous row. Add new images to `public/assets/` and register them in `src/projects.ts`.

Run the frontend and backend together with:

```bash
npm run dev
```

    Open http://localhost:5173/admin after running the dev server to access the admin UI.
