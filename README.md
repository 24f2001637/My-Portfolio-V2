# Sahil Bind - Developer Portfolio

A modern, highly customizable personal portfolio and blog built with React, Vite, and Firebase. Designed to showcase projects, writings, and resources with a clean, minimalist aesthetic.

## Features
- **Dynamic Content:** Projects, Blogs, and Resources are pulled in real-time from Firebase Firestore.
- **Admin Dashboard:** A secure, built-in `/admin` route allows for full content management (CRUD operations) and portfolio customization without touching the code.
- **Dark Mode:** Seamless light/dark mode toggling using a custom global state.
- **Command Palette:** A ⌘K / Ctrl+K search palette to quickly navigate the site.
- **Responsive Design:** Fully responsive layout built with Tailwind CSS.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend/Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google Sign-In)
- **Routing:** React Router DOM
- **SEO:** React Helmet Async

## Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your Firebase project and add your credentials to `firebase-applet-config.json`.
3. Start the development server:
   ```bash
   npm run dev
   ```

## License
MIT License - Feel free to use this as inspiration for your own portfolio!
