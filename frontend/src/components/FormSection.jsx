import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import {
  cleanCnpjAlfa,
  maskCnpjAlfa,
  cleanCep,
  formatCep,
  formatCpfCnpj,
} from "../utils/format.js";

// Componentes de UI compartilhados pelas telas de cadastro (Fonte Principal,
// Produto, ...) para que todas as secoes tenham o mesmo card e o mesmo fluxo
// de leitura -> edicao.

const digits = (v) => String(v ?? "").replace(/\D/g, "");

// Cria um item vazio a partir da lista de campos (usa f.default quando houver).
export function emptyItem(fields) {
  const item = {};
  for (const f of fields) item[f.name] = f.default ?? "";
  return item;
}

// Normaliza a resposta da API (lista ou objeto) numa lista de registros.
export function toList(data) {
  if (Array.isArray(data)) return data;
  return data ? [data] : [];
}

// Monta o corpo do POST/PUT a partir de um conjunto de campos ("" -> null).
export function buildPayload(fields, values) {
  const payload = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === "boolean") payload[f.name] = !!v;
    else if (f.type === "number") payload[f.name] = v === "" || v === null ? null : Number(v);
    else payload[f.name] = v === "" ? null : v;
  }
  return payload;
}

// Rotulos de um campo booleano (default: Sim / Nao).
const boolLabel = (f, value) =>
  value ? f.trueLabel ?? "Sim" : f.falseLabel ?? "Não";

// Situacao de um campo booleano exibida como tag colorida (usada na tabela).
export function BooleanTag({ field, value }) {
  return <Tag severity={value ? "success" : "danger"} value={boolLabel(field, value)} />;
}

// Switch de um campo booleano. No modo leitura fica travado, mas continua
// ligado/desligado conforme o valor.
export function BooleanSwitch({ field, id, value, onChange, readOnly }) {
  return (
    <div className={`fp-switch-field${readOnly ? " fp-switch-readonly" : ""}`}>
      <InputSwitch
        inputId={id}
        checked={!!value}
        disabled={readOnly}
        onChange={readOnly ? undefined : (e) => onChange(field.name, e.value)}
      />
      <span className="fp-switch-label">{boolLabel(field, value)}</span>
    </div>
  );
}

// Cabecalho de uma secao: badge numerado + icone + titulo a esquerda;
// contador, tag "Somente leitura" e botao "Alterar"/"Salvar" a direita.
// `actions` substitui os botoes de edicao quando a secao nao e editavel
// (ex.: o botao de recarregar da lista de produtos).
export function SectionHead({
  n, icon, title, counter, editing, saving, disabled, onEdit, onSave, onCancel, actions,
  readonlyTag = true,
}) {
  return (
    <div className="fp-section-head">
      <div className="fp-section-head-left">
        <span className="fp-badge-num">{n}</span>
        <i className={icon} />
        <span className="fp-section-title">{title}</span>
      </div>
      <div className="fp-section-head-right">
        {counter && <span className="fp-counter">{counter}</span>}
        {actions}
        {!actions && (editing ? (
          <>
            <Button className="fp-icon-btn" icon="pi pi-times" text severity="secondary" onClick={onCancel} disabled={saving} aria-label="Cancelar" />
            <Button className="fp-icon-btn" icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"} onClick={onSave} disabled={saving} aria-label="Salvar" />
          </>
        ) : (
          <>
            {readonlyTag && <span className="fp-readonly-tag">Somente leitura</span>}
            <Button className="fp-icon-btn" icon="pi pi-pencil" outlined onClick={onEdit} disabled={disabled} aria-label="Alterar" />
          </>
        ))}
      </div>
    </div>
  );
}

// Grid de 12 colunas com os campos de uma secao (ou sub-card).
export function FieldsGrid({ idPrefix, fields, values, editing, onChange }) {
  return (
    <div className="form-grid">
      {fields.map((f) => {
        const id = `${idPrefix}-${f.name}`;
        return (
          <div className={`form-field col-${f.span || 12}`} key={f.name}>
            <label htmlFor={id}>
              {f.label} {f.required && <span className="req">*</span>}
            </label>
            {editing ? (
              renderInput(f, id, values[f.name], onChange)
            ) : f.type === "boolean" ? (
              <BooleanSwitch field={f} id={id} value={values[f.name]} readOnly />
            ) : (
              <span className="field-value">{displayValue(f, values[f.name])}</span>
            )}
            {editing && f.hint && <span className="fp-hint">{f.hint}</span>}
          </div>
        );
      })}
    </div>
  );
}

// Valor formatado para o modo de visualizacao.
export function displayValue(f, value) {
  if (f.type === "boolean") return boolLabel(f, value);
  if (value === "" || value === null || value === undefined) return "—";
  if (f.mask === "cnpj") return maskCnpjAlfa(value);
  if (f.mask === "cep") return formatCep(value);
  if (f.mask === "cpf") return formatCpfCnpj(value);
  if (f.type === "select") {
    const opt = (f.options || []).find((o) => o.value === value);
    return opt ? opt.label : value;
  }
  return value;
}

export function renderInput(f, id, value, onChange) {
  if (f.type === "select") {
    return (
      <Dropdown
        inputId={id}
        value={value ?? ""}
        options={f.options}
        optionLabel="label"
        optionValue="value"
        placeholder={f.placeholder || "Selecione..."}
        onChange={(e) => onChange(f.name, e.value)}
      />
    );
  }

  if (f.type === "boolean") {
    return <BooleanSwitch field={f} id={id} value={value} onChange={onChange} />;
  }

  const common = {
    id,
    name: f.name,
    required: f.required,
    maxLength: f.maxLength,
    placeholder: f.placeholder,
  };

  if (f.mask === "cnpj") {
    return (
      <InputText
        {...common}
        autoCapitalize="characters"
        value={maskCnpjAlfa(value)}
        onChange={(e) => onChange(f.name, cleanCnpjAlfa(e.target.value))}
      />
    );
  }
  if (f.mask === "cep") {
    return (
      <InputText
        {...common}
        inputMode="numeric"
        value={formatCep(value)}
        onChange={(e) => onChange(f.name, cleanCep(e.target.value))}
      />
    );
  }
  if (f.mask === "cpf") {
    return (
      <InputText
        {...common}
        inputMode="numeric"
        value={formatCpfCnpj(value)}
        onChange={(e) => onChange(f.name, digits(e.target.value).slice(0, 11))}
      />
    );
  }
  if (f.mask === "ispb") {
    return (
      <InputText
        {...common}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => onChange(f.name, digits(e.target.value).slice(0, 8))}
      />
    );
  }
  if (f.type === "number") {
    return (
      <InputText
        {...common}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => onChange(f.name, digits(e.target.value))}
      />
    );
  }

  return (
    <InputText
      {...common}
      type={f.type === "email" ? "email" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(f.name, e.target.value)}
    />
  );
}
