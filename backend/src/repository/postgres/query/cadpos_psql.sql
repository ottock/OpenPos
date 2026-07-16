CREATE SCHEMA IF NOT EXISTS cadpos;

CREATE TABLE cadpos.Endereco (
    Id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CEP             VARCHAR(8)   NOT NULL,
    Logradouro      VARCHAR(255) NOT NULL,
    Numero          VARCHAR(20),
    Complemento     VARCHAR(255),
    Bairro          VARCHAR(100) NOT NULL,
    Municipio       VARCHAR(100) NOT NULL,
    UF              CHAR(2)      NOT NULL
);

CREATE TABLE cadpos.Telefone (
    Id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DDD             CHAR(2)      NOT NULL,
    Numero          VARCHAR(9)   NOT NULL,
    Ramal           VARCHAR(10)
);

CREATE TABLE cadpos.FontePrincipal (
    Id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CNPJ            VARCHAR(14)  NOT NULL UNIQUE,
    NomeCompleto    VARCHAR(255) NOT NULL,
    Tipo            VARCHAR(20)  NOT NULL DEFAULT 'OUTRO',
    EnderecoId      BIGINT       NOT NULL,
    TelefoneId      BIGINT,
    UrlSite         VARCHAR(255),

    CONSTRAINT FK_FontePrincipal_Endereco
        FOREIGN KEY (EnderecoId)
        REFERENCES cadpos.Endereco (Id),

    CONSTRAINT FK_FontePrincipal_Telefone
        FOREIGN KEY (TelefoneId)
        REFERENCES cadpos.Telefone (Id)
);

-- Secao 2 do leiaute ACPO109 - Contato Tecnico (repetivel, min 1 / max 5).
CREATE TABLE cadpos.ContatoTecnico (
    Id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FontePrincipalId BIGINT       NOT NULL,
    Nome             VARCHAR(255) NOT NULL,
    Email            VARCHAR(255),
    Departamento     VARCHAR(100),
    Cargo            VARCHAR(100),
    DDD              VARCHAR(2),
    Telefone         VARCHAR(9),
    Ramal            VARCHAR(10),

    CONSTRAINT FK_ContatoTecnico_FontePrincipal
        FOREIGN KEY (FontePrincipalId)
        REFERENCES cadpos.FontePrincipal (Id)
        ON DELETE CASCADE
);

-- Secao 3 do leiaute ACPO109 - Atendimento ao Consumidor (repetivel, min 1 / max 5).
CREATE TABLE cadpos.AtendimentoConsumidor (
    Id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FontePrincipalId BIGINT       NOT NULL,
    Departamento     VARCHAR(100),
    Email            VARCHAR(255),
    TipoTelefone     VARCHAR(20),
    CodPais          VARCHAR(3),
    DDD              VARCHAR(2),
    Telefone         VARCHAR(9),

    CONSTRAINT FK_AtendimentoConsumidor_FontePrincipal
        FOREIGN KEY (FontePrincipalId)
        REFERENCES cadpos.FontePrincipal (Id)
        ON DELETE CASCADE
);

-- Secao 4 do leiaute ACPO109 - Pessoa Autorizada para Liminar (repetivel, min 1 / max 5).
CREATE TABLE cadpos.PessoaAutorizada (
    Id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FontePrincipalId BIGINT       NOT NULL,
    Nome             VARCHAR(255),
    Email            VARCHAR(255),
    CPF              VARCHAR(11),
    DDD              VARCHAR(2),
    Telefone         VARCHAR(9),

    CONSTRAINT FK_PessoaAutorizada_FontePrincipal
        FOREIGN KEY (FontePrincipalId)
        REFERENCES cadpos.FontePrincipal (Id)
        ON DELETE CASCADE
);

CREATE TABLE cadpos.Produtos ();
CREATE TABLE cadpos.Modalidades ();