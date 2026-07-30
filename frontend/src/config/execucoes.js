// Registro dos leiautes suportados pela janela de Execucoes.
// Nenhum leiaute pede dados digitados: tudo (identificacao, contatos,
// atendimento, pessoas autorizadas, CNPJs do envelope, data e numeracao da
// remessa) e obtido automaticamente das tabelas ja cadastradas (ver backend:
// domain/service/execucao.py e domain/service/acpo109.py). Para adicionar um
// novo leiaute, basta incluir uma entrada aqui e o gerador correspondente no
// backend; "fields" so e usado se o novo leiaute precisar de algum dado que
// nao exista em nenhuma tabela.
export const LAYOUTS = {
  ACPO109: {
    label: "ACPO109 - Envio de Configuração",
    fields: [],
  },
};

export const LAYOUT_OPTIONS = Object.entries(LAYOUTS).map(([value, cfg]) => ({ value, label: cfg.label }));

export function layoutLabel(value) {
  return LAYOUTS[value]?.label ?? value;
}
