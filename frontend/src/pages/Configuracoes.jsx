import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { api, ApiError } from "../api/client.js";
import { SectionHead, FieldsGrid } from "../components/FormSection.jsx";

// Secao unica: pasta onde os arquivos gerados na janela de Execucoes
// (ACPO109 e demais leiautes futuros) sao gravados em disco pelo backend.
const FIELDS = [
  {
    name: "diretorio_salvamento",
    label: "Diretório de salvamento das ACPOs",
    required: true,
    span: 12,
    placeholder: "C:\\ACPO",
    hint: "Caminho absoluto, no computador onde o backend roda. É criado automaticamente se ainda não existir.",
  },
];

export default function Configuracoes() {
  const [config, setConfig] = useState(null); // registro salvo (ou null se ainda nao configurado)
  const [values, setValues] = useState({ diretorio_salvamento: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const snapshot = useRef(null);
  const toast = useRef(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.configuracao
      .read()
      .then((data) => {
        setConfig(data);
        setValues({ diretorio_salvamento: data?.diretorio_salvamento ?? "" });
        setEditing(!data); // sem configuracao ainda: abre direto em edicao
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar as configurações. Verifique o backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const startEdit = () => {
    setError(null);
    snapshot.current = values;
    setEditing(true);
  };

  const cancelEdit = () => {
    setError(null);
    if (snapshot.current) setValues(snapshot.current);
    setEditing(!config);
  };

  const salvar = async () => {
    if (!values.diretorio_salvamento?.trim()) {
      setError("Informe o diretório onde os arquivos ACPO serão salvos.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await api.configuracao.save({ diretorio_salvamento: values.diretorio_salvamento.trim() });
      setConfig(saved);
      setValues({ diretorio_salvamento: saved.diretorio_salvamento });
      setEditing(false);
      toast.current?.show({
        severity: "success",
        summary: "Configuração salva",
        detail: "As próximas execuções serão gravadas nessa pasta.",
        life: 3000,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err.message || "Erro ao salvar. Verifique o backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page fp-page">
      <Toast ref={toast} position="bottom-right" />

      <header className="fp-header">
        <span className="fp-eyebrow">Cadastro Positivo</span>
        <h1>
          <i className="pi pi-cog" />
          Configuração
        </h1>
      </header>

      {error && (
        <div className="form-error">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="fp-section">
        <SectionHead
          n={1}
          icon="pi pi-folder"
          title="Salvamento de Arquivos"
          editing={editing}
          saving={saving}
          onEdit={startEdit}
          onSave={salvar}
          onCancel={cancelEdit}
          disabled={loading}
        />
        <div className="fp-section-body">
          <FieldsGrid
            idPrefix="configuracao"
            fields={FIELDS}
            values={values}
            editing={editing}
            onChange={setField}
          />
        </div>
      </div>
    </section>
  );
}
