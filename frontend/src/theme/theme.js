// Importa o CSS dos temas Lara (claro/escuro) como string via `?inline`. O Vite
// processa e resolve tudo (funciona no dev e no build), e trocamos o tema em
// runtime injetando a string num <style id="theme-style">.
import lightTheme from "primereact/resources/themes/lara-light-blue/theme.css?inline";
import darkTheme from "primereact/resources/themes/lara-dark-blue/theme.css?inline";

export function getStoredTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  let styleEl = document.getElementById("theme-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "theme-style";
    // Insere antes do bundle do app para que o index.css tenha prioridade.
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = theme === "dark" ? darkTheme : lightTheme;

  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignora erros de persistencia (ex.: storage desabilitado) */
  }
}
