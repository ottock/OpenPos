// imports
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "primereact/button";

// project imports
import { applyTheme, getStoredTheme } from "../assets/theme.js";
import { api } from "../../infrastructure/api/client.js";

// Add/remove entries here to change the sidebar's navigation items. `to` must
// match a <Route path> registered in app_router.jsx.
const NAV_ITEMS = [
  { key: "fonte-principal", label: "Fonte Principal", icon: "pi pi-building", to: "/fonte-principal" },
  { key: "produtos", label: "Produtos", icon: "pi pi-box", to: "/produtos" },
  { key: "modalidades", label: "Modalidades", icon: "pi pi-tags", to: "/modalidades" },
  { key: "execucoes", label: "Execuções", icon: "pi pi-play-circle", to: "/execucoes" },
  { key: "configuracoes", label: "Configuração", icon: "pi pi-cog", to: "/configuracoes" },
];

const APP_NAME = "Cadastro Positivo";
const MOBILE_MEDIA_QUERY = "(max-width: 820px)";

export default function Layout({ children }) {
  useLocation(); // re-render on route change so the top-progress sweep replays

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => getStoredTheme() === "dark");
  const [health, setHealth] = useState("checando");

  /* Theme */
  useEffect(() => {
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  /* Backend health polling */
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

  /* Collapse preference persistence */
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore persistence errors (e.g. storage disabled) */
    }
  }, [collapsed]);

  /* Mobile viewport tracking + auto-close drawer when back to desktop */
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  /* Drawer: Esc closes it, body scroll locked while open */
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("drawer-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("drawer-open");
    };
  }, [mobileOpen]);

  const dockHidden = isMobile && !mobileOpen;

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <Button
          icon="pi pi-bars"
          text
          rounded
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileOpen((v) => !v)}
        />
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-text">POS</span>
        </div>
        <span className="mobile-topbar-title">{APP_NAME}</span>
      </div>

      <div
        className={`drawer-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className={`sidebar-dock ${mobileOpen ? "open" : ""}`} aria-hidden={dockHidden}>
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="rail-brand">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-text">POS</span>
            </div>
          </div>

          <nav className="rail-nav" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => `rail-item ${isActive ? "active" : ""}`}
                aria-current={undefined}
                onClick={() => setMobileOpen(false)}
                tabIndex={dockHidden ? -1 : 0}
              >
                <i className={`rail-item-icon ${item.icon}`} />
                {!collapsed && <span className="rail-item-label">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="rail-footer">
            <Button
              icon={isDark ? "pi pi-moon" : "pi pi-sun"}
              text
              rounded
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setIsDark((v) => !v)}
              tabIndex={dockHidden ? -1 : 0}
            />
            <div
              className={`rail-util rail-health health-${health}`}
              title={`Backend: ${health}`}
              aria-label={`Backend: ${health}`}
            >
              <span className="health-dot" />
            </div>
            <Button
              icon={collapsed ? "pi pi-angle-double-right" : "pi pi-angle-double-left"}
              text
              rounded
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              tabIndex={dockHidden ? -1 : 0}
            />
          </div>
        </div>
      </div>

      <div className="content">{children}</div>
    </div>
  );
}
