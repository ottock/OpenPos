import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { api, ApiError } from "../../infrastructure/api/client.js";
import { formatDateTime } from "../../utils/format.js";
import { SectionHead, toList } from "../components/FormSection.jsx";

// Recurso da API (backend: presentation/router/acpo109.py).
const RESOURCE = "acpo109";

// Execucoes que podem ser disparadas a partir desta janela.
const EXECUCOES_DISPONIVEIS = [{ id: "acpo109", nome: "ACPO109 - Envio de Configuração" }];

export default function Execucoes() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [resetando, setResetando] = useState(false);
  const [baixandoId, setBaixandoId] = useState(null);
  const [error, setError] = useState(null);

  const toast = useRef(null);

  // Busca o historico de geracoes do ACPO109.
  const loadHistorico = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list(RESOURCE);
      setHistorico(toList(data));
    } catch (err) {
      setHistorico([]);
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar o histórico. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount idiom
    loadHistorico();
  }, [loadHistorico]);

  // Gera o ACPO109 a partir dos dados ja cadastrados (nenhum dado e digitado aqui).
  const gerar = async () => {
    setGerando(true);
    setError(null);
    try {
      const rec = await api.create(`${RESOURCE}/gerar`, {});
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a geração realizada.");
      }
      await loadHistorico();
      toast.current?.show({
        severity: "success",
        summary: "ACPO109 gerado",
        detail: rec.caminho_salvo
          ? `Arquivo ${rec.nome_arquivo} gerado e salvo em ${rec.caminho_salvo}.`
          : `Arquivo ${rec.nome_arquivo} gerado com sucesso. Configure o diretório de salvamento em Configurações para gravá-lo automaticamente em disco.`,
        life: 4000,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao gerar o ACPO109. Verifique o backend.");
    } finally {
      setGerando(false);
    }
  };

  // Baixa o arquivo gerado numa geracao ja registrada no historico.
  const baixar = (row) => {
    setBaixandoId(row.id);
    try {
      const blob = new Blob([row.conteudo_arquivo], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBaixandoId(null);
    }
  };

  const resetHistorico = async () => {
    setResetando(true);
    setError(null);
    try {
      await api.remove(RESOURCE);
      await loadHistorico();
      toast.current?.show({
        severity: "success",
        summary: "Histórico resetado",
        detail: "As execuções realizadas foram removidas.",
        life: 2500,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao resetar o histórico. Verifique o backend.");
    } finally {
      setResetando(false);
    }
  };

  return (
    <section className="page fp-page">
      <Toast ref={toast} position="bottom-right" />

      <header className="fp-header">
        <span className="fp-eyebrow">Cadastro Positivo</span>
        <h1>
          <i className="pi pi-play-circle" />
          Execuções
        </h1>
      </header>

      {error && (
        <div className="form-error">
          <Message severity="error" text={error} />
        </div>
      )}

      {/* 1 - Execucoes disponiveis */}
      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-play"
          title="Execuções Disponíveis"
          counter={`${EXECUCOES_DISPONIVEIS.length} ${EXECUCOES_DISPONIVEIS.length === 1 ? "execução" : "execuções"}`}
          readonlyTag={false}
          actions={<></>}
        />
        <div className="fp-section-body">
          <DataTable
            value={EXECUCOES_DISPONIVEIS}
            dataKey="id"
            size="small"
            stripedRows
            emptyMessage="Nenhuma execução disponível."
            className="fp-table"
          >
            <Column field="nome" header="Execução" />
            <Column
              header="Ações"
              style={{ width: "100px" }}
              body={(row) => (
                <Button
                  icon={gerando ? "pi pi-spin pi-spinner" : "pi pi-play"}
                  text
                  rounded
                  onClick={gerar}
                  disabled={gerando}
                  aria-label={`Executar ${row.nome}`}
                />
              )}
            />
          </DataTable>
        </div>
      </div>

      {/* 2 - Historico de geracoes */}
      <div className="fp-section">
        <SectionHead
          n={2}
          icon="pi pi-list"
          title="Execuções Realizadas"
          counter={`${historico.length} ${historico.length === 1 ? "execução" : "execuções"}`}
          actions={
            <>
              <Button
                className="fp-icon-btn"
                icon={resetando ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                outlined
                severity="danger"
                onClick={resetHistorico}
                disabled={loading || resetando || historico.length === 0}
                aria-label="Resetar execuções"
                title="Resetar execuções"
              />
              <Button
                className="fp-icon-btn"
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
                outlined
                onClick={loadHistorico}
                disabled={loading || resetando}
                aria-label="Recarregar"
              />
            </>
          }
        />
        <div className="fp-section-body">
          <DataTable
            value={historico}
            loading={loading}
            loadingIcon="pi pi-spin pi-spinner"
            dataKey="id"
            size="small"
            stripedRows
            paginator={historico.length > 10}
            rows={10}
            emptyMessage="Nenhuma execução realizada."
            className="fp-table"
          >
            <Column field="id" header="Id" style={{ width: "80px" }} />
            <Column field="layout" header="Leiaute" />
            <Column field="nome_arquivo" header="Arquivo" />
            <Column field="criado_em" header="Executada em" body={(row) => formatDateTime(row.criado_em)} style={{ width: "180px" }} />
            <Column
              header="Ações"
              style={{ width: "100px" }}
              body={(row) => (
                <Button
                  icon={baixandoId === row.id ? "pi pi-spin pi-spinner" : "pi pi-download"}
                  text
                  rounded
                  onClick={() => baixar(row)}
                  disabled={baixandoId != null}
                  aria-label={`Baixar arquivo da execução ${row.id}`}
                />
              )}
            />
          </DataTable>
        </div>
      </div>
    </section>
  );
}
