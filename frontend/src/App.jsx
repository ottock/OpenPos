import { PrimeReactProvider } from "primereact/api";
import Layout from "./components/Layout.jsx";
import FontePrincipal from "./pages/FontePrincipal.jsx";

export default function App() {
  return (
    <PrimeReactProvider>
      <Layout>
        <FontePrincipal />
      </Layout>
    </PrimeReactProvider>
  );
}
