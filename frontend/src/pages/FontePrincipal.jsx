import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { api, ApiError } from "../api/client.js";
import { ENUMS } from "../config/entities.js";
import {
  SectionHead,
  FieldsGrid,
  emptyItem,
  toList,
  buildPayload,
} from "../components/FormSection.jsx";

// Recursos da API (backend: presentation/router/router.py).
const RESOURCE = "fonteprincipal";
const IDENTIFICACAO_RESOURCE = "fonteprincipal/identificacao";
const CONTATO_RESOURCE = "contatotecnico";
const CANAL_RESOURCE = "atendimentoconsumidor";
const PESSOA_RESOURCE = "pessoaautorizada";

// ---------------------------------------------------------------------------
// Configuracao dos campos por secao (leiaute ACPO109).
// span = largura do campo no grid de 12 colunas.
// group (secao 1) = origem do dado (fonte x endereco); a secao 1 e enviada
//                   inteira ao backend, que separa e persiste as duas tabelas.
// ---------------------------------------------------------------------------

// Secao 1 - Identificacao (persistida via POST /fonteprincipal/identificacao).
const IDENT_FIELDS = [
  { name: "cnpj", label: "CNPJ", mask: "cnpj", required: true, placeholder: "12.ABC.345/01DE-35", span: 4, group: "fonte", hint: "14 dígitos - número de inscrição da pessoa jurídica." },
  { name: "nome_completo", label: "Razão Social", required: true, span: 5, group: "fonte", hint: "Até 60 caracteres." },
  { name: "tipo", label: "Tipo de fonte", type: "select", options: ENUMS.tipoFonte, default: "OUTRO", span: 3, group: "fonte" },
  { name: "ispb_fonte", label: "ISPB da Fonte", mask: "ispb", required: true, placeholder: "00000000", span: 3, group: "fonte", hint: "8 dígitos - Identificador do Sistema de Pagamentos Brasileiro da fonte." },
  { name: "ispb_cip", label: "ISPB CIP", mask: "ispb", required: true, placeholder: "00000000", span: 3, group: "fonte", hint: "8 dígitos - Identificador do Sistema de Pagamentos Brasileiro da CIP." },
  { name: "url_site", label: "URL do site", placeholder: "https://...", span: 6, group: "fonte", hint: "Opcional - até 120 caracteres." },
  { name: "cep", label: "CEP", mask: "cep", required: true, placeholder: "00000-000", span: 3, group: "endereco", hint: "8 dígitos." },
  { name: "logradouro", label: "Logradouro", required: true, span: 6, group: "endereco" },
  { name: "numero", label: "Número", span: 3, group: "endereco" },
  { name: "complemento", label: "Complemento", span: 4, group: "endereco" },
  { name: "bairro", label: "Bairro", required: true, span: 4, group: "endereco" },
  { name: "municipio", label: "Município", required: true, span: 2, group: "endereco" },
  { name: "uf", label: "UF", type: "select", options: ENUMS.uf, required: true, span: 2, group: "endereco" },
];

// Secao 2 - Contato Tecnico (repetivel, min 1 / max 5).
const CONTATO_FIELDS = [
  { name: "nome", label: "Nome", span: 6 },
  { name: "email", label: "E-mail", type: "email", span: 6 },
  { name: "departamento", label: "Departamento", span: 6 },
  { name: "cargo", label: "Cargo", span: 6 },
  { name: "ddd", label: "DDD", span: 2, maxLength: 2 },
  { name: "telefone", label: "Telefone", span: 5, hint: "Formato 0000-0000 ou 00000-0000, sem DDD." },
  { name: "ramal", label: "Ramal", span: 5 },
];

// Secao 3 - Atendimento ao Consumidor (repetivel, min 1 / max 5).
const CANAL_FIELDS = [
  { name: "departamento", label: "Departamento", span: 6 },
  { name: "email", label: "E-mail", type: "email", span: 6 },
  { name: "tipo_telefone", label: "Tipo de Telefone", type: "select", options: ENUMS.tipoTelefone, span: 4, hint: "Lista fechada do leiaute ACPO109." },
  { name: "cod_pais", label: "Cód. País", span: 2, maxLength: 3 },
  { name: "ddd", label: "DDD", span: 3, maxLength: 2 },
  { name: "telefone", label: "Telefone", span: 3 },
];

// Secao 4 - Pessoa Autorizada para Liminar (repetivel, min 1 / max 5).
const PESSOA_FIELDS = [
  { name: "nome", label: "Nome", span: 6 },
  { name: "email", label: "E-mail", type: "email", span: 6 },
  { name: "cpf", label: "CPF", mask: "cpf", span: 4 },
  { name: "ddd", label: "DDD", span: 3, maxLength: 2 },
  { name: "telefone", label: "Telefone", span: 5 },
];

// Verdadeiro quando o item nao tem nenhum valor preenchido (para nao persistir
// sub-cards em branco). Ignora o valor default de campos do tipo select.
function isEmptyItem(item, fields) {
  return fields.every((f) => {
    const v = item[f.name];
    if (v === "" || v === null || v === undefined) return true;
    return f.type === "select" && v === (f.default ?? "");
  });
}

// Monta o estado da secao 1 a partir do registro salvo (ou defaults).
function buildIdent(record) {
  const state = {};
  for (const f of IDENT_FIELDS) {
    let v = record ? record[f.name] : undefined;
    if (v === undefined || v === null) v = f.default !== undefined ? f.default : "";
    state[f.name] = v;
  }
  return state;
}

export default function FontePrincipal() {
  const [record, setRecord] = useState(null); // registro salvo da fonte (com id)
  const [ident, setIdent] = useState(() => buildIdent(null));
  const [contatos, setContatos] = useState([emptyItem(CONTATO_FIELDS)]);
  const [canais, setCanais] = useState([emptyItem(CANAL_FIELDS)]);
  const [pessoas, setPessoas] = useState([emptyItem(PESSOA_FIELDS)]);

  const [editing, setEditing] = useState({}); // { [sectionId]: boolean }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useRef(null);
  const snapshots = useRef({}); // copia da secao ao entrar em edicao (para cancelar)

  // Carrega o registro atual da Fonte Principal (e suas secoes repetiveis) ao montar.
  useEffect(() => {
    let alive = true;
    api
      .list(RESOURCE)
      .then(async (data) => {
        if (!alive) return;
        const rec = toList(data)[0] ?? null;
        setRecord(rec);
        setIdent(buildIdent(rec));
        if (rec?.id != null) await loadSecoes(rec.id, alive);
      })
      .catch(() => {}) // API indisponivel: mantem valores vazios
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca as secoes repetiveis vinculadas a fonte e popula os estados.
  const loadSecoes = async (fonteId, alive = true) => {
    const forFonte = (list) =>
      toList(list).filter((it) => it.fonte_principal_id === fonteId);
    const [ct, ca, pa] = await Promise.all([
      api.list(CONTATO_RESOURCE).catch(() => []),
      api.list(CANAL_RESOURCE).catch(() => []),
      api.list(PESSOA_RESOURCE).catch(() => []),
    ]);
    if (!alive) return;
    const withFallback = (items, fields) =>
      items.length ? items : [emptyItem(fields)];
    setContatos(withFallback(forFonte(ct), CONTATO_FIELDS));
    setCanais(withFallback(forFonte(ca), CANAL_FIELDS));
    setPessoas(withFallback(forFonte(pa), PESSOA_FIELDS));
  };

  const isEditing = (id) => !!editing[id];
  const setEdit = (id, on) => setEditing((e) => ({ ...e, [id]: on }));

  // Abre a edicao de uma secao guardando uma copia para eventual cancelamento.
  const startEdit = (id, current) => {
    setError(null);
    snapshots.current[id] = current;
    setEdit(id, true);
  };
  // Cancela: restaura a copia guardada e sai do modo de edicao.
  const cancelEdit = (id, setter) => {
    setError(null);
    setter(snapshots.current[id]);
    setEdit(id, false);
  };

  // Salva a secao 1 num unico POST: o backend cria o endereco, faz o upsert da
  // fonte por CNPJ e devolve o registro completo (com o JOIN do endereco).
  const saveIdentificacao = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const rec = await api.create(IDENTIFICACAO_RESOURCE, buildPayload(IDENT_FIELDS, ident));
      if (!rec || rec.id == null) {
        throw new Error("O backend não retornou a identificação salva.");
      }

      setRecord(rec);
      setIdent(buildIdent(rec));
      setEdit("identificacao", false);
      await loadSecoes(rec.id);
      toast.current?.show({ severity: "success", summary: "Salvo", detail: "Identificação salva com sucesso.", life: 2500 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
    } finally {
      setSubmitting(false);
    }
  };

  // Persiste uma secao repetivel: cria na API os itens ainda sem id (POST) e
  // recarrega a lista para reexibir os registros com seus ids. Requer que a
  // Identificacao ja tenha sido salva (para obter o fonte_principal_id).
  const saveSection = async (id, resource, items, fields, detail) => {
    if (!record?.id) {
      setError("Salve a Identificação (seção 1) antes de cadastrar esta seção.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const novos = items.filter((it) => it.id == null && !isEmptyItem(it, fields));
      for (const it of novos) {
        await api.create(resource, { ...buildPayload(fields, it), fonte_principal_id: record.id });
      }
      await loadSecoes(record.id);
      setEdit(id, false);
      toast.current?.show({ severity: "success", summary: "Salvo", detail, life: 2500 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page fp-page">
      <Toast ref={toast} position="bottom-right" />

      <header className="fp-header">
        <span className="fp-eyebrow">Cadastro Positivo</span>
        <h1>
          <i className="pi pi-building" />
          Fonte Principal
        </h1>
      </header>

      {error && (
        <div className="form-error">
          <Message severity="error" text={error} />
        </div>
      )}

      {/* 1 - Identificacao (persistida) */}
      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-id-card"
          title="Identificação"
          editing={isEditing("identificacao")}
          saving={submitting}
          onEdit={() => startEdit("identificacao", ident)}
          onSave={saveIdentificacao}
          onCancel={() => cancelEdit("identificacao", setIdent)}
          disabled={loading}
        />
        <div className="fp-section-body">
          <FieldsGrid
            idPrefix="ident"
            fields={IDENT_FIELDS}
            values={ident}
            editing={isEditing("identificacao")}
            onChange={(name, val) => setIdent((v) => ({ ...v, [name]: val }))}
          />
        </div>
      </div>

      {/* 2 - Contato Tecnico */}
      <RepeatableSection
        n={2}
        icon="pi pi-users"
        title="Contato Técnico"
        noun="contatos"
        itemLabel="Contato técnico"
        fields={CONTATO_FIELDS}
        items={contatos}
        setItems={setContatos}
        editing={isEditing("contatos")}
        saving={submitting}
        onEdit={() => startEdit("contatos", contatos)}
        onSave={() => saveSection("contatos", CONTATO_RESOURCE, contatos, CONTATO_FIELDS, "Contatos técnicos salvos.")}
        onCancel={() => cancelEdit("contatos", setContatos)}
      />

      {/* 3 - Atendimento ao Consumidor */}
      <RepeatableSection
        n={3}
        icon="pi pi-headphones"
        title="Atendimento ao Consumidor"
        noun="canais"
        itemLabel="Canal de atendimento"
        fields={CANAL_FIELDS}
        items={canais}
        setItems={setCanais}
        editing={isEditing("canais")}
        saving={submitting}
        onEdit={() => startEdit("canais", canais)}
        onSave={() => saveSection("canais", CANAL_RESOURCE, canais, CANAL_FIELDS, "Canais de atendimento salvos.")}
        onCancel={() => cancelEdit("canais", setCanais)}
      />

      {/* 4 - Pessoa Autorizada para Liminar */}
      <RepeatableSection
        n={4}
        icon="pi pi-verified"
        title="Pessoa Autorizada para Liminar"
        noun="pessoas"
        itemLabel="Pessoa autorizada"
        fields={PESSOA_FIELDS}
        items={pessoas}
        setItems={setPessoas}
        editing={isEditing("pessoas")}
        saving={submitting}
        onEdit={() => startEdit("pessoas", pessoas)}
        onSave={() => saveSection("pessoas", PESSOA_RESOURCE, pessoas, PESSOA_FIELDS, "Pessoas autorizadas salvas.")}
        onCancel={() => cancelEdit("pessoas", setPessoas)}
      />
    </section>
  );
}

// Secao repetivel (min 1 / max 5 itens) com sub-cards, adicionar e remover.
function RepeatableSection({
  n, icon, title, noun, itemLabel, fields,
  items, setItems, editing, saving, onEdit, onSave, onCancel,
}) {
  const counter = `${items.length} de 5 ${noun}`;
  const setItemField = (idx, name, val) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, [name]: val } : it)));
  const addItem = () => items.length < 5 && setItems([...items, emptyItem(fields)]);
  const removeItem = (idx) => items.length > 1 && setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="fp-section">
      <SectionHead
        n={n}
        icon={icon}
        title={title}
        counter={counter}
        editing={editing}
        saving={saving}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
      />
      <div className="fp-section-body">
        {items.map((item, idx) => (
          <div className="fp-subcard" key={idx}>
            <div className="fp-subcard-head">
              <span className="fp-subcard-title">{`${itemLabel} ${idx + 1}`}</span>
              {editing && items.length > 1 && (
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  onClick={() => removeItem(idx)}
                  aria-label={`Remover ${itemLabel} ${idx + 1}`}
                />
              )}
            </div>
            <FieldsGrid
              idPrefix={`${noun}-${idx}`}
              fields={fields}
              values={item}
              editing={editing}
              onChange={(name, val) => setItemField(idx, name, val)}
            />
          </div>
        ))}

        {editing && items.length < 5 && (
          <Button
            className="fp-add-btn"
            label={`Adicionar ${itemLabel.toLowerCase()}`}
            icon="pi pi-plus"
            text
            size="small"
            onClick={addItem}
          />
        )}
      </div>
    </div>
  );
}
