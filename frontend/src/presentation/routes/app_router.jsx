// imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// project imports
import FontePrincipal from "../pages/fonte-principal.jsx";
import Produtos from "../pages/produtos.jsx";
import Modalidades from "../pages/modalidades.jsx";
import Execucoes from "../pages/execucoes.jsx";
import Configuracoes from "../pages/configuracoes.jsx";
import Layout from "../components/Layout.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/fonte-principal" replace />} />
          <Route path="/fonte-principal" element={<FontePrincipal />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/modalidades" element={<Modalidades />} />
          <Route path="/execucoes" element={<Execucoes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
