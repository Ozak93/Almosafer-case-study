# Almosafer Reservation Stack

Production-ready NestJS API backed by MySQL, with Adminer, n8n, and the Shahm AI Chatbot web app included in the same Docker Compose stack. The chatbot is an Angular 20 experience that talks to the n8n workflow and backend APIs to deliver conversational reservation flows. The stack is designed to let you bring up the data layer, workflow engine, chatbot UI, and inspection tools first, replace API keys via `.env`, then start the API and wire the frontend webhook endpoint.

---

## Stack Overview

- `backend` – NestJS 11 app that exposes reservation/customer APIs on `http://localhost:3000`, uses TypeORM + MySQL, and authenticates every call with the `x-api-key` header.
- `frontend` – Angular 20 chat UI that is served via Nginx on `http://localhost:4200`.
- `mysql` – Primary database (official `mysql:latest`) with a persistent `mysql_data` volume.
- `adminer` – Browser SQL client on `http://localhost:8081` for inspecting data, and other Database operations.
- `n8n` – Workflow engine on `http://localhost:5678` that hosts the chat node/webhook used by the frontend. As well as the main AI Agent for Shahm. Data is stored in the `n8n_data` volume.

`docker-compose.yml` wires the services together: the API mounts `.env` read-only, depends on `mysql`, and `n8n` shares the same timezone/env variables so chat automations run deterministically.

---

## Prerequisites

| Tool | Purpose |
| --- | --- |
| Docker Desktop 4.29+ (Compose v2) | Container orchestration |

Clone this repository and make sure ports `3000`, `3306`, `5678`, and `8081` are available to use.

| Port | Service | Why it is needed |
| --- | --- | --- |
| `3000` | `backend` | Hosts the NestJS reservation APIs consumed by n8n. |
| `3306` | `mysql` | Exposes the primary database so the API and Adminer can reach the reservation data. |
| `5678` | `n8n` | Runs the Shahm AI Agent workflow that brokers chat traffic and automations. |
| `8081` | `adminer` | Gives browser access to the SQL console for debugging and data seeding. |

---

## Quick Start

1. Review the provided `.env` file, use the provided values to setup the n8n workflow Credentials for OpenAI, Qdrant Vector Store, Brevo Mail.
2. `docker compose up` – start MySQL, Adminer, n8n, backend, and the Angular frontend (backend waits until the others are ready).
3. In n8n, create a blank workflow, open it then use the three-dot menu → **Import from file** to load `Shahm AI Bot workflow.json`, then update the credentials using the `.env` file then enable it.
4. Open the frontend on `http://localhost:4200` and speak to Shahm!.

The sections below expand every step.

---

## 1. Review Environment Variables

A fully populated `.env` file is provided. Open it, to copy the API Keys used in the n8n workflow as needed.

- `STATIC_API_KEY` controls the `x-api-key` guard. If you change it, update every consumer ( n8n HTTP Nodes) before starting `frontend` and `backend`.

---

## 2. Start the Docker Stack

Start every service (MySQL, Adminer, n8n, frontend and backend) with one command. The `backend` service waits until the others are ready because of the `depends_on` health/started checks defined in `docker-compose.yml` and also to prevent TypeORM errors trying to connect/sync with the database before it's initialized in `MySQL`.

Note: running the `docker compose up` command the first time will build the backend and the frontend which may take time depending on your machine specifications.

```bash
docker compose up
```

Stack Urls Overview:

- **MySQL** exposes `localhost:3306` and becomes healthy after the built-in ping check.
- **Adminer** becomes available at `http://localhost:8081`.
- **n8n** is reachable at `http://localhost:5678`; sign in, create a blank workflow, and import the provided `Shahm AI Bot workflow.json` file (details below) before testing chat features.
- **backend** binds to `http://localhost:3000` only after the previous services are ready, so API requests succeed as soon as the stack finishes starting, Swagger UI available at `http://localhost:3000/docs`.
- **frontend** serves the compiled Angular chat UI on `http://localhost:4200` using Nginx. Rebuild it with `docker compose up -d --build frontend` whenever you change UI code or the webhook URL.

Adminer connection reference:

| Adminer field | Value | Source |
| --- | --- | --- |
| System | `MySQL / MariaDB` | fixed |
| Server | `mysql` | fixed |
| Username | `root` | `MYSQL_USER` |
| Password | value from `.env` | `MYSQL_PASSWORD` |
| Database | `restaurant_reservation` | `MYSQL_DATABASE` |

---

## 3. Import and Configure the Shahm AI Bot Workflow

The repository includes `Shahm AI Bot workflow.json`, a ready-to-run n8n flow that combines the chat trigger, AI agent, HTTP tools, and optional document-ingestion subflow together.

### Import Workflow

1. Create an Admin User then, click **New workflow**.
2. In the top-right three-dot menu, choose **Import from File → Replace current workflow**, then select `Shahm AI Bot workflow.json` from this repo.
3. After the nodes appear, keep the workflow deactivated until every credential is wired up.

### Credentials used in the workflow found in the `.env` file:

| Component | Credential type | `.env` keys to copy | Where to apply |
| --- | --- | --- | --- |
| OpenAI Chat + Embeddings | `OpenAI API` | `OPENAI_API_KEY` | `OpenAI Chat Model`, `OpenAI Chat Model1`, `Embeddings OpenAI` |
| Reservation HTTP tools (Optional) | `HTTP Request` headers | `STATIC_API_KEY` | (Optional) Replace every `x-api-key: change-me` entry in `getReservations`, `createReservation`, `modifyReservation`, `confirmReservation`, `cancelReservation`, and any other HTTP nodes that call the backend |
| Email sender | `Brevo API` | `brevo_apikey` | `Send reservation email` node |
| Qdrant Vector store | `Qdrant API` | `qdrant_apikey`, `qdrant_endpoint` | `menu vector store` and `Ingest PDF To Vector Store` nodes |

### Setup Video
![til](./media/setup-workflow.gif)

4. Once all the credentials are added (OpenAI, Brevo, Qdrant) then press Save and toggle the flow to activate it.
5. The flow is now ready to be used.
6. navigate to `http://localhost:4200` to start interacting with Shahm.




---

## Troubleshooting

- **MySQL refuses connection** – confirm `.env` file is present in the same directory with the docker-compose file.
- **n8n Shahm AI workflow missing after restart** – Simply create a blank workflow, then from the threedot menu select `import from File` then select the `Shahm AI Bot workflow.json` file, Follow the video guide above if you need guidance.

---
