// Theme stylesheets are imported with `?url` so Vite bundles them (resolving the
// `@import "primereact/..."` specifiers) and emits hashed CSS assets. The
// resolved URLs work both in dev and in the production build.
import lightThemeUrl from "./theme-light.css?url";
import darkThemeUrl from "./theme-dark.css?url";

export const THEME_HREFS = { light: lightThemeUrl, dark: darkThemeUrl };

export function getStoredTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

// Sets the href of both theme <link> tags (if not already set) so both
// stylesheets are fetched up front, once, regardless of which is active.
function ensureThemeLinksLoaded() {
  const lightLink = document.getElementById("theme-link-light");
  const darkLink = document.getElementById("theme-link-dark");
  if (lightLink && !lightLink.getAttribute("href")) lightLink.setAttribute("href", lightThemeUrl);
  if (darkLink && !darkLink.getAttribute("href")) darkLink.setAttribute("href", darkThemeUrl);
  return { lightLink, darkLink };
}

export function applyTheme(theme) {
  const { lightLink, darkLink } = ensureThemeLinksLoaded();
  if (!lightLink || !darkLink) return;

  // Both stylesheets are already loaded, so this only flips which one the
  // "media" query matches - a synchronous, instant swap (no network
  // round-trip, no re-parse) so every component picks up the new theme
  // variables in the same paint. (Toggling the `disabled` IDL property
  // instead can make the browser drop a sheet that hasn't finished loading
  // yet and never re-apply it, so `media` is the reliable knob here.)
  lightLink.media = theme === "light" ? "all" : "not all";
  darkLink.media = theme === "dark" ? "all" : "not all";

  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignore persistence errors (e.g. storage disabled) */
  }
}
