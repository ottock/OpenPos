import { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { api, ApiError } from "../api/client.js";
import { ENUMS } from "../config/entities.js";
import { cleanCnpjAlfa, maskCnpjAlfa } from "../utils/format.js";

// Recurso da API onde o cadastro e enviado (backend: services/fonteprincipal.py).
const RESOURCE = "fonteprincipal";

// Campos do cadastro da Fonte Principal, agrupados em secoes do card.
// span = largura do campo no grid de 12 colunas da secao (agrupa campos por linha).
const SECTIONS = [
  {
    title: "Dados da fonte",
    icon: "pi pi-building",
    fields: [
      { name: "nome_completo", label: "Razão social / Nome", type: "text", required: true, span: 12, icon: "pi pi-id-card" },
      { name: "cnpj", label: "CNPJ", type: "text", mask: "cnpj", required: true, placeholder: "12.ABC.345/01DE-35", span: 6, icon: "pi pi-hashtag" },
      { name: "tipo", label: "Tipo de fonte", type: "select", options: ENUMS.tipoFonte, default: "OUTRO", span: 6, icon: "pi pi-tag" },
      { name: "url_site", label: "Site", type: "text", placeholder: "https://...", span: 12, icon: "pi pi-globe" },
    ],
  },
  {
    title: "Endereço",
    icon: "pi pi-map-marker",
    fields: [
      { name: "cep", label: "CEP", type: "text", required: true, placeholder: "00000-000", span: 3, icon: "pi pi-map" },
      { name: "logradouro", label: "Logradouro", type: "text", required: true, span: 9, icon: "pi pi-map-marker" },
      { name: "numero", label: "Número", type: "text", span: 3, icon: "pi pi-hashtag" },
      { name: "complemento", label: "Complemento", type: "text", span: 9, icon: "pi pi-info-circle" },
      { name: "bairro", label: "Bairro", type: "text", required: true, span: 5, icon: "pi pi-compass" },
      { name: "municipio", label: "Município", type: "text", required: true, span: 5, icon: "pi pi-building" },
      { name: "uf", label: "UF", type: "text", required: true, maxLength: 2, placeholder: "SP", span: 2, icon: "pi pi-flag" },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

// Monta o estado do formulario a partir do registro salvo (ou defaults).
function buildValues(record) {
  const state = {};
  for (const f of ALL_FIELDS) {
    let v = record ? record[f.name] : undefined;
    if (v === undefined || v === null) {
      v = f.default !== undefined ? f.default : "";
    }
    state[f.name] = v;
  }
  return state;
}

export default function FontePrincipal() {
  const [record, setRecord] = useState(null); // registro salvo (com id, se houver)
  const [values, setValues] = useState(() => buildValues(null));
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  // Carrega o registro atual da Fonte Principal ao montar.
  useEffect(() => {
    let alive = true;
    api
      .list(RESOURCE)
      .then((data) => {
        const rec = Array.isArray(data) ? data[0] ?? null : data ?? null;
        if (!alive) return;
        setRecord(rec);
        setValues(buildValues(rec));
      })
      .catch(() => {}) // API indisponivel: mantem valores vazios
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const startEdit = () => {
    setError(null);
    setMode("edit");
  };

  const cancelEdit = () => {
    setError(null);
    setValues(buildValues(record)); // descarta alteracoes
    setMode("view");
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {};
    for (const f of ALL_FIELDS) {
      const v = values[f.name];
      payload[f.name] = v === "" ? null : v;
    }

    try {
      const saved =
        record && record.id
          ? await api.update(RESOURCE, record.id, payload)
          : await api.create(RESOURCE, payload);
      const rec = saved ?? { ...(record?.id ? { id: record.id } : {}), ...payload };
      setRecord(rec);
      setValues(buildValues(rec));
      setMode("view");
      toast.current?.show({
        severity: "success",
        summary: "Salvo",
        detail: "Valores atualizados com sucesso.",
        life: 2500,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar. Verifique a API.");
    } finally {
      setSubmitting(false);
    }
  };

  const editing = mode === "edit";

  return (
    <section className="page">
      <Toast ref={toast} position="bottom-right" />

      <header className="page-header">
        <div>
          <h1>
            <i className="pi pi-building" />
            Fonte Principal
          </h1>
          <p className="muted">Cadastro da fonte principal do sistema</p>
        </div>
        {!editing && (
          <Button label="Editar" icon="pi pi-pencil" onClick={startEdit} />
        )}
      </header>

      <Card className="form-card">
        <form onSubmit={handleConfirm} className="entity-form">
          {error && (
            <div className="form-error">
              <Message severity="error" text={error} />
            </div>
          )}

          <div className="form-sections" key={mode}>
            {SECTIONS.map((section) => (
              <Fieldset
                className="form-section"
                legend={
                  <span className="section-legend">
                    <i className={section.icon} />
                    {section.title}
                  </span>
                }
                key={section.title}
              >
                <div className="form-grid">
                  {section.fields.map((f) => (
                    <div className={`form-field col-${f.span || 12}`} key={f.name}>
                      <label htmlFor={f.name}>
                        <i className={f.icon} />
                        {f.label} {f.required && <span className="req">*</span>}
                      </label>
                      {editing ? (
                        renderInput(f, values[f.name], setField)
                      ) : (
                        <span className="field-value">{displayValue(f, values[f.name])}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Fieldset>
            ))}
          </div>

          {editing && (
            <div className="form-actions">
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                text
                onClick={cancelEdit}
                disabled={submitting}
              />
              <Button
                type="submit"
                label={submitting ? "Salvando..." : "Confirmar"}
                icon="pi pi-check"
                loading={submitting}
              />
            </div>
          )}
        </form>
      </Card>
    </section>
  );
}

// Valor formatado para o modo de visualizacao.
function displayValue(f, value) {
  if (value === "" || value === null || value === undefined) return "—";
  if (f.mask === "cnpj") return maskCnpjAlfa(value);
  if (f.type === "select") {
    const opt = (f.options || []).find((o) => o.value === value);
    return opt ? opt.label : value;
  }
  return value;
}

function renderInput(f, value, setField) {
  if (f.type === "select") {
    return (
      <Dropdown
        inputId={f.name}
        value={value ?? ""}
        options={f.options}
        optionLabel="label"
        optionValue="value"
        onChange={(e) => setField(f.name, e.value)}
      />
    );
  }

  if (f.mask === "cnpj") {
    return (
      <InputText
        id={f.name}
        name={f.name}
        required={f.required}
        placeholder={f.placeholder}
        autoCapitalize="characters"
        value={maskCnpjAlfa(value)}
        onChange={(e) => setField(f.name, cleanCnpjAlfa(e.target.value))}
      />
    );
  }

  return (
    <InputText
      id={f.name}
      name={f.name}
      required={f.required}
      maxLength={f.maxLength}
      placeholder={f.placeholder}
      value={value ?? ""}
      onChange={(e) => setField(f.name, e.target.value)}
    />
  );
}
