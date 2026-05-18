# AI.bh — Enterprise Monorepo Architecture Walkthrough
**Document Version:** 2026.1  
**Classification:** Internal Architectural Documentation  

---

## 🏗️ Monorepo Topology & Boundaries

We have successfully established the foundational enterprise monorepo structure for **AI.bh** using **Turborepo** and **pnpm workspaces** (with dual compatibility for npm/yarn workspaces).

### 📂 Directory Structure Overview
```text
ai.bh/
 ├── apps/                             # Next.js 14 App Router & future client apps
 ├── services/                         # Python FastAPI & Go microservices
 ├── packages/                         # Shared TypeScript libraries (Config, State, UI)
 │    ├── config/                      # Base tsconfig and ESLint presets
 │    └── state/                       # Zustand bounded store slices (Chat, Artifacts, Agents)
 ├── tools/                            # Standalone MCP servers & plugin definitions
 ├── gateway/                          # API & Real-time streaming gateways
 ├── realtime/                         # Collaboration sync & CRDT engines
 ├── worker/                           # Asynchronous Kafka/NATS event consumers
 ├── docs/                             # Architecture documentation & ADRs
 ├── frontend/                         # Legacy React + Vite SPA (Preserved for zero downtime)
 ├── backend/                          # Legacy Spring Boot Java App (Preserved for zero downtime)
 ├── pnpm-workspace.yaml               # pnpm package boundary definitions
 ├── turbo.json                        # Turborepo pipeline orchestration
 └── package.json                      # Root workspace configuration
```

---

## 🔒 Zero-Downtime Side-by-Side Coexistence

A critical requirement of enterprise refactoring is avoiding disruption to active development environments. 
- **Legacy Applications (`frontend/` & `backend/`)**: Remain fully intact and operational. Your existing `.\start-dev.bat` script continues to launch the Spring Boot backend on port `8080` and the React Vite SPA on port `3000` without modification.
- **New Microservices & Apps**: Are isolated inside `apps/`, `services/`, and `packages/`. This allows parallel development of the Next.js 14 App Router and Python FastAPI Agent Engine without risking regressions in the legacy codebase.

---

## 🧠 Next Steps for Development Execution

With the shared `@aibh/state` package and monorepo boundaries established, the platform is ready for the next implementation phases:
1. **`apps/web`**: Generating the Next.js 14 App Router frontend consuming `@aibh/state`.
2. **`services/agent-engine`**: Scaffolding the Python FastAPI LangGraph worker.
