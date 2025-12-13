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
    - Docker & Docker Compose (para produção)

2.  **Instalação Local (Desenvolvimento)**:
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
    cp .env.example .env
    ```

## Executando o Servidor (Local)

Para iniciar o servidor de desenvolvimento:

```bash
uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

A documentação interativa da API estará disponível em: http://localhost:8000/docs

## Deploy com Docker (Produção)

Para rodar a aplicação em um ambiente de produção (VPS) usando Docker:

1.  **Configure o ambiente**:
    Certifique-se de que o arquivo `.env` está configurado corretamente com as portas desejadas.
    ```ini
    PORT_BACKEND=8000
    PORT_FRONTEND=8080
    HOST_IP=0.0.0.0
    ```

2.  **Suba os containers**:
    ```bash
    docker compose up -d --build
    ```

3.  **Acesse a aplicação**:
    - Frontend: `http://seu-ip:8080` (ou a porta definida em `PORT_FRONTEND`)
    - Backend API: `http://seu-ip:8000` (ou a porta definida em `PORT_BACKEND`)

4.  **Verifique os logs (opcional)**:
    ```bash
    docker compose logs -f
    ```

5.  **Parar a aplicação**:
    ```bash
    docker compose down
    ```

## Testes

Para rodar os testes:

```bash
pytest
```
