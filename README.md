# Student Management System Backend

## Descrição
Backend para o sistema de gerenciamento de estudantes, desenvolvido com FastAPI.

## Estrutura do Projeto
O projeto segue a arquitetura SOLID e está organizado da seguinte forma:

- **core/**: Configurações centrais (banco de dados, segurança, configurações).
- **models/**: Modelos de banco de dados (SQLAlchemy).
- **schemas/**: Schemas Pydantic para validação de dados.
- **crud/**: Operações de banco de dados (Create, Read, Update, Delete).
- **routers/**: Rotas da API (Endpoints).

## Configuração

1.  **Pré-requisitos**:
    - Python 3.13+
    - Virtualenv (recomendado)

2.  **Instalação**:
    ```bash
    # Crie e ative o ambiente virtual
    python -m venv .venv
    source .venv/bin/activate  # Linux/Mac
    # .venv\Scripts\activate  # Windows

    # Instale as dependências
    pip install -r requirements.txt
    ```

3.  **Variáveis de Ambiente**:
    Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário:
    ```bash
    cp backend/.env.example backend/.env
    ```

## Executando o Servidor

Para iniciar o servidor de desenvolvimento:

```bash
uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

A documentação interativa da API estará disponível em: http://localhost:8000/docs

## Testes

Para rodar os testes:

```bash
pytest
```
