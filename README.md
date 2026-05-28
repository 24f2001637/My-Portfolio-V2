# Sahil Bind - Developer Portfolio

A modern personal portfolio and blog built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

## Overview

This project powers a developer portfolio with dynamic sections for projects, writings, and resources.  
Content is managed through Firebase and can be updated via a built-in admin route.

## Features

- Dynamic content from Firebase Firestore (Projects, Writings, Resources)
- Admin dashboard at `/admin` for content management
- Light and dark mode support
- Command palette (`⌘K` / `Ctrl+K`) for quick navigation
- Responsive UI with Tailwind CSS
- SEO metadata handling and sitemap generation

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Firebase Firestore, Firebase Auth, React Router DOM, React Helmet Async, Lucide React, Express, Google GenAI SDK

## Prerequisites

- Node.js (LTS recommended)
- npm
- Firebase project credentials

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Firebase:
   - Add your Firebase values to `firebase-applet-config.json`
   - Optionally copy `.env.example` to `.env` and fill required values

3. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start local dev server on port 3000
- `npm run build` - Generate sitemap and build production assets
- `npm run preview` - Preview production build locally
- `npm run lint` - Run TypeScript type-check (`tsc --noEmit`)
- `npm run clean` - Remove build artifacts

## Project Structure

- `src/pages` - Route-level pages (Home, Projects, Writings, etc.)
- `src/components` - Reusable UI and layout components
- `src/lib` - Shared utilities and Firebase setup
- `scripts/generate-sitemap.js` - Sitemap generation script used during build
- `public` - Static assets (`robots.txt`, `sitemap.xml`, favicon)

## Deployment

The project includes `vercel.json` for Vercel deployment and Firebase-related config files for backend services.

## License

MIT License — feel free to use this as inspiration for your own portfolio.
