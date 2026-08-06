# Frontend Template

Base React + Vite + PrimeReact starter: a loading splash screen and a
collapsible sidebar layout with dark/light theming and mobile drawer support.
Copy this folder as the starting point for a new project.

## Stack

- React 19 + Vite 7
- react-router-dom for routing
- PrimeReact / PrimeIcons for the theme and UI components

## What's included

- **Loading splash** ([index.html](index.html) + [src/main.jsx](src/main.jsx)) —
  an inline, dependency-free splash shown instantly on first paint, faded out
  once React has mounted.
- **Sidebar layout** ([src/presentation/components/Layout.jsx](src/presentation/components/Layout.jsx)) —
  collapsible desktop rail, mobile top bar + slide-in drawer, dark/light theme
  toggle. Persisted to `localStorage` (collapse state, theme).
- **Theming** ([src/presentation/assets/theme.js](src/presentation/assets/theme.js)) —
  swaps a `<link>` href between `theme-light.css` / `theme-dark.css` (PrimeReact
  Lara Blue) so switching themes needs no reload.
- **Routing skeleton** ([src/presentation/routes/app_router.jsx](src/presentation/routes/app_router.jsx)) —
  two sample routes (`Home`, `Settings`) showing the sidebar's active-link
  state.

## Using this as a base

1. Copy this folder into your new project and rename it.
2. Update `<title>` in [index.html](index.html) and `APP_NAME` in
   [Layout.jsx](src/presentation/components/Layout.jsx).
3. Edit `NAV_ITEMS` in [Layout.jsx](src/presentation/components/Layout.jsx) to
   match your app's sections — each entry needs a matching `<Route>` in
   [app_router.jsx](src/presentation/routes/app_router.jsx).
4. Replace [home.jsx](src/presentation/pages/home.jsx) /
   [settings.jsx](src/presentation/pages/settings.jsx) with real pages, or
   delete `settings.jsx` if you don't need a second route.
5. `npm install && npm run dev`.

## Notes

- No backend coupling: unlike a project wired to a specific API, this
  template ships with no HTTP client or env-var requirements. Add your own
  data layer (e.g. an `infrastructure/` folder with an API client) as needed.
- `vite.config.js` defaults to `localhost:5173`; override via `FRONTEND_HOST`
  / `FRONTEND_PORT` env vars if needed.
