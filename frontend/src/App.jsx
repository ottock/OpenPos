import { useEffect, useRef, useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import Layout from "./components/Layout.jsx";
import FontePrincipal from "./pages/FontePrincipal.jsx";
import Produto from "./pages/Produto.jsx";
import Modalidade from "./pages/Modalidade.jsx";

// Paginas disponiveis; a chave casa com o id dos itens do menu (Layout.jsx).
const PAGES = {
  fonteprincipal: FontePrincipal,
  produto: Produto,
  modalidade: Modalidade,
};

// Duracao da barra de carregamento exibida na troca de pagina (acompanha a
// animacao de entrada das secoes, ver "form-mode-in" em index.css).
const NAV_LOADING_MS = 420;

export default function App() {
  const [page, setPage] = useState("fonteprincipal");
  const [navLoading, setNavLoading] = useState(false);
  const navTimer = useRef(null);
  const Page = PAGES[page] ?? FontePrincipal;

  // Mostra a barra de carregamento a cada troca de pagina (inclusive a
  // primeira, enquanto a pagina inicial busca seus dados).
  useEffect(() => {
    setNavLoading(true);
    navTimer.current = setTimeout(() => setNavLoading(false), NAV_LOADING_MS);
    return () => clearTimeout(navTimer.current);
  }, [page]);

  return (
    <PrimeReactProvider>
      {navLoading && <div className="top-loading-bar" aria-hidden="true" />}
      <Layout page={page} onNavigate={setPage}>
        <Page />
      </Layout>
    </PrimeReactProvider>
  );
}
