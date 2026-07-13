import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Le o .env da RAIZ do projeto (compartilhado com o backend), e nao um
  // .env dentro de frontend/. Apenas variaveis com prefixo VITE_ sao expostas
  // ao codigo do frontend; DB_* etc. ficam de fora do bundle (seguro).
  envDir: "..",
  server: {
    port: 5173,
    fs: {
      // node_modules (primereact/primeicons) fica na RAIZ do projeto (pai de
      // frontend/). Libera o dev server a servir os assets de la (ex.: a fonte
      // do PrimeIcons via /@fs/...), evitando 403 e icones como quadrados.
      allow: [".."],
    },
  },
});
