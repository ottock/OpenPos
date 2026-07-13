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

CREATE TABLE cadpos.ContatoTecnico (
    Id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NomeCompleto    VARCHAR(255) NOT NULL,
    Email           VARCHAR(255),
    EnderecoId      BIGINT,
    TelefoneId      BIGINT NOT NULL,
    FontePrincipalId BIGINT NOT NULL,

    CONSTRAINT FK_ContatoTecnico_Endereco
        FOREIGN KEY (EnderecoId)
        REFERENCES cadpos.Endereco (Id),

    CONSTRAINT FK_ContatoTecnico_Telefone
        FOREIGN KEY (TelefoneId)
        REFERENCES cadpos.Telefone (Id),

    CONSTRAINT FK_ContatoTecnico_FontePrincipal
        FOREIGN KEY (FontePrincipalId)
        REFERENCES cadpos.FontePrincipal (Id)
);

CREATE TABLE cadpos.Produtos ();
CREATE TABLE cadpos.Modalidades ();