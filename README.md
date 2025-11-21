# Almosafir Reservation Backend

Production-ready NestJS API backed by MySQL, with Adminer and n8n included in the same Docker Compose stack. The stack is designed to let you bring up the data layer, workflow engine, and inspection tools first, replace API keys via `.env`, then start the API and wire the frontend webhook endpoint.

---

## Stack Overview

- `backend` – NestJS 11 app that exposes reservation/customer APIs on `http://localhost:3000`, uses TypeORM + MySQL, and authenticates every call with the `x-api-key` header.
- `mysql` – Primary database (official `mysql:latest`) with a persistent `mysql_data` volume.
- `adminer` – Browser SQL client on `http://localhost:8081` for inspecting data, inserting seed rows, and confirming secrets before writing them to `.env`.
- `n8n` – Workflow engine on `http://localhost:5678` that hosts the chat node/webhook used by the frontend. Data is stored in the `n8n_data` volume.

`docker-compose.yml` wires the services together: the API mounts `.env` read-only, depends on `mysql`, and `n8n` shares the same timezone/env variables so chat automations run deterministically.

---

## Prerequisites

| Tool | Purpose |
| --- | --- |
| Docker Desktop 4.29+ (Compose v2) | Container orchestration |
| Access to the frontend repo | Needed later to update `environments.ts` |

Clone this repository and make sure ports `3000`, `3306`, `5678`, and `8081` are free.

---

## Quick Start (TL;DR)

1. Review the provided `.env` file, confirm every value matches your environment (see below).
2. `docker compose up -d` – start MySQL, Adminer, n8n, and backend (backend waits until the others are ready).
3. Use Adminer to inspect/seed data and confirm the API key; if you edit `.env`, run `docker compose up -d backend` to refresh the API container.
4. In n8n, create a blank workflow, open it then use the three-dot menu → **Import from file** to load `Shahm AI Bot workflow.json`, then enable it and update the credentials using the `.env` file then copy the chat webhook URL.
5. Open the frontend repo, update the `webhookUrl` inside `src/environments/environments.ts`, and redeploy/restart the frontend.

The sections below expand every step.

---

## 1. Review Environment Variables

A fully populated `.env` file ships with the repo. Open it, confirm each value matches your target environment, and update as needed:

```
PORT=3000
STATIC_API_KEY=replace-me-after-adminer
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=almosafir
MYSQL_PASSWORD=super-secret
MYSQL_DATABASE=reservations
TYPEORM_SYNCHRONIZE=true
GENERIC_TIMEZONE=Asia/Riyadh
```

- `STATIC_API_KEY` controls the `x-api-key` guard. If you change it, update every consumer (frontend, n8n, API tests) before starting `backend`.
- `GENERIC_TIMEZONE` is shared with n8n (`TZ` + `GENERIC_TIMEZONE`) so scheduled nodes run in the same zone as your business logic.

Do not commit local edits to `.env`; it is already listed in `.gitignore`.

---

## 2. Start the Docker Stack

Start every service (MySQL, Adminer, n8n, and backend) with one command. The `backend` service waits until the others are ready because of the `depends_on` health/started checks defined in `docker-compose.yml`.

```bash
docker compose up -d
```

What to expect:

- **MySQL** exposes `localhost:3306` and becomes healthy after the built-in ping check.
- **Adminer** becomes available at `http://localhost:8081`.
- **n8n** is reachable at `http://localhost:5678`; sign in, create a blank workflow, and import the provided `Shahm AI Bot workflow.json` file (details below) before testing chat features.
- **backend** binds to `http://localhost:3000` only after the previous services are ready, so API requests succeed as soon as the stack finishes starting.

Adminer connection reference:

| Adminer field | Value | Source |
| --- | --- | --- |
| System | `MySQL / MariaDB` | fixed |
| Server | `mysql` | `MYSQL_HOST` |
| Username | `root` (or the user in `.env`) | `MYSQL_USER` |
| Password | value from `.env` | `MYSQL_PASSWORD` |
| Database | `restaurant_reservation` (or your override) | `MYSQL_DATABASE` |

Monitor logs if something fails:

```bash
docker compose logs -f mysql
docker compose logs -f n8n
```

---

## 3. Finalize API Keys in `.env`

1. Open the provided `.env` file and copy the `STATIC_API_KEY`.
2. Update the placeholder inside `.env` so it matches the value that every caller will use.
3. Save `.env`. Because the API container mounts it read-only, you only need to restart services that rely on it after edits. The supporting services do **not** require a restart for API-key-only changes.
4. Use Adminer (`http://localhost:8081`) only for data inspection or seeding—API keys are not stored in MySQL, so there is nothing to fetch there.

> Tip: Keep a secure record of every key change. The backend only accepts requests when the `x-api-key` header matches `STATIC_API_KEY`, so frontend, n8n workflows, and any third-party callers must update in tandem.

---

## 4. Verify or Restart the NestJS API Container

`backend` starts automatically when you run `docker compose up -d`. Verify that it is serving traffic:

- Open `http://localhost:3000/docs` (or whichever `PORT` you chose) – you should see the Swagger UI.
- Call an endpoint with the predefined API key:

```bash
curl -H "x-api-key: $STATIC_API_KEY" http://localhost:3000/reservations
```

Restart or rebuild the container whenever you change `.env` or modify the source:

```bash
# restart only
docker compose up -d backend

# rebuild image + restart
docker compose up -d --build backend
```

---

## 5. Enable the n8n Chat Workflow and Update the Frontend `webhookUrl`

1. Go to `http://localhost:5678`, create/sign in to your n8n user, and open the imported workflow "Shahm AI Bot".
2. Click the webhook/chat node, choose **Production** URL, and copy the full URL (example: `https://localhost:5678/webhook/chat/123abc`).
3. Switch to the frontend repository and edit its environment file (`src\environments\environment.ts`):
4. Launch the front-end using `ng serve`

```ts
export const environment = {
  production: false,
  webhookUrl: 'https://localhost:5678/webhook/chat/123abc' // <-- replace
};
```

4. Redeploy or restart the frontend so it points at the latest webhook.
5. If the frontend caches configuration, clear the cache/bundle and rebuild to guarantee the new URL is used.

Whenever you clone or migrate environments:

- Re-import or re-activate the n8n workflow (`Shahm AI Bot workflow.json`).
- Copy the new webhook URL.
- Repeat the `environments.ts` update before testing chat features.

---

## 6. Import and Configure the Shahm AI Bot Workflow

The repository includes `Shahm AI Bot workflow.json`, a ready-to-run n8n flow that glues the chat trigger, LangChain agent, HTTP tools, and optional document-ingestion subflow together. Import it manually whenever you spin up a fresh n8n instance.

### Import

1. Sign in to n8n, click **New workflow**, and save the blank workflow (any name).
2. In the top-right three-dot menu, choose **Import from File → Replace current workflow**, then select `Shahm AI Bot workflow.json` from this repo.
3. After the nodes appear, keep the workflow deactivated until every credential is wired up.

### Wire credentials using `.env`

| Component | Credential type | `.env` keys to copy | Where to apply |
| --- | --- | --- | --- |
| OpenAI Chat + Embeddings | `OpenAI API` | `OPENAI_API_KEY` (and optional `OPENAI_BASE_URL`) | `OpenAI Chat Model`, `OpenAI Chat Model1`, `Embeddings OpenAI` |
| Reservation HTTP tools | `HTTP Request` headers | `STATIC_API_KEY` | Replace every `x-api-key: change-me` entry in `getReservations`, `createReservation`, `modifyReservation`, `confirmReservation`, `cancelReservation`, and any other HTTP nodes that call the backend |
| Email sender | `Brevo / Sendinblue API` | `BREVO_API_KEY`, `BREVO_SENDER` | `Send reservation email` node |
| Vector store | `Qdrant API` | `QDRANT_ENDPOINT`, `QDRANT_APIKEY` | `menu vector store` and `Ingest PDF To Vector Store` nodes |

Tips:

- If n8n runs inside Docker on Linux, replace `http://host.docker.internal:3000` with `http://backend:3000` so the HTTP nodes can reach the backend container via the Compose network.
- Keep all credentials scoped to the workflow and never check them into git; `.env` remains the single source.

### Finalize the workflow

1. Open the `When chat message received` node, ensure **Public webhook** is enabled, and copy the **Production URL** once the workflow is active. Use this URL as the frontend `webhookUrl`.
2. (Optional) Use the **On form submission → Ingest PDF To Vector Store** branch to add new documents to the Qdrant collection referenced by the chat agent.
3. Activate the workflow after every node shows a green credential badge.

---

## 7. Running the API Without Docker (Optional)

You can develop the Nest app locally while still using the Compose-managed MySQL:

```bash
cp .env .env.local   # optional backup
npm install
docker compose up -d mysql adminer n8n
npm run start:dev
```

Ensure `MYSQL_HOST=localhost` (not `mysql`) whenever you run the app directly on the host.

---

## Troubleshooting

- **MySQL refuses connection** – confirm `.env` credentials, remove the `mysql_data` volume if you need a clean slate: `docker compose down -v mysql_data`.
- **n8n Shahm AI workflow missing after restart** – Simply create a blank workflow, then from the threedot menu select `import from File` then select the `Shahm AI Bot workflow.json` file.
- **`x-api-key` rejected** – verify every caller (frontend, n8n HTTP Request nodes, manual API tests) uses the same value you set in `.env`.
- **Need to rotate keys** – update the value in Adminer, sync `.env`, restart `backend`, then immediately update n8n and the frontend `webhookUrl` consumers.

---

## Repository Structure Highlights

- `src/modules/reservation` – main feature module (controllers, services, DTOs).
- `src/modules/customer` – customer entity + service.
- `src/modules/auth` – static API-key guard enforced on every request.
- `docker-compose.yml` – the authoritative definition of the four-container stack.
- `dockerfile` – multi-stage build used by the `backend` service.

---
