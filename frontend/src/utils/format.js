import { ENUMS } from "../config/entities.js";

const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");

export function formatCep(v) {
  const d = onlyDigits(v);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : v || "";
}

// Normaliza o CEP para no maximo 8 digitos (schema: Endereco.CEP VARCHAR(8)).
export function cleanCep(v) {
  return onlyDigits(v).slice(0, 8);
}

export function formatCnpj(v) {
  const d = onlyDigits(v);
  if (d.length !== 14) return v || "";
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// CNPJ alfanumerico (vigente desde jul/2026): 12 posicoes alfanumericas + 2
// digitos verificadores numericos. Normaliza para caixa alta, sem pontuacao.
export function cleanCnpjAlfa(v) {
  const s = String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14);
  const base = s.slice(0, 12); // 12 alfanumericos
  const dv = s.slice(12, 14).replace(/\D/g, ""); // 2 digitos verificadores
  return base + dv;
}

// Aplica a mascara XX.XXX.XXX/XXXX-XX ao CNPJ alfanumerico.
export function maskCnpjAlfa(v) {
  const s = cleanCnpjAlfa(v);
  if (!s) return "";
  let out = s.slice(0, 2);
  if (s.length > 2) out += "." + s.slice(2, 5);
  if (s.length > 5) out += "." + s.slice(5, 8);
  if (s.length > 8) out += "/" + s.slice(8, 12);
  if (s.length > 12) out += "-" + s.slice(12, 14);
  return out;
}

export function formatCpfCnpj(v) {
  const d = onlyDigits(v);
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length === 14) return formatCnpj(d);
  return v || "";
}

export function formatMoney(v) {
  if (v === null || v === undefined || v === "") return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v.length <= 10 ? `${v}T00:00:00` : v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function enumLabel(enumKey, value) {
  const opt = (ENUMS[enumKey] || []).find((o) => o.value === value);
  return opt ? opt.label : value ?? "—";
}

// Aplica o formato declarado na coluna (config/entities.js).
export function formatCell(format, value) {
  if (value === null || value === undefined || value === "") {
    if (format === "bool") return "Não";
    return "—";
  }
  if (!format) return String(value);
  if (format.startsWith("enum:")) return enumLabel(format.slice(5), value);
  switch (format) {
    case "cep": return formatCep(value);
    case "cnpj": return formatCnpj(value);
    case "cpfcnpj": return formatCpfCnpj(value);
    case "money": return formatMoney(value);
    case "date": return formatDate(value);
    case "datetime": return formatDateTime(value);
    case "bool": return value ? "Sim" : "Não";
    case "score": return value;
    default: return String(value);
  }
}
