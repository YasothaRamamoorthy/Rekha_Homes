# Keerthans Building Showcase

A React website that highlights building projects, architecture services, and construction features.

## Setup

Install dependencies:

```bash
cd /Users/yaso/Desktop/vscode/Keerthans_website
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local URL shown by Vite.

## Build

```bash
npm run build
```

## Admin Image Upload

An admin UI is available at `/admin` for uploading images used in the hover galleries.

- Default password: `admin123` (change in `src/Admin.jsx` for production)
- Uploaded images are stored in the project at `public/uploads/<category>/` so they persist across restarts.
- The upload API server runs on port `5174` and is proxied from the frontend dev server.

Run the frontend and backend together with:

```bash
npm run dev
```

    Open http://localhost:5173/admin after running the dev server to access the admin UI.
