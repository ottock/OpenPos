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

const DEFAULT_LAYOUT = LAYOUT_OPTIONS[0]?.value;

// Campo sintetico (nao pertence a nenhum leiaute) usado para escolher qual
// gerador rodar; os campos abaixo dele mudam conforme o leiaute selecionado.
const LAYOUT_FIELD = {
  name: "layout",
  label: "Leiaute",
  type: "select",
  options: LAYOUT_OPTIONS,
  required: true,
  span: 12,
};

// Campos obrigatorios ainda em branco (usado ao executar).
function faltandoObrigatorios(fields, values) {
  return fields.filter((f) => f.required && !String(values[f.name] ?? "").trim());
}

export default function Execucoes() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [params, setParams] = useState(() => emptyItem(LAYOUTS[DEFAULT_LAYOUT].fields));
  const [execucoes, setExecucoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executando, setExecutando] = useState(false);
  const [baixandoId, setBaixandoId] = useState(null);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const snapshot = useRef(null); // copia da secao 1 ao entrar em edicao (para cancelar)
  const toast = useRef(null);

  const camposAtuais = LAYOUTS[layout].fields;
  const valoresAtuais = { layout, ...params };

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

  // Troca de leiaute reinicia os campos do envelope; demais campos so mudam o proprio valor.
  const setField = (name, value) => {
    if (name === "layout") {
      setLayout(value);
      setParams(emptyItem(LAYOUTS[value].fields));
      return;
    }
    setParams((p) => ({ ...p, [name]: value }));
  };

  const startEdit = () => {
    setError(null);
    snapshot.current = { layout, params };
    setEditing(true);
  };

  const cancelEdit = () => {
    setError(null);
    const snap = snapshot.current;
    if (snap) {
      setLayout(snap.layout);
      setParams(snap.params);
    }
    setEditing(false);
  };

  // Executa a geracao do leiaute selecionado a partir dos dados ja cadastrados.
  const executar = async () => {
    const faltando = faltandoObrigatorios([LAYOUT_FIELD, ...camposAtuais], valoresAtuais);
    if (faltando.length) {
      setError(`Preencha os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}.`);
      return;
    }

    setExecutando(true);
    setError(null);
    try {
      const payload = { layout, parametros: buildPayload(camposAtuais, params) };
      const rec = await api.create(RESOURCE, payload);
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a execução realizada.");
      }
      setParams(emptyItem(camposAtuais));
      setEditing(false);
      await loadExecucoes();
      toast.current?.show({
        severity: "success",
        summary: "Execução concluída",
        detail: `Arquivo ${rec.nome_arquivo} gerado com sucesso.`,
        life: 3000,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao executar. Verifique o backend.");
    } finally {
      setExecutando(false);
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

      {/* 1 - Nova execucao */}
      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-play"
          title="Nova Execução"
          readonlyTag={false}
          editing={editing}
          saving={executando}
          onEdit={startEdit}
          onSave={executar}
          onCancel={cancelEdit}
          disabled={loading}
        />
        <div className="fp-section-body">
          <FieldsGrid
            idPrefix="execucao"
            fields={[LAYOUT_FIELD, ...camposAtuais]}
            values={valoresAtuais}
            editing={editing}
            onChange={setField}
          />
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
