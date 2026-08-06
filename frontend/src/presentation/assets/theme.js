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

export function applyTheme(theme) {
  const link = document.getElementById("theme-link");
  if (!link) return;

  const href = theme === "dark" ? darkThemeUrl : lightThemeUrl;
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href);
  }

  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignore persistence errors (e.g. storage disabled) */
  }
}
