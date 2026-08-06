import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { api, ApiError } from "../../infrastructure/api/client.js";
import {
  SectionHead,
  FieldsGrid,
  BooleanTag,
  renderInput,
  emptyItem,
  toList,
  buildPayload,
} from "../components/FormSection.jsx";

// Recurso da API (backend: presentation/router/produto.py).
const RESOURCE = "produto";
// Recurso usado para popular o dropdown de modalidades (presentation/router/modalidade.py).
const MODALIDADE_RESOURCE = "modalidade";

// ---------------------------------------------------------------------------
// Campos do cadastro. span = largura no grid de 12 colunas.
// modalidadeOptions e montado a partir das modalidades cadastradas (ver estado
// "modalidades" no componente), por isso os campos sao gerados por funcao.
// ---------------------------------------------------------------------------
function buildProdutoFields(modalidadeOptions) {
  return [
    { name: "codigo", label: "Código", required: true, span: 3, maxLength: 10, placeholder: "0001", hint: "Até 10 caracteres. Reenviar o mesmo código atualiza o produto." },
    { name: "nome", label: "Nome", required: true, span: 6, maxLength: 255, placeholder: "Cartão de crédito" },
    {
      name: "modalidade_id",
      label: "Modalidade",
      type: "select",
      span: 3,
      options: modalidadeOptions,
      placeholder: modalidadeOptions.length ? "Selecione..." : "Nenhuma modalidade cadastrada",
      hint: modalidadeOptions.length ? "Opcional." : "Cadastre uma modalidade antes de vincular um produto.",
    },
    { name: "ativo", label: "Situação", type: "boolean", default: true, span: 3, trueLabel: "Ativo", falseLabel: "Inativo" },
  ];
}

export default function Produto() {
  const [modalidades, setModalidades] = useState([]);
  const modalidadeOptions = useMemo(
    () => modalidades.map((m) => ({ label: m.nome, value: m.id })),
    [modalidades],
  );
  const modalidadeNomePorId = useMemo(
    () => Object.fromEntries(modalidades.map((m) => [m.id, m.nome])),
    [modalidades],
  );
  const PRODUTO_FIELDS = useMemo(() => buildProdutoFields(modalidadeOptions), [modalidadeOptions]);
  const byName = (name) => PRODUTO_FIELDS.find((f) => f.name === name);

  // Campos obrigatorios ainda em branco (usado no cadastro e na edicao da linha).
  const faltandoObrigatorios = (values) =>
    PRODUTO_FIELDS.filter((f) => f.required && !String(values[f.name] ?? "").trim());

  const [form, setForm] = useState(() => emptyItem(PRODUTO_FIELDS));
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false); // secao 1 em modo de edicao
  const [editingRows, setEditingRows] = useState({}); // linhas em edicao no card 2
  const snapshot = useRef(null); // copia da secao 1 ao entrar em edicao (para cancelar)
  const toast = useRef(null);

  const emEdicaoNaTabela = Object.keys(editingRows).length > 0;

  // Busca a lista de produtos cadastrados.
  const loadProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list(RESOURCE);
      setProdutos(toList(data));
    } catch (err) {
      setProdutos([]);
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os produtos. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca as modalidades cadastradas para popular o dropdown.
  const loadModalidades = useCallback(async () => {
    try {
      const data = await api.list(MODALIDADE_RESOURCE);
      setModalidades(toList(data));
    } catch {
      setModalidades([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount idiom
    loadProdutos();
    loadModalidades();
  }, [loadProdutos, loadModalidades]);

  const setField = (name, val) => setForm((v) => ({ ...v, [name]: val }));

  // ---- Secao 1: cadastro de um novo produto -------------------------------

  // Abre a edicao guardando uma copia para eventual cancelamento.
  const startEdit = () => {
    setError(null);
    snapshot.current = form;
    setEditing(true);
  };

  // Cancela: restaura a copia guardada e sai do modo de edicao.
  const cancelEdit = () => {
    setError(null);
    setForm(snapshot.current ?? emptyItem(PRODUTO_FIELDS));
    setEditing(false);
  };

  // Cadastra o produto (upsert por código no backend) e recarrega a lista.
  const cadastrar = async () => {
    const faltando = faltandoObrigatorios(form);
    if (faltando.length) {
      setError(`Preencha os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const rec = await api.create(RESOURCE, buildPayload(PRODUTO_FIELDS, form));
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou o produto salvo.");
      }
      setForm(emptyItem(PRODUTO_FIELDS));
      setEditing(false);
      await loadProdutos();
      toast.current?.show({
        severity: "success",
        summary: "Salvo",
        detail: `Produto "${rec.nome}" cadastrado.`,
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
      `produto-${f.name}-${options.rowIndex}`,
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
      const rec = await api.update(RESOURCE, newData.id, buildPayload(PRODUTO_FIELDS, newData));
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou o produto salvo.");
      }
      await loadProdutos();
      toast.current?.show({
        severity: "success",
        summary: "Salvo",
        detail: `Produto "${rec.nome}" atualizado.`,
        life: 2500,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
      await loadProdutos();
    } finally {
      setSubmitting(false);
    }
  };

  // Remove o produto (sem confirmacao) e recarrega a lista.
  const remover = async (row) => {
    setRemovendoId(row.id);
    setError(null);
    try {
      await api.remove(RESOURCE, row.id);
      await loadProdutos();
      toast.current?.show({ severity: "success", summary: "Excluído", detail: `Produto "${row.nome}" removido.`, life: 2500 });
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
          <i className="pi pi-box" />
          Produtos
        </h1>
      </header>

      {error && (
        <div className="form-error">
          <Message severity="error" text={error} />
        </div>
      )}

      {/* 1 - Cadastro de um novo produto */}
      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-plus-circle"
          title="Novo Produto"
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
            idPrefix="produto"
            fields={PRODUTO_FIELDS}
            values={form}
            editing={editing}
            onChange={setField}
          />
        </div>
      </div>

      {/* 2 - Produtos cadastrados (edicao na propria linha) */}
      <div className="fp-section">
        <SectionHead
          n={2}
          icon="pi pi-list"
          title="Produtos Cadastrados"
          counter={`${produtos.length} ${produtos.length === 1 ? "produto" : "produtos"}`}
          actions={
            <Button
              className="fp-icon-btn"
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
              outlined
              onClick={loadProdutos}
              disabled={loading || emEdicaoNaTabela}
              aria-label="Recarregar"
            />
          }
        />
        <div className="fp-section-body">
          <DataTable
            value={produtos}
            loading={loading}
            loadingIcon="pi pi-spin pi-spinner"
            dataKey="id"
            size="small"
            stripedRows
            paginator={produtos.length > 10}
            rows={10}
            emptyMessage="Nenhum produto cadastrado."
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
              field="codigo"
              header="Código"
              style={{ width: "160px" }}
              editor={cellEditor(byName("codigo"))}
            />
            <Column field="nome" header="Nome" editor={cellEditor(byName("nome"))} />
            <Column
              field="modalidade_id"
              header="Modalidade"
              style={{ width: "180px" }}
              body={(row) => modalidadeNomePorId[row.modalidade_id] ?? "—"}
              editor={cellEditor(byName("modalidade_id"))}
            />
            <Column
              field="ativo"
              header={byName("ativo").label}
              style={{ width: "130px" }}
              body={(row) => <BooleanTag field={byName("ativo")} value={row.ativo} />}
              editor={cellEditor(byName("ativo"))}
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
                        aria-label={`Cancelar edição do produto ${row.nome}`}
                      />
                      <Button
                        icon={submitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        text
                        rounded
                        onClick={rowEditor.onSaveClick}
                        disabled={submitting}
                        aria-label={`Salvar produto ${row.nome}`}
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
                        aria-label={`Editar produto ${row.nome}`}
                      />
                      <Button
                        icon={removendoId === row.id ? "pi pi-spin pi-spinner" : "pi pi-trash"}
                        text
                        rounded
                        severity="danger"
                        onClick={() => remover(row)}
                        disabled={submitting || removendoId != null || emEdicaoNaTabela}
                        aria-label={`Excluir produto ${row.nome}`}
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
