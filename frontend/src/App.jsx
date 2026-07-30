import { useState } from "react";
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

export default function App() {
  const [page, setPage] = useState("fonteprincipal");
  const Page = PAGES[page] ?? FontePrincipal;

  return (
    <PrimeReactProvider>
      <Layout page={page} onNavigate={setPage}>
        <Page />
      </Layout>
    </PrimeReactProvider>
  );
}
