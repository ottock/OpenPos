import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { api, ApiError } from "../../infrastructure/api/client.js";
import {
  SectionHead,
  FieldsGrid,
  renderInput,
  emptyItem,
  toList,
  buildPayload,
} from "../components/FormSection.jsx";

// Recurso da API (backend: presentation/router/modalidade.py).
const RESOURCE = "modalidade";

// ---------------------------------------------------------------------------
// Campos do cadastro. span = largura no grid de 12 colunas.
// ---------------------------------------------------------------------------
const MODALIDADE_FIELDS = [
  { name: "nome", label: "Modalidade", required: true, span: 4, maxLength: 255, placeholder: "Cartão de crédito" },
  { name: "descricao", label: "Descrição", span: 5, maxLength: 500, placeholder: "Descrição da modalidade" },
  { name: "tipo_reporte", label: "Tipo de Reporte", required: true, span: 3, maxLength: 100, placeholder: "Rotativo" },
];

const byName = (name) => MODALIDADE_FIELDS.find((f) => f.name === name);

// Campos obrigatorios ainda em branco (usado no cadastro e na edicao da linha).
function faltandoObrigatorios(values) {
  return MODALIDADE_FIELDS.filter((f) => f.required && !String(values[f.name] ?? "").trim());
}

export default function Modalidade() {
  const [form, setForm] = useState(() => emptyItem(MODALIDADE_FIELDS));
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false); // secao 1 em modo de edicao
  const [editingRows, setEditingRows] = useState({}); // linhas em edicao no card 2
  const snapshot = useRef(null); // copia da secao 1 ao entrar em edicao (para cancelar)
  const toast = useRef(null);

  const emEdicaoNaTabela = Object.keys(editingRows).length > 0;

  // Busca a lista de modalidades cadastradas.
  const loadModalidades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list(RESOURCE);
      setModalidades(toList(data));
    } catch (err) {
      setModalidades([]);
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as modalidades. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount idiom
    loadModalidades();
  }, [loadModalidades]);

  const setField = (name, val) => setForm((v) => ({ ...v, [name]: val }));

  // ---- Secao 1: cadastro de uma nova modalidade ----------------------------

  // Abre a edicao guardando uma copia para eventual cancelamento.
  const startEdit = () => {
    setError(null);
    snapshot.current = form;
    setEditing(true);
  };

  // Cancela: restaura a copia guardada e sai do modo de edicao.
  const cancelEdit = () => {
    setError(null);
    setForm(snapshot.current ?? emptyItem(MODALIDADE_FIELDS));
    setEditing(false);
  };

  // Cadastra a modalidade e recarrega a lista.
  const cadastrar = async () => {
    const faltando = faltandoObrigatorios(form);
    if (faltando.length) {
      setError(`Preencha os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const rec = await api.create(RESOURCE, buildPayload(MODALIDADE_FIELDS, form));
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a modalidade salva.");
      }
      setForm(emptyItem(MODALIDADE_FIELDS));
      setEditing(false);
      await loadModalidades();
      toast.current?.show({
        severity: "success",
        summary: "Salvo",
        detail: `Modalidade "${rec.nome}" cadastrada.`,
        life: 2500,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Secao 2: edicao na propria linha da tabela --------------------------

  // Editor de celula: reaproveita os mesmos inputs do formulario.
  const cellEditor = (f) => (options) =>
    renderInput(
      f,
      `modalidade-${f.name}-${options.rowIndex}`,
      options.value,
      (_name, val) => options.editorCallback(val),
    );

  // Bloqueia a saida do modo de edicao quando falta um campo obrigatorio.
  const rowEditValidator = (row) => {
    const faltando = faltandoObrigatorios(row);
    if (faltando.length) {
      setError(`Preencha os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}.`);
      return false;
    }
    setError(null);
    return true;
  };

  // Confirma a edicao da linha: envia o PUT e recarrega a lista.
  const onRowEditComplete = async ({ newData }) => {
    setSubmitting(true);
    setError(null);
    try {
      const rec = await api.update(RESOURCE, newData.id, buildPayload(MODALIDADE_FIELDS, newData));
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a modalidade salva.");
      }
      await loadModalidades();
      toast.current?.show({
        severity: "success",
        summary: "Salvo",
        detail: `Modalidade "${rec.nome}" atualizada.`,
        life: 2500,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
      await loadModalidades();
    } finally {
      setSubmitting(false);
    }
  };

  // Remove a modalidade (sem confirmacao) e recarrega a lista.
  const remover = async (row) => {
    setRemovendoId(row.id);
    setError(null);
    try {
      await api.remove(RESOURCE, row.id);
      await loadModalidades();
      toast.current?.show({ severity: "success", summary: "Excluída", detail: `Modalidade "${row.nome}" removida.`, life: 2500 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao excluir. Verifique o backend.");
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <section className="page fp-page">
      <Toast ref={toast} position="bottom-right" />

      <header className="fp-header">
        <span className="fp-eyebrow">Cadastro Positivo</span>
        <h1>
          <i className="pi pi-tags" />
          Modalidades
        </h1>
      </header>

      {error && (
        <div className="form-error">
          <Message severity="error" text={error} />
        </div>
      )}

      {/* 1 - Cadastro de uma nova modalidade */}
      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-plus-circle"
          title="Nova Modalidade"
          readonlyTag={false}
          editing={editing}
          saving={submitting}
          onEdit={startEdit}
          onSave={cadastrar}
          onCancel={cancelEdit}
          disabled={loading || emEdicaoNaTabela}
        />
        <div className="fp-section-body">
          <FieldsGrid
            idPrefix="modalidade"
            fields={MODALIDADE_FIELDS}
            values={form}
            editing={editing}
            onChange={setField}
          />
        </div>
      </div>

      {/* 2 - Modalidades cadastradas (edicao na propria linha) */}
      <div className="fp-section">
        <SectionHead
          n={2}
          icon="pi pi-list"
          title="Modalidades Cadastradas"
          counter={`${modalidades.length} ${modalidades.length === 1 ? "modalidade" : "modalidades"}`}
          actions={
            <Button
              className="fp-icon-btn"
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
              outlined
              onClick={loadModalidades}
              disabled={loading || emEdicaoNaTabela}
              aria-label="Recarregar"
            />
          }
        />
        <div className="fp-section-body">
          <DataTable
            value={modalidades}
            loading={loading}
            loadingIcon="pi pi-spin pi-spinner"
            dataKey="id"
            size="small"
            stripedRows
            paginator={modalidades.length > 10}
            rows={10}
            emptyMessage="Nenhuma modalidade cadastrada."
            className="fp-table"
            editMode="row"
            editingRows={editingRows}
            onRowEditChange={(e) => setEditingRows(e.data)}
            rowEditValidator={rowEditValidator}
            onRowEditComplete={onRowEditComplete}
            rowClassName={(row) => (editingRows[row.id] ? "fp-row-editing" : "")}
          >
            <Column field="id" header="Id" style={{ width: "80px" }} />
            <Column
              field="nome"
              header="Modalidade"
              editor={cellEditor(byName("nome"))}
            />
            <Column
              field="descricao"
              header="Descrição"
              body={(row) => row.descricao ?? "—"}
              editor={cellEditor(byName("descricao"))}
            />
            <Column
              field="tipo_reporte"
              header="Tipo de Reporte"
              style={{ width: "180px" }}
              editor={cellEditor(byName("tipo_reporte"))}
            />
            {/* Editar e excluir na mesma coluna: em edicao, os botoes do
                row editor do PrimeReact viram cancelar / salvar. */}
            <Column
              rowEditor
              header="Ações"
              style={{ width: "120px" }}
              body={(row, { rowEditor }) => (
                <div className="fp-row-actions">
                  {rowEditor.editing ? (
                    <>
                      <Button
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        onClick={rowEditor.onCancelClick}
                        disabled={submitting}
                        aria-label={`Cancelar edição da modalidade ${row.nome}`}
                      />
                      <Button
                        icon={submitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        text
                        rounded
                        onClick={rowEditor.onSaveClick}
                        disabled={submitting}
                        aria-label={`Salvar modalidade ${row.nome}`}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        severity="secondary"
                        onClick={rowEditor.onInitClick}
                        disabled={submitting || removendoId != null || emEdicaoNaTabela}
                        aria-label={`Editar modalidade ${row.nome}`}
                      />
                      <Button
                        icon={removendoId === row.id ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                        text
                        rounded
                        severity="danger"
                        onClick={() => remover(row)}
                        disabled={submitting || removendoId != null || emEdicaoNaTabela}
                        aria-label={`Excluir modalidade ${row.nome}`}
                      />
                    </>
                  )}
                </div>
              )}
            />
          </DataTable>
        </div>
      </div>
    </section>
  );
}
