import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { api, ApiError } from "../api/client.js";
import { LAYOUTS, LAYOUT_OPTIONS, layoutLabel } from "../config/execucoes.js";
import { formatDateTime } from "../utils/format.js";
import {
  SectionHead,
  FieldsGrid,
  emptyItem,
  toList,
  buildPayload,
} from "../components/FormSection.jsx";

// Recurso da API (backend: presentation/router/execucao.py).
const RESOURCE = "execucoes";

// Campos obrigatorios ainda em branco (usado ao iniciar).
function faltandoObrigatorios(fields, values) {
  return fields.filter((f) => f.required && !String(values[f.name] ?? "").trim());
}

export default function Execucoes() {
  const [execucoes, setExecucoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executandoLayout, setExecutandoLayout] = useState(null); // leiaute em execucao no momento
  const [baixandoId, setBaixandoId] = useState(null);
  const [error, setError] = useState(null);

  // Leiaute com o formulario de parametros aberto (so os que tem campos proprios).
  const [configurando, setConfigurando] = useState(null);
  const [params, setParams] = useState({});

  const toast = useRef(null);

  // Busca o historico de execucoes.
  const loadExecucoes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list(RESOURCE);
      setExecucoes(toList(data));
    } catch (err) {
      setExecucoes([]);
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as execuções. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExecucoes();
  }, [loadExecucoes]);

  // Abre o formulario de parametros de um leiaute (so os que tem campos proprios).
  const abrirConfiguracao = (layoutValue) => {
    setError(null);
    setConfigurando(layoutValue);
    setParams(emptyItem(LAYOUTS[layoutValue].fields));
  };

  const cancelarConfiguracao = () => {
    setError(null);
    setConfigurando(null);
  };

  const setField = (name, value) => {
    setParams((p) => ({ ...p, [name]: value }));
  };

  // Inicia a geracao de um leiaute da lista a partir dos dados ja cadastrados.
  const iniciar = async (layoutValue) => {
    const campos = LAYOUTS[layoutValue].fields;
    const valores = configurando === layoutValue ? params : {};
    const faltando = faltandoObrigatorios(campos, valores);
    if (faltando.length) {
      setError(`Preencha os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}.`);
      return;
    }

    setExecutandoLayout(layoutValue);
    setError(null);
    try {
      const payload = { layout: layoutValue, parametros: buildPayload(campos, valores) };
      const rec = await api.create(RESOURCE, payload);
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a execução realizada.");
      }
      setConfigurando(null);
      await loadExecucoes();
      toast.current?.show({
        severity: "success",
        summary: "Execução concluída",
        detail: rec.caminho_salvo
          ? `Arquivo ${rec.nome_arquivo} gerado e salvo em ${rec.caminho_salvo}.`
          : `Arquivo ${rec.nome_arquivo} gerado com sucesso. Configure o diretório de salvamento em Configurações para gravá-lo automaticamente em disco.`,
        life: 4000,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao iniciar a execução. Verifique o backend.");
    } finally {
      setExecutandoLayout(null);
    }
  };

  // Baixa o arquivo gerado numa execucao ja registrada no historico.
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
          readonlyTag={false}
          actions={<></>}
          counter={`${LAYOUT_OPTIONS.length} ${LAYOUT_OPTIONS.length === 1 ? "leiaute" : "leiautes"}`}
        />
        <div className="fp-section-body">
          <DataTable
            value={LAYOUT_OPTIONS}
            dataKey="value"
            size="small"
            stripedRows
            emptyMessage="Nenhum leiaute disponível."
            className="fp-table"
            expandedRows={configurando ? { [configurando]: true } : {}}
            rowExpansionTemplate={(row) => (
              <FieldsGrid
                idPrefix={`execucao-${row.value}`}
                fields={LAYOUTS[row.value].fields}
                values={params}
                editing
                onChange={setField}
              />
            )}
          >
            <Column field="label" header="Leiaute" />
            <Column
              header="Ações"
              style={{ width: "100px" }}
              body={(row) => {
                const campos = LAYOUTS[row.value].fields;
                const temCampos = campos.length > 0;
                const aberto = configurando === row.value;
                const rodando = executandoLayout === row.value;
                const bloqueado = executandoLayout != null;

                if (temCampos && aberto) {
                  return (
                    <div className="fp-row-actions">
                      <Button
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        onClick={cancelarConfiguracao}
                        disabled={rodando}
                        aria-label={`Cancelar configuração da execução de ${row.label}`}
                      />
                      <Button
                        icon={rodando ? "pi pi-spin pi-spinner" : "pi pi-play"}
                        text
                        rounded
                        onClick={() => iniciar(row.value)}
                        disabled={rodando}
                        aria-label={`Iniciar execução de ${row.label}`}
                      />
                    </div>
                  );
                }

                if (temCampos) {
                  return (
                    <Button
                      icon="pi pi-cog"
                      text
                      rounded
                      onClick={() => abrirConfiguracao(row.value)}
                      disabled={bloqueado}
                      aria-label={`Configurar execução de ${row.label}`}
                    />
                  );
                }

                return (
                  <Button
                    icon={rodando ? "pi pi-spin pi-spinner" : "pi pi-play"}
                    text
                    rounded
                    onClick={() => iniciar(row.value)}
                    disabled={bloqueado}
                    aria-label={`Iniciar execução de ${row.label}`}
                  />
                );
              }}
            />
          </DataTable>
        </div>
      </div>

      {/* 2 - Historico de execucoes */}
      <div className="fp-section">
        <SectionHead
          n={2}
          icon="pi pi-list"
          title="Execuções Realizadas"
          counter={`${execucoes.length} ${execucoes.length === 1 ? "execução" : "execuções"}`}
          actions={
            <Button
              className="fp-icon-btn"
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
              outlined
              onClick={loadExecucoes}
              disabled={loading}
              aria-label="Recarregar"
            />
          }
        />
        <div className="fp-section-body">
          <DataTable
            value={execucoes}
            loading={loading}
            loadingIcon="pi pi-spin pi-spinner"
            dataKey="id"
            size="small"
            stripedRows
            paginator={execucoes.length > 10}
            rows={10}
            emptyMessage="Nenhuma execução realizada."
            className="fp-table"
          >
            <Column field="id" header="Id" style={{ width: "80px" }} />
            <Column field="layout" header="Leiaute" body={(row) => layoutLabel(row.layout)} />
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
