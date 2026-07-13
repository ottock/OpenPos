import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// CSS base do PrimeReact + fonte de icones (PrimeIcons). Importados de forma
// estatica para o Vite empacotar/servir as fontes corretamente (dev e build).
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from "./App.jsx";
import { applyTheme, getStoredTheme } from "./theme/theme.js";
import "./index.css";

// Injeta o tema salvo (claro/escuro) antes de renderizar.
applyTheme(getStoredTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
