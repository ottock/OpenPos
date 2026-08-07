# OpenPos Backend

API em Python/FastAPI responsável pelo cadastro de dados regulatórios (fonte principal, endereços, contatos, produtos e modalidades) e pela geração do arquivo de remessa **ACPO109**, layout de reporte exigido pelo Banco Central do Brasil (SCR/Bacen).

## Sumário

- [Visão geral](#visão-geral)
- [Stack e dependências](#stack-e-dependências)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Design patterns utilizados](#design-patterns-utilizados)
- [Funcionalidades](#funcionalidades)
- [Modelo de domínio](#modelo-de-domínio)
- [Tratamento de erros](#tratamento-de-erros)
- [Logging](#logging)
- [Configuração e variáveis de ambiente](#configuração-e-variáveis-de-ambiente)
- [Como executar](#como-executar)
- [Referência da API](#referência-da-api)

## Visão geral

O backend expõe uma API REST usada pelo frontend para manter o cadastro de participantes ("Fonte Principal") e seus dados relacionados (endereço, contatos técnicos, canais de atendimento ao consumidor, pessoas autorizadas), além do cadastro de produtos e modalidades. A partir desses dados, o sistema monta e valida o XML do layout **ACPO109** e registra cada execução gerada.

Não há autenticação ou multiusuário: a aplicação foi construída para uso local/único, com o estado persistido em PostgreSQL.

## Stack e dependências

- **Linguagem**: Python 3.14
- **Framework web**: FastAPI + Uvicorn (ASGI)
- **Banco de dados**: PostgreSQL, acessado via `psycopg2` com SQL puro (sem ORM)
- **Validação de payload**: Pydantic v2
- **Configuração**: `python-dotenv`, variáveis lidas de `.env`
- **Container**: Dockerfile baseado em `python:3.14.6-trixie`

O backend não usa ORM nem migrations automáticas: cada operação de banco corresponde a um arquivo `.sql` versionado no próprio repositório (ver [Repository](#design-patterns-utilizados)).

## Arquitetura

O código segue uma arquitetura em camadas (*layered architecture*), inspirada em Clean Architecture, com dependências apontando sempre para dentro (a camada de apresentação depende do domínio, nunca o contrário):

```
Requisição HTTP
      |
      v
presentation/router      -> define rotas FastAPI, valida entrada com Pydantic,
      |                      converte exceções de domínio em HTTPException
      v
presentation/controller  -> camada fina que apenas repassa chamadas ao service
      |
      v
domain/service           -> regras de negócio e validação
      |
      v
repository               -> monta parâmetros e executa queries SQL
      |
      v
repository/postgres       -> client de baixo nível (psycopg2), executa .sql em disco
      |
      v
PostgreSQL
```

Cada entidade (produto, modalidade, endereço, fonte principal, configuração, ACPO109) atravessa essas camadas de forma isolada: tem seu próprio router, controller, service e repository, o que mantém o acoplamento entre entidades baixo e permite evoluir uma sem afetar as demais.

A composição das camadas (qual repository alimenta qual service, qual service alimenta qual controller) acontece em [`presentation/controller/base.py`](src/presentation/controller/base.py), que funciona como um pequeno *composition root* da aplicação.

## Estrutura de pastas

```
backend/
├── src/
│   ├── main.py                      # ponto de entrada: carrega config, conecta no banco, sobe o Uvicorn
│   ├── core/
│   │   ├── config.py                 # leitura de variáveis de ambiente (.env)
│   │   ├── log/                      # setup de logging (console + arquivo rotativo)
│   │   └── pattern/retry.py          # decorator de retry linear
│   ├── domain/
│   │   ├── model/                    # schemas Pydantic (contrato de entrada/saída da API)
│   │   └── service/                  # regras de negócio e validação por entidade
│   ├── presentation/
│   │   ├── api/base.py               # instância da FastAPI (app)
│   │   ├── controller/                # camada fina entre router e service
│   │   └── router/                    # rotas HTTP por entidade
│   └── repository/
│       ├── *.py                       # um repository por entidade
│       └── postgres/
│           ├── base.py                # PostgresClient (conexão e execução de SQL)
│           └── query/                 # arquivos .sql organizados por entidade
├── log/                               # log rotativo gerado em runtime (app.log)
├── Dockerfile
└── requirements.txt
```

## Design patterns utilizados

- **Layered architecture**: separação estrita entre apresentação (router/controller), domínio (service/model) e persistência (repository), descrita acima.
- **Repository**: cada entidade tem um repository que isola o acesso a dados. O repository não conhece regra de negócio, apenas monta parâmetros e delega a execução ao `PostgresClient`.
- **SQL externalizado em arquivos**: as queries não ficam embutidas no código Python; vivem como arquivos `.sql` em `repository/postgres/query/<entidade>/`, lidos em runtime por `PostgresClient.execute_query_path`. Isso mantém o SQL revisável e testável de forma independente do código Python.
- **Dependency Injection manual (factory functions)**: `presentation/controller/base.py` concentra funções `get_*_controller(db_client)` que constroem a cadeia repository -> service -> controller a cada requisição, injetando a conexão de banco compartilhada (`app.state.db`). Não há um container de DI; a composição é explícita e centralizada.
- **Controller enxuto (thin controller)**: os controllers (`presentation/controller/*.py`) não têm lógica própria, apenas repassam a chamada ao service correspondente. Toda regra de negócio fica no `domain/service`.
- **Decorator**: `core/pattern/retry.py` implementa `linear_retry`, um decorator reaproveitável que reexecuta uma função em caso de falha, com backoff linear e jitter configuráveis. É aplicado em operações de escrita mais sensíveis (ex.: `ProdutoService.create_produto`, `EnderecoService.create_endereco`).
- **Domain exceptions dedicadas**: cada service define sua própria `ValidacaoError`, carregando uma lista de mensagens de validação. Os routers capturam esse tipo especificamente e traduzem para `HTTPException(422, ...)`, mantendo a camada de domínio livre de qualquer dependência do FastAPI.
- **Configuração centralizada**: `core/config.py` concentra a leitura de todas as variáveis de ambiente em uma única classe `Config`, evitada a leitura direta de `os.getenv` espalhada pelo código.
- **Logging configurável por arquivo JSON**: `core/log/base.py` carrega e valida um `base_config.json` (formato `logging.config.dictConfig`) antes de aplicá-lo, falhando cedo se a configuração de handlers/formatters estiver inconsistente.

## Funcionalidades

- **Cadastro de Fonte Principal**: identificação do participante (CNPJ, ISPB, endereço), contatos técnicos, canais de atendimento ao consumidor e pessoas autorizadas para liminar. O endpoint `POST /fonteprincipal/identificacao` cria endereço e fonte principal em uma única chamada.
- **Cadastro de Endereço**: CRUD de endereços reutilizados por outras entidades.
- **Cadastro de Produto**: CRUD completo (criar, listar, atualizar, remover), vinculado opcionalmente a uma modalidade.
- **Cadastro de Modalidade**: CRUD completo, usado para tipificar produtos e o reporte.
- **Configuração**: leitura/gravação de uma configuração única (`GET/PUT /configuracao`), atualmente usada para definir o diretório onde os XMLs gerados são salvos em disco.
- **Geração do ACPO109**: `POST /acpo109/gerar` monta o número de remessa (`nr_rms`) automaticamente a partir do histórico, valida os dados cadastrais obrigatórios do layout, gera o XML (`xml.etree.ElementTree`), grava o arquivo em disco (se houver diretório configurado) e registra a execução no banco. `GET /acpo109` lista o histórico de execuções.
- **Health check**: `GET /api/health` para verificação simples de disponibilidade.

## Modelo de domínio

As principais entidades e suas relações:

- **FontePrincipal** (participante): possui um `Endereco`, um `Telefone`; possui muitos `ContatoTecnico`, `AtendimentoConsumidor` e `PessoaAutorizada`.
- **Produto**: pertence opcionalmente a uma `Modalidade`.
- **Modalidade**: classifica produtos e define o `tipo_reporte`.
- **Configuracao**: registro único com preferências da aplicação (diretório de salvamento dos XMLs).
- **Execucao**: histórico de cada geração de arquivo ACPO109 (layout, parâmetros usados, nome e conteúdo do arquivo gerado).

Os contratos de entrada de cada endpoint são schemas Pydantic em `domain/model/`, o que garante validação de tipo e formato antes mesmo de a requisição chegar ao service.

## Tratamento de erros

Os routers seguem um padrão consistente:

1. Exceções de validação de negócio (`ValidacaoError`, levantadas pelo `domain/service`) são convertidas em `HTTPException(422)`, com as mensagens de validação concatenadas.
2. Violações de unicidade no banco (ex.: código de produto ou nome de modalidade duplicado) são detectadas pela mensagem de erro do Postgres (`duplicate key`) e convertidas em `HTTPException(409)`.
3. Recursos não encontrados em operações de atualização/remoção retornam `HTTPException(404)`.
4. Qualquer outra exceção é logada com stack trace (`log.exception`) e convertida em `HTTPException(500)` com uma mensagem genérica, sem vazar detalhes internos para o cliente.

## Logging

- Configuração declarativa em [`core/log/configs/base_config.json`](src/core/log/configs/base_config.json), validada em `core/log/base.py` antes de ser aplicada.
- Saída simultânea em console (stdout) e em arquivo rotativo diário (`log/app.log`, retendo os últimos 5 arquivos).
- O arquivo de log é limpo a cada subida da aplicação (`_remove_existing_logs`), evitando acúmulo de logs de execuções antigas fora da rotação normal.

## Configuração e variáveis de ambiente

As variáveis são lidas de um arquivo `.env` na raiz do projeto (ver `.env.example`):

| Variável       | Descrição                                   |
|----------------|----------------------------------------------|
| `API_HOST`     | Host em que o Uvicorn escuta                  |
| `API_PORT`     | Porta em que o Uvicorn escuta                 |
| `DB_HOST`      | Host do PostgreSQL                            |
| `DB_USER`      | Usuário do PostgreSQL                         |
| `DB_PASSWORD`  | Senha do PostgreSQL                           |
| `DB_PORT`      | Porta do PostgreSQL                           |
| `DB_DATABASE`  | Nome do banco de dados                        |

O CORS é liberado apenas para origens `localhost`/`127.0.0.1` (qualquer porta), configurado diretamente em `main.py`.

## Como executar

### Com Docker Compose (recomendado)

Na raiz do projeto (`OpenPos/`), com um `.env` preenchido:

```bash
docker compose up --build backend
```

A API sobe em `http://localhost:8000`, com o diretório `log/` e a pasta `ACPO/` (usada para salvar os XMLs gerados) montados como volumes.

### Localmente

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Defina o `.env` na raiz do projeto e, em seguida:

```bash
set PYTHONPATH=src
python src/main.py
```

É necessário um PostgreSQL acessível com as tabelas esperadas pelas queries em `src/repository/postgres/query/`.

## Referência da API

Todas as rotas abaixo têm o prefixo `/api`.

| Método | Rota                                              | Descrição                                       |
|--------|----------------------------------------------------|--------------------------------------------------|
| GET    | `/health`                                           | Health check                                      |
| POST   | `/fonteprincipal/identificacao`                     | Cria endereço + fonte principal em uma chamada    |
| POST   | `/fonteprincipal`                                   | Cria fonte principal (endereço já existente)      |
| GET    | `/fonteprincipal`                                   | Lista fontes principais                           |
| POST   | `/contatotecnico`                                   | Cria contato técnico                              |
| GET    | `/contatotecnico`                                   | Lista contatos técnicos                           |
| POST   | `/atendimentoconsumidor`                            | Cria canal de atendimento ao consumidor           |
| GET    | `/atendimentoconsumidor`                            | Lista canais de atendimento ao consumidor         |
| POST   | `/pessoaautorizada`                                 | Cria pessoa autorizada para liminar               |
| GET    | `/pessoaautorizada`                                 | Lista pessoas autorizadas                         |
| POST   | `/endereco`                                         | Cria endereço                                     |
| GET    | `/endereco`                                         | Lista endereços                                   |
| POST   | `/produto`                                          | Cria produto                                      |
| GET    | `/produto`                                          | Lista produtos                                    |
| PUT    | `/produto/{produto_id}`                             | Atualiza produto                                  |
| DELETE | `/produto/{produto_id}`                             | Remove produto                                    |
| POST   | `/modalidade`                                       | Cria modalidade                                   |
| GET    | `/modalidade`                                       | Lista modalidades                                 |
| PUT    | `/modalidade/{modalidade_id}`                       | Atualiza modalidade                               |
| DELETE | `/modalidade/{modalidade_id}`                       | Remove modalidade                                 |
| GET    | `/configuracao`                                     | Lê a configuração atual                           |
| PUT    | `/configuracao`                                     | Grava/atualiza a configuração                     |
| POST   | `/acpo109/gerar`                                    | Gera um novo arquivo ACPO109 e registra a execução|
| GET    | `/acpo109`                                          | Lista o histórico de gerações do ACPO109          |

As rotas de fonte principal e das entidades relacionadas aceitam também os aliases com underscore (ex.: `/fonte_principal`, `/contato_tecnico`, `/atendimento_consumidor`, `/pessoa_autorizada`), mantidos por compatibilidade.
