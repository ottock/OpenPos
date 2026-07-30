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

// Itens do rail. O id casa com as paginas registradas em App.jsx.
// Um item pode ter "children" (mesmo formato, sem icone): nesse caso ele nao
// navega, abre o painel de submenu ao lado do rail.
const NAV_ITEMS = [
  { id: "fonteprincipal", label: "Fonte Principal", icon: "pi pi-building" },
  { id: "produto", label: "Produtos", icon: "pi pi-box" },
  { id: "modalidade", label: "Modalidades", icon: "pi pi-tags" },
  { id: "execucoes", label: "Execuções", icon: "pi pi-play-circle" },
];

// Abaixo desta largura o dock deixa de ocupar espaco e vira um menu deslizante
// (drawer) sobre o conteudo. Casa com o @media do index.css.
const MOBILE_QUERY = "(max-width: 820px)";

export default function Layout({ children, page, onNavigate }) {
  const [health, setHealth] = useState("checando");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");
  const [isDark, setIsDark] = useState(() => getStoredTheme() === "dark");
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Id do item de rail cujo submenu esta aberto no painel.
  const [openGroup, setOpenGroup] = useState(null);

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

  // Acompanha a largura da janela; ao voltar para o desktop fecha o drawer.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setDrawerOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Com o drawer aberto: Esc fecha e o fundo nao rola.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && setDrawerOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const toggleTheme = () => setIsDark((v) => !v);

  // No desktop o botao do rodape recolhe/expande o rail; no mobile fecha o drawer.
  const onToggleClick = () => (isMobile ? setDrawerOpen(false) : setCollapsed((c) => !c));

  const navigate = (id) => {
    onNavigate?.(id);
    if (isMobile) setDrawerOpen(false);
  };

  // Item com sub-itens abre/fecha o painel; item simples navega direto.
  const onRailClick = (item) => {
    if (item.children?.length) {
      setOpenGroup((g) => (g === item.id ? null : item.id));
      return;
    }
    setOpenGroup(null);
    navigate(item.id);
  };

  const isItemActive = (item) =>
    page === item.id || item.children?.some((child) => child.id === page);

  const group = NAV_ITEMS.find((item) => item.id === openGroup && item.children?.length);

  return (
    <div className="app-shell">
      {/* Barra superior: aparece apenas em telas pequenas (via CSS). */}
      <header className="mobile-topbar">
        <button
          className="icon-btn topbar-menu-btn"
          onClick={() => setDrawerOpen(true)}
          title="Abrir menu"
          aria-label="Abrir menu"
          aria-expanded={drawerOpen}
        >
          <i className="pi pi-bars" />
        </button>
        <span className="brand-mark">OP</span>
        <strong className="topbar-title">Cadastro Positivo</strong>
      </header>

      {drawerOpen && (
        <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}

      <div
        className={`sidebar-dock${drawerOpen ? " open" : ""}`}
        aria-hidden={isMobile && !drawerOpen ? "true" : undefined}
      >
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="rail-brand">
            <span className="brand-mark" title="Cadastro Positivo - Lei 12.414/2011">
              OP
            </span>
          </div>

          <nav className="rail-nav">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`rail-item${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  aria-expanded={item.children?.length ? openGroup === item.id : undefined}
                  title={item.label}
                  onClick={() => onRailClick(item)}
                >
                  <i className={item.icon} />
                  <span className="rail-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="rail-footer">
            <button
              type="button"
              className={`rail-item${page === "configuracoes" ? " active" : ""}`}
              aria-current={page === "configuracoes" ? "page" : undefined}
              onClick={() => navigate("configuracoes")}
              title="Configuração"
              aria-label="Configuração"
            >
              <i className="pi pi-cog" />
              <span className="rail-label">Configuração</span>
            </button>

            <button
              type="button"
              className="rail-item"
              onClick={toggleTheme}
              title={isDark ? "Tema claro" : "Tema escuro"}
              aria-label="Alternar tema"
            >
              <i className={isDark ? "pi pi-sun" : "pi pi-moon"} />
              <span className="rail-label">Tema</span>
            </button>

            <div className={`rail-item rail-health health-${health}`} title={`Backend: ${health}`}>
              <i className={`health-icon ${HEALTH_ICON[health]}`} />
              <span className="rail-label">Backend</span>
            </div>

            <button
              type="button"
              className="rail-toggle"
              onClick={onToggleClick}
              title={isMobile ? "Fechar menu" : collapsed ? "Maximizar" : "Minimizar"}
              aria-label={isMobile ? "Fechar menu" : collapsed ? "Maximizar menu" : "Minimizar menu"}
            >
              <i className={isMobile ? "pi pi-times" : "pi pi-align-left"} />
            </button>
          </div>
        </aside>

        {group && (
          <nav className="sub-panel" aria-label={group.label}>
            <span className="sub-panel-title">{group.label}</span>
            {group.children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={`sub-item${page === child.id ? " active" : ""}`}
                aria-current={page === child.id ? "page" : undefined}
                onClick={() => navigate(child.id)}
              >
                {child.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      <main className="content">{children}</main>
    </div>
  );
}
