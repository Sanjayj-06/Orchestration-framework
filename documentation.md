# AgentCraft: AI Agent Orchestration and Molecular Discovery Portal

## 1. Project Overview

AgentCraft is a web-based no-code AI agent orchestration platform. It allows users to:

- Create AI agents from natural-language requirements.
- Configure agent behavior, capabilities, memory, model settings, output formats, and advanced options.
- Browse, edit, duplicate, activate, archive, and delete agents.
- Chat with an individual agent.
- Compose agents into visual workflows using a drag-and-drop pipeline builder.
- Execute pipelines in local mock mode or with a configured external AI provider.
- Run a chemistry-focused molecular discovery workflow.
- Validate generated molecular structures with RDKit.
- Inspect molecular properties, 2D structures, and interactive 3D structures.
- Persist agents, conversations, workflows, and chemistry runs in SQLite.

The project is designed as a demonstration-ready platform for showing how natural-language AI agents can be configured, connected, executed, and applied to a practical chemistry use case.

## 2. Main Project Goals

The system was developed to demonstrate:

1. A low-code interface for building AI agents.
2. Reusable agent configuration and execution.
3. Visual orchestration of multiple agents.
4. Provider-independent model integration.
5. A domain-specific chemistry workflow.
6. Scientific validation instead of blindly trusting generated text.
7. Visual presentation of pipeline progress and molecular output.
8. Containerized deployment using Docker.

## 3. Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- `@xyflow/react` for visual workflow editing
- `lucide-react` for interface icons
- `react-markdown` and `remark-gfm` for formatted model output
- `3dmol.js` for interactive molecular visualization

### Backend

- Python 3.11
- FastAPI
- Uvicorn
- Pydantic 2
- SQLite
- RDKit
- Google Gemini SDK
- OpenAI SDK
- Anthropic SDK

### Deployment

- Docker
- Docker Compose
- Nginx
- Persistent Docker volume for SQLite data

## 4. High-Level Architecture

The application has a two-container architecture:

```text
Browser
   |
   v
Frontend container
React + Vite build served by Nginx
   |
   | /api proxy
   v
Backend container
FastAPI + Uvicorn
   |
   v
SQLite database in persistent Docker volume
```

### Frontend responsibilities

- Render the application shell and navigation.
- Manage agent, pipeline, settings, and chemistry views.
- Store browser-entered provider keys and model choices in local storage.
- Send provider configuration with AI requests.
- Display execution state, errors, agent traces, reports, and molecules.
- Render 2D molecule images returned by the backend.
- Load SDF data and display interactive 3D structures using 3Dmol.js.

### Backend responsibilities

- Expose REST API endpoints.
- Validate request and response models with Pydantic.
- Store agents, chat messages, workflows, and chemistry runs.
- Dispatch requests to OpenAI, Gemini, or Anthropic.
- Parse and validate chemistry requirements.
- Validate generated SMILES with RDKit.
- Calculate molecular descriptors.
- Generate 2D SVG and 3D SDF structures.
- Provide health monitoring for Docker.

## 5. Repository Structure

```text
Orchestration-framework/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── agent_models.py
│   │   │   └── chemistry_models.py
│   │   ├── routes/
│   │   │   ├── agents.py
│   │   │   ├── analyze.py
│   │   │   ├── chat.py
│   │   │   ├── chemistry.py
│   │   │   └── workflows.py
│   │   ├── services/
│   │   │   ├── agent_runtime.py
│   │   │   ├── chemistry.py
│   │   │   ├── code_generator.py
│   │   │   ├── providers.py
│   │   │   └── requirement_analyzer.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── HeaderNav.tsx
│   │   ├── ExecutionConsole.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── NodeInspector.tsx
│   │   └── Sidebar.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── agent.ts
│   ├── views/
│   │   ├── LandingView.tsx
│   │   ├── AgentLibraryView.tsx
│   │   ├── CreateAgentView.tsx
│   │   ├── AgentDashboardView.tsx
│   │   ├── BuildPipelineView.tsx
│   │   ├── ChemistryWorkspaceView.tsx
│   │   └── SettingsView.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── package-lock.json
├── README.md
└── documentation.md
```

## 6. User Interface Modules

### 6.1 Workspace home

The home view provides:

- Workspace summary.
- Total agent count.
- Active agent count.
- Workflow and recent run indicators.
- Recent agents.
- Recent activity.
- Shortcuts to create or open agents.

### 6.2 Agent creation

Users can describe an agent in natural language. The backend analyzes the requirement and returns a structured agent specification containing:

- Name
- Purpose
- Description
- Tasks
- Working style
- Autonomy
- Capabilities
- Tools
- Memory configuration
- Model provider and model
- Temperature and token limit
- Output format
- System prompt
- Retry behavior
- Tool timeout
- Inputs and outputs

The user can review and modify the generated specification before saving it.

### 6.3 Agent library

The agent library supports:

- Viewing all agents.
- Opening an agent dashboard.
- Editing an agent.
- Duplicating an agent.
- Activating an agent.
- Deactivating or archiving an agent.
- Deleting an agent.
- Downloading generated agent code.

### 6.4 Agent dashboard

The dashboard provides:

- Agent metadata.
- Configuration summary.
- Chat interface.
- Conversation history.
- Provider-backed responses.
- Tool-step display when tools are used.
- Copy and clear-history actions.

### 6.5 Build Pipeline

The Build Pipeline view is a visual workflow editor based on React Flow. It supports:

- User Input start nodes.
- Agent nodes.
- Final Output nodes.
- Connections between nodes.
- Node inspection and configuration.
- Pipeline naming.
- Pipeline save support through the workflow API.
- Local mock execution.
- AI runtime execution.
- Per-node status updates.
- Execution log and expandable inputs/outputs.
- Final pipeline output rendered as Markdown.

The normal pipeline requires a connected User Input node and Final Output node. AI Runtime uses the backend agent chat endpoint. Local Mock mode is intended for fast demonstrations and does not call an external model.

### 6.6 Chemistry workspace

The Chemistry workspace is a domain-specific molecular discovery dashboard. It includes:

- Natural-language chemistry request input.
- Seven-agent pipeline visualization.
- Running, queued, and completed states.
- Ranked molecule cards.
- Molecule names and secondary molecule IDs.
- 2D molecular structure display.
- Molecular property metrics.
- Canonical SMILES display.
- Copy SMILES action.
- SDF download action.
- Interactive 3Dmol.js viewer.
- Stick, sphere, and ball-and-stick representations.
- Rotation controls.
- Zoom controls.
- A fast “Load last result” preview for demonstrations.

## 7. Seven-Agent Chemistry Workflow

The chemistry workflow is represented as seven logical agents:

1. **Chemistry Requirement Analyst**
   - Converts natural-language requirements into structured constraints.

2. **Molecular Research & Memory Agent**
   - Retrieves previously stored molecules and supplies generation context.

3. **Molecule Generation Agent**
   - Requests candidate molecules from the selected language model.
   - Expects structured JSON containing candidate IDs, names, and SMILES.

4. **Chemical Structure Validation Agent**
   - Parses SMILES using RDKit.
   - Sanitizes structures.
   - Canonicalizes SMILES.
   - Removes duplicate canonical structures.

5. **Molecular Property Analysis Agent**
   - Calculates RDKit descriptors.

6. **Molecular Evaluation & Ranking Agent**
   - Applies molecular weight and Lipinski-style constraints.
   - Calculates an explainable ranking score using QED and constraint penalties.

7. **Molecular Discovery Report Agent**
   - Produces the final structured run result for the dashboard.

## 8. Chemistry Processing Details

### Requirement parsing

The backend extracts basic requirements from the user request, including:

- Number of requested molecules.
- Maximum molecular weight.
- Solubility wording.
- Lipinski violation allowance.

For example:

```text
Generate 5 drug-like molecules with molecular weight below 400 Da and good aqueous solubility.
```

is interpreted as:

```text
number_of_molecules: 5
max_molecular_weight: 400
solubility_requirement: good
```

### AI candidate generation

The configured provider is asked to return:

```json
{
  "candidates": [
    {
      "id": "MOL_001",
      "name": "descriptive chemical name",
      "smiles": "..."
    }
  ]
}
```

The backend:

- Requests JSON output from compatible Gemini responses.
- Accepts JSON surrounded by harmless Markdown fences or explanatory text.
- Rejects malformed JSON.
- Rejects responses without candidate SMILES.
- Does not silently invent molecules if the provider is unavailable.

### RDKit validation

Each candidate is passed to RDKit:

1. Parse the submitted SMILES.
2. Sanitize the molecule.
3. Convert it to canonical SMILES.
4. Detect duplicate canonical structures.
5. Keep valid structures and record invalid structures separately.

### Calculated properties

The current RDKit property set includes:

- Molecular weight
- LogP
- Topological polar surface area
- Hydrogen-bond donors
- Hydrogen-bond acceptors
- QED score

Aqueous solubility is not fabricated. When no dedicated solubility prediction model is configured, the result explicitly reports that the property was not predicted.

### Ranking

Candidates are ranked using:

```text
QED score - constraint violation penalty
```

The workflow also checks:

- Maximum molecular weight.
- Hydrogen-bond donor limit.
- Hydrogen-bond acceptor limit.
- Configured Lipinski violation allowance.

### 2D rendering

The backend creates 2D coordinates with RDKit and returns a self-contained SVG representation. The SVG is displayed in molecule cards.

### 3D rendering

The backend:

1. Parses the canonical SMILES.
2. Adds hydrogens.
3. Generates 3D coordinates with ETKDG.
4. Attempts MMFF optimization.
5. Returns an SDF structure.

The frontend loads the SDF into 3Dmol.js and allows interactive viewing.

## 9. Provider Integration

Supported providers:

- Google Gemini
- OpenAI
- Anthropic

Provider credentials can be supplied in two ways:

1. Docker environment variables:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `ANTHROPIC_API_KEY`

2. Browser Settings:
   - Keys are stored in browser local storage.
   - The frontend forwards the selected provider key and model with requests.

The application intentionally does not commit real credentials. Environment templates contain placeholders only.

## 10. Backend API

### Health

```http
GET /api/health
```

Returns backend service health information.

### Agents

```http
GET    /api/agents
GET    /api/agents/{agent_id}
POST   /api/agents
PUT    /api/agents/{agent_id}
DELETE /api/agents/{agent_id}
POST   /api/agents/{agent_id}/duplicate
POST   /api/agents/{agent_id}/chat
GET    /api/agents/{agent_id}/history
DELETE /api/agents/{agent_id}/history
GET    /api/agents/{agent_id}/download
```

### Requirement analysis

```http
POST /api/analyze-requirement
```

Converts a natural-language request into an agent specification and human-readable summary.

### Workflows

```http
GET  /api/workflows
POST /api/workflows
```

Workflow records contain node and edge definitions.

### Chemistry

```http
GET  /api/chemistry/templates
POST /api/chemistry/discover
GET  /api/chemistry/demo
GET  /api/chemistry/runs/{run_id}
GET  /api/chemistry/molecules/svg?smiles=...
GET  /api/chemistry/molecules/sdf?smiles=...
```

`/api/chemistry/demo` returns the latest completed chemistry run and is intended for fast demonstrations when live provider generation is slow or unavailable.

## 11. Data Persistence

SQLite tables include:

- `agents`
- `chat_messages`
- `workflows`
- `chemistry_runs`

The Docker Compose configuration stores the database at:

```text
/data/agents.db
```

The `/data` directory is backed by the named Docker volume:

```text
backend_data
```

This keeps data across normal container rebuilds and restarts.

## 12. Running the Project

### Docker setup

From the repository root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

Stop containers without deleting data:

```bash
docker compose down
```

Stop containers and delete the database volume:

```bash
docker compose down -v
```

### Provider environment variables

Windows Command Prompt:

```bat
set GEMINI_API_KEY=your-key
docker compose up --build
```

PowerShell:

```powershell
$env:GEMINI_API_KEY="your-key"
docker compose up --build
```

The same pattern can be used for OpenAI or Anthropic.

### Local development

Frontend:

```bash
npm ci
npm run dev
```

Backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## 13. Validation Performed

The project has been validated with:

- TypeScript compilation through `npm run build`.
- Vite production bundling.
- Python bytecode compilation using `python -m compileall -q backend/app`.
- Docker image builds.
- Docker Compose startup.
- Backend health-check verification.
- Frontend API proxy verification.
- Chemistry demo endpoint verification.
- Chemistry molecule persistence verification.
- GitHub push-protection verification after removing a previously exposed credential from unpublished history.

Expected build warnings:

- The 3Dmol.js bundle is large.
- The 3Dmol.js dependency contains a direct `eval` usage.

These warnings come from the third-party visualization dependency and do not prevent the build from completing.

## 14. Security and Reliability Considerations

- API keys are not hardcoded in application source.
- Environment templates use placeholders.
- GitHub Push Protection was encountered and resolved by removing a credential from unpublished Git history.
- Previously exposed credentials should always be revoked or rotated.
- Chemistry generation fails explicitly when no provider key is configured.
- Invalid provider responses do not become successful molecule results.
- RDKit validates structures before displaying them as candidates.
- Docker health checks ensure the frontend waits for a responsive backend.
- Blocking chemistry provider work is handled through a synchronous FastAPI route so it does not freeze the asynchronous event loop.

## 15. Current Limitations

1. Live molecule generation depends on an external provider and network availability.
2. Provider response time can vary due to model load and rate limits.
3. Aqueous solubility is labelled as unavailable unless a dedicated prediction model is added.
4. Requirement parsing currently uses rule-based extraction for common phrases.
5. The chemistry workflow does not yet include a full molecular database or external literature search.
6. The current ranking formula is an explainable demonstration score, not a validated drug-discovery model.
7. Workflow execution is primarily a single connected path through the visual pipeline.
8. Full authentication and multi-user access control are not currently implemented.
9. The frontend bundle is large because 3Dmol.js is included in the main build.

## 16. Demonstration Flow

For a quick project demonstration:

1. Start Docker Compose.
2. Open `http://localhost:8080`.
3. Open the Chemistry section.
4. Click **Load last result** to display the latest stored validated chemistry run immediately.
5. Enter a new request such as:

   ```text
   Generate 5 drug-like molecules with molecular weight below 400 Da and good aqueous solubility.
   ```

6. Configure a Gemini, OpenAI, or Anthropic key in Settings.
7. Click **Discover molecules**.
8. Show the seven-agent execution visualization.
9. Select a ranked candidate.
10. Demonstrate:
    - Molecule name.
    - 2D structure.
    - 3D interactive viewer.
    - Molecular weight.
    - LogP.
    - TPSA.
    - H-bond donors and acceptors.
    - QED.
    - Canonical SMILES.
    - SDF download.

## 17. Suggested Report Structure

This project can be documented in an academic or technical report using the following structure:

1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. Existing System and Motivation
6. Proposed System
7. System Architecture
8. Technology Stack
9. Agent Configuration and Orchestration
10. Chemistry Molecular Discovery Workflow
11. RDKit Validation and Molecular Descriptors
12. User Interface and Visualization
13. API and Database Design
14. Docker Deployment
15. Testing and Validation
16. Security and Reliability
17. Results and Demonstration
18. Limitations
19. Future Enhancements
20. Conclusion

## 18. Future Enhancements

Potential future improvements include:

- Add user authentication and role-based access.
- Add workflow branching, conditions, parallel execution, and retries.
- Add streaming execution updates from the backend.
- Add structured chemistry run progress events instead of frontend timing simulation.
- Add external chemistry databases and literature retrieval.
- Add docking, toxicity, ADMET, and synthetic accessibility predictors.
- Add a real aqueous-solubility prediction model.
- Add molecule similarity search and scaffold analysis.
- Add experiment and result export to PDF and CSV.
- Add automated evaluation datasets for agent quality.
- Add unit tests and API integration tests.
- Split 3Dmol.js into a lazy-loaded frontend chunk.
- Add observability with structured logs, metrics, and request tracing.

## 19. Conclusion

AgentCraft combines a no-code AI agent builder with a practical chemistry molecular discovery workflow. The platform demonstrates how language models can interpret requirements and propose candidates while deterministic scientific tooling, especially RDKit, validates and analyzes the results. The Dockerized architecture makes the system easy to run for demonstrations, and the visual pipeline and molecular viewer make the otherwise hidden orchestration process understandable to users.

