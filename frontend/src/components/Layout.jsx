import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { applyTheme, getStoredTheme } from "../theme/theme.js";

// Icone do PrimeIcons conforme o status da API.
const HEALTH_ICON = {
  online: "pi pi-check-circle",
  degradado: "pi pi-exclamation-triangle",
  offline: "pi pi-times-circle",
  checando: "pi pi-spin pi-spinner",
};

export default function Layout({ children }) {
  const [health, setHealth] = useState("checando");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");
  const [isDark, setIsDark] = useState(() => getStoredTheme() === "dark");

  // Aplica e persiste o tema (troca o href do #theme-link do PrimeReact).
  useEffect(() => {
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Verifica a saude da API periodicamente.
  useEffect(() => {
    let alive = true;
    const check = () =>
      api
        .health()
        .then((h) => alive && setHealth(h.status === "ok" ? "online" : "degradado"))
        .catch(() => alive && setHealth("offline"));
    check();
    const t = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <div className="app-shell">
      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-toggle-row">
          <button
            className="icon-btn sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Maximizar" : "Minimizar"}
            aria-label={collapsed ? "Maximizar menu" : "Minimizar menu"}
          >
            <i className="pi pi-chevron-left" />
          </button>
        </div>

        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">OP</span>
            <div className="brand-text">
              <strong>Cadastro Positivo</strong>
              <small>Lei 12.414/2011</small>
            </div>
          </div>
        </div>

        <nav className="nav">
          <a href="#" className="nav-item active" aria-current="page">
            <span className="nav-icon">
              <i className="pi pi-building" />
            </span>
            <span className="label">Fonte Principal</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Tema claro" : "Tema escuro"}
            aria-label="Alternar tema"
          >
            <span className="nav-icon">
              <i className={isDark ? "pi pi-sun" : "pi pi-moon"} />
            </span>
            <span className="label">{isDark ? "Tema claro" : "Tema escuro"}</span>
          </button>

          <div className={`health health-${health}`} title={`Backend: ${health}`}>
            <i className={`health-icon ${HEALTH_ICON[health]}`} />
            <span className="label">Backend: {health}</span>
          </div>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
