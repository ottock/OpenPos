// Configuracao declarativa das entidades.
// Cada entidade define colunas (tabela) e campos (formulario); o CrudPage
// generico usa isso para renderizar listagem, criacao, edicao e exclusao.

// Opcoes de enums espelhando o backend (models/enums.py).
export const ENUMS = {
  tipoPessoa: [
    { value: "F", label: "Fisica" },
    { value: "J", label: "Juridica" },
  ],
  tipoFonte: [
    { value: "BANCO", label: "Banco" },
    { value: "VAREJO", label: "Varejo" },
    { value: "UTILIDADE", label: "Utilidade (água / luz / telco)" },
    { value: "FINANCEIRA", label: "Financeira" },
    { value: "OUTRO", label: "Outro" },
  ],
  statusPagamento: [
    { value: "ADIMPLENTE", label: "Adimplente" },
    { value: "INADIMPLENTE", label: "Inadimplente" },
    { value: "EM_ABERTO", label: "Em aberto" },
  ],
  tipoConsentimento: [
    { value: "ABERTURA", label: "Abertura de cadastro" },
    { value: "COMPARTILHAMENTO", label: "Compartilhamento" },
  ],
  // Tipo de telefone (lista fechada do leiaute ACPO109 - Atendimento ao Consumidor).
  tipoTelefone: [
    { value: "COMERCIAL", label: "Comercial" },
    { value: "CELULAR", label: "Celular" },
    { value: "GRATUITO", label: "Gratuito (0800)" },
    { value: "FAX", label: "Fax" },
  ],
  // Unidades federativas do Brasil.
  uf: [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
  ].map((s) => ({ value: s, label: s })),
  statusConsentimento: [
    { value: "ATIVO", label: "Ativo" },
    { value: "REVOGADO", label: "Revogado" },
  ],
};

// Foreign helpers: como rotular um registro de outra entidade num <select>.
const labelEndereco = (e) => `#${e.id} - ${e.logradouro}, ${e.municipio}/${e.uf}`;
const labelCadastrado = (c) => `#${c.id} - ${c.nome_completo} (${c.cpf_cnpj})`;
const labelFonte = (f) => `#${f.id} - ${f.nome_completo}`;

export const ENTITIES = {
  enderecos: {
    resource: "enderecos",
    title: "Enderecos",
    singular: "Endereco",
    icon: "location",
    columns: [
      { key: "id", label: "ID" },
      { key: "cep", label: "CEP", format: "cep" },
      { key: "logradouro", label: "Logradouro" },
      { key: "numero", label: "Nº" },
      { key: "bairro", label: "Bairro" },
      { key: "municipio", label: "Municipio" },
      { key: "uf", label: "UF" },
    ],
    fields: [
      { name: "cep", label: "CEP", type: "text", required: true, placeholder: "00000-000" },
      { name: "logradouro", label: "Logradouro", type: "text", required: true },
      { name: "numero", label: "Numero", type: "text" },
      { name: "complemento", label: "Complemento", type: "text" },
      { name: "bairro", label: "Bairro", type: "text", required: true },
      { name: "municipio", label: "Municipio", type: "text", required: true },
      { name: "uf", label: "UF", type: "text", required: true, maxLength: 2, placeholder: "SP" },
    ],
  },

  fontes: {
    resource: "fontes",
    title: "Fontes",
    singular: "Fonte",
    icon: "bank",
    columns: [
      { key: "id", label: "ID" },
      { key: "cnpj", label: "CNPJ", format: "cnpj" },
      { key: "nome_completo", label: "Nome" },
      { key: "tipo", label: "Tipo", format: "enum:tipoFonte" },
      { key: "ativo", label: "Ativo", format: "bool" },
    ],
    fields: [
      { name: "cnpj", label: "CNPJ", type: "text", required: true, placeholder: "00.000.000/0000-00" },
      { name: "nome_completo", label: "Nome completo", type: "text", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ENUMS.tipoFonte, default: "OUTRO" },
      { name: "url_site", label: "Site", type: "text", placeholder: "https://..." },
      { name: "ativo", label: "Ativa", type: "checkbox", default: true },
      {
        name: "endereco_id", label: "Endereco", type: "foreign", required: true,
        foreign: { resource: "enderecos", label: labelEndereco },
      },
    ],
  },

  cadastrados: {
    resource: "cadastrados",
    title: "Cadastrados",
    singular: "Cadastrado",
    icon: "user",
    columns: [
      { key: "id", label: "ID" },
      { key: "cpf_cnpj", label: "CPF/CNPJ" },
      { key: "nome_completo", label: "Nome" },
      { key: "tipo_pessoa", label: "Pessoa", format: "enum:tipoPessoa" },
      { key: "score", label: "Score", format: "score" },
    ],
    fields: [
      { name: "tipo_pessoa", label: "Tipo de pessoa", type: "select", options: ENUMS.tipoPessoa, default: "F" },
      { name: "cpf_cnpj", label: "CPF / CNPJ", type: "text", required: true },
      { name: "nome_completo", label: "Nome completo", type: "text", required: true },
      { name: "data_nascimento", label: "Data de nascimento", type: "date" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "score", label: "Score (0-1000)", type: "number", min: 0, max: 1000 },
      {
        name: "endereco_id", label: "Endereco", type: "foreign",
        foreign: { resource: "enderecos", label: labelEndereco },
      },
    ],
  },

  historicos: {
    resource: "historicos",
    title: "Historico de Pagamento",
    singular: "Registro de pagamento",
    icon: "receipt",
    columns: [
      { key: "id", label: "ID" },
      { key: "descricao", label: "Descricao" },
      { key: "valor", label: "Valor", format: "money" },
      { key: "status", label: "Status", format: "enum:statusPagamento" },
      { key: "data_vencimento", label: "Vencimento", format: "date" },
      { key: "data_pagamento", label: "Pagamento", format: "date" },
    ],
    fields: [
      {
        name: "cadastrado_id", label: "Cadastrado", type: "foreign", required: true,
        foreign: { resource: "cadastrados", label: labelCadastrado },
      },
      {
        name: "fonte_id", label: "Fonte", type: "foreign", required: true,
        foreign: { resource: "fontes", label: labelFonte },
      },
      { name: "descricao", label: "Descricao", type: "text", required: true },
      { name: "valor", label: "Valor (R$)", type: "number", required: true, min: 0, step: "0.01" },
      { name: "data_vencimento", label: "Vencimento", type: "date", required: true },
      { name: "data_pagamento", label: "Pagamento", type: "date" },
      { name: "status", label: "Status", type: "select", options: ENUMS.statusPagamento, default: "EM_ABERTO" },
    ],
  },

  consentimentos: {
    resource: "consentimentos",
    title: "Consentimentos",
    singular: "Consentimento",
    icon: "shield",
    columns: [
      { key: "id", label: "ID" },
      { key: "cadastrado_id", label: "Cadastrado" },
      { key: "tipo", label: "Tipo", format: "enum:tipoConsentimento" },
      { key: "status", label: "Status", format: "enum:statusConsentimento" },
      { key: "canal", label: "Canal" },
      { key: "data_consentimento", label: "Data", format: "datetime" },
    ],
    fields: [
      {
        name: "cadastrado_id", label: "Cadastrado", type: "foreign", required: true,
        foreign: { resource: "cadastrados", label: labelCadastrado },
      },
      { name: "tipo", label: "Tipo", type: "select", options: ENUMS.tipoConsentimento, default: "ABERTURA" },
      { name: "status", label: "Status", type: "select", options: ENUMS.statusConsentimento, default: "ATIVO" },
      { name: "canal", label: "Canal", type: "text", placeholder: "APP, WEB, AGENCIA..." },
      { name: "data_revogacao", label: "Data de revogacao", type: "datetime" },
    ],
  },

  consultas: {
    resource: "consultas",
    title: "Consultas",
    singular: "Consulta",
    icon: "search",
    columns: [
      { key: "id", label: "ID" },
      { key: "cadastrado_id", label: "Cadastrado" },
      { key: "consulente_nome", label: "Consulente" },
      { key: "consulente_cnpj", label: "CNPJ", format: "cnpj" },
      { key: "finalidade", label: "Finalidade" },
      { key: "data_consulta", label: "Data", format: "datetime" },
    ],
    fields: [
      {
        name: "cadastrado_id", label: "Cadastrado", type: "foreign", required: true,
        foreign: { resource: "cadastrados", label: labelCadastrado },
      },
      { name: "consulente_cnpj", label: "CNPJ do consulente", type: "text", required: true },
      { name: "consulente_nome", label: "Nome do consulente", type: "text", required: true },
      { name: "finalidade", label: "Finalidade", type: "text" },
    ],
  },
};

export const ENTITY_LIST = Object.values(ENTITIES);
