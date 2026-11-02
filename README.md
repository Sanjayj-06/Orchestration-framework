# Orchestration Framework

## Run with Docker

From this directory, start the backend and frontend together:

```bash
docker compose up --build
```

Open the portal at <http://localhost:8080>. The backend health endpoint is
available through the portal at <http://localhost:8080/api/health>.

The SQLite database is stored in the `backend_data` Docker volume. To stop the
containers without removing data:

```bash
docker compose down
```

To remove the containers and their persisted database:

```bash
docker compose down -v
```

## Chemistry workspace

Open **Chemistry** in the portal to run the configurable seven-agent molecular
workflow. The backend uses RDKit to validate SMILES, calculate descriptors,
render 2D structures, and generate 3D SDF coordinates for the 3Dmol.js viewer.
Molecule generation requires one configured provider key; the workflow returns
an explicit error instead of inventing molecules when no provider is available.

Set a provider key before starting Compose:

```bash
set OPENAI_API_KEY=your-key
docker compose up --build
```

The workflow stores completed runs and generated molecules in the persistent
`backend_data` volume. RDKit-calculated descriptors are labelled separately
from model-predicted properties; aqueous solubility is not fabricated when no
prediction model is configured.

Optional provider credentials can be supplied through the shell environment
before starting Compose:

```bash
set OPENAI_API_KEY=your-key
set GEMINI_API_KEY=your-key
set ANTHROPIC_API_KEY=your-key
docker compose up --build
```

## Run locally

Install frontend dependencies with `npm ci`, then run `npm run dev`. Start the
backend from the `backend` directory with:

```bash
uvicorn app.main:app --reload --port 8000
```
