# Architecture Analysis

Analyze and visualize a project's module structure, dependencies, and tech stack.

## Analysis Steps

### Step 1: Identify Tech Stack

Read the project's config files to determine:
- Primary language(s)
- Framework(s)
- Build tool(s)
- Package manager(s)

Common config files to check:
- `package.json` → Node.js, npm/yarn/pnpm
- `Cargo.toml` → Rust, cargo
- `go.mod` → Go
- `pyproject.toml` / `setup.py` → Python
- `pom.xml` / `build.gradle` → Java
- `Gemfile` → Ruby
- `composer.json` → PHP

### Step 2: Map Module Boundaries

1. `Glob` for top-level directories under `src/`, `lib/`, `pkg/`, or project root
2. For each module directory, `Read` its `index.ts` / `mod.rs` / `__init__.py` / `index.go` to understand its public API
3. `Grep` for import patterns to find cross-module dependencies:
   - TypeScript: `from '...'` or `import ... from`
   - Python: `from ... import` or `import`
   - Go: `import (...)`
   - Rust: `use ...` or `mod ...`

### Step 3: Identify Entry Points

Find the application's entry points:
- Main files: `main.ts`, `main.py`, `main.go`, `main.rs`, `index.ts`
- CLI entry: `bin/`, `cmd/`
- Web entry: `app.ts`, `server.ts`, `wsgi.py`
- Library entry: `lib.ts`, `mod.rs`, `index.ts`

### Step 4: Identify Key Abstractions

Look for:
- Core interfaces/types/traits
- Service classes
- Repository patterns
- Middleware layers
- Plugin/extension systems

### Step 5: Infer Module WHY (Architecture + Deep only)

For each module identified in Steps 2-4, infer **why it exists** (not what it does).

**For each module node:**
1. `Read` the module's entry file (index.ts, mod.rs, __init__.py, etc.)
2. `Grep` for exported functions/classes to understand its public API
3. `Grep` for who imports this module to understand its consumers
4. Synthesize a one-line WHY: "This module exists because [consumers] need [capability]"

**For each dependency edge A → B:**
1. `Grep` A's source for import statements referencing B
2. Identify which B functions/classes A actually calls
3. Categorize: data access / validation / utility / orchestration / etc.
4. Summarize in one phrase

**Quality constraints:**
- Must answer "why", not just describe "what"
- Good node WHY: "处理HTTP请求，隔离协议细节"
- Bad node WHY: "HTTP请求处理模块" (this is WHAT)
- Good edge WHY: "调用验证函数，确保输入合法"
- Bad edge WHY: "依赖core" (no information)

**Large project grouping (>20 modules):**

Auto-group modules by architectural layer:

| Layer | Detection |
|-------|-----------|
| 接入层 | Imports express/fastify/cobra, exports route handlers |
| 业务层 | No framework imports, exports business functions |
| 数据层 | Imports ORM/redis/fs, exports CRUD operations |
| 工具层 | Pure functions or type exports, no business logic |
| 外部集成 | Imports stripe/twilio/s3, exports client wrappers |

Detection: `Grep` each module's imports for framework/service keywords, check exported API patterns. Ambiguous modules → 业务层.

Subgraph title format: `subgraph "层名：一句话定位"`

## Output: Interactive HTML

Architecture diagrams are output as interactive HTML files using Cytoscape.js.

### Architecture Explorer (`architecture/architecture-explorer.html`)

The main architecture output. Shows all module dependencies with WHY annotations.

**Graph data structure:**

```javascript
{
  nodes: [
    // Each module is a node
    { id: 'module_dir', label: 'display_name', layer: 'business', path: 'src/module/', why: 'WHY it exists' },
    // ...
  ],
  edges: [
    // Each dependency is an edge
    { source: 'caller', target: 'dependency', reason: 'WHY the dependency' },
    // ...
  ]
}
```

**Node fields:**
- `id` — unique identifier, typically the module directory name (e.g., `crew`, `agent`, `memory`)
- `label` — display name shown on the graph (e.g., `crew.py`, `agent/core.py`, `memory/`)
- `layer` — architectural layer: `access`, `business`, `tool`, `data`, `infra`
- `path` — file path relative to project root (e.g., `src/agent_crucible/crew/`)
- `why` — one-line WHY annotation (≤15 chars for Architecture depth, ≤25 for Deep)

**Edge fields:**
- `source` — the module that depends on the target
- `target` — the module being depended on
- `reason` — one-line WHY annotation (≤20 chars for Architecture, ≤30 for Deep)

**Layer assignment rules:**

| Layer | Value | Detection |
|-------|-------|-----------|
| 接入层 | `access` | Imports express/fastify/cobra, exports route handlers |
| 业务层 | `business` | No framework imports, exports business functions |
| 工具层 | `tool` | Pure functions or type exports, no business logic |
| 数据层 | `data` | Imports ORM/redis/fs, exports CRUD operations |
| 基础设施层 | `infra` | Cross-cutting: events, logging, security, config |

### Tech Stack (`architecture/tech-stack.md`)

Standard markdown table listing technologies. No HTML needed.

## Depth Configuration

| Depth | What to Include | WHY Annotations | Output |
|-------|----------------|-----------------|--------|
| Overview | Top-level modules only, tech stack, entry points | No | Mermaid in README |
| Architecture | Module dependencies, API surface, data models | Yes — node ≤15 chars, edge ≤20 chars | Interactive HTML |
| Deep | Sub-module structure, key classes, interface contracts | Yes — node ≤25 chars, edge ≤30 chars | Interactive HTML |

## Example Output

For a typical Node.js project (Architecture depth), the HTML file contains:

```javascript
{
  nodes: [
    { id: 'api', label: 'api/', layer: 'access', why: 'HTTP接入层，协议与业务解耦' },
    { id: 'web', label: 'web/', layer: 'access', why: '前端UI，用户交互入口' },
    { id: 'core', label: 'core/', layer: 'business', why: '业务规则，不依赖框架' },
    { id: 'db', label: 'db/', layer: 'data', why: '数据持久化，统一访问' },
    { id: 'cli', label: 'cli/', layer: 'access', why: '命令行工具，自动化入口' },
  ],
  edges: [
    { source: 'api', target: 'core', reason: '请求路由与校验' },
    { source: 'web', target: 'api', reason: 'API调用' },
    { source: 'core', target: 'db', reason: '数据读写' },
    { source: 'cli', target: 'core', reason: '复用业务逻辑' },
  ]
}
```

The user opens `architecture/dependency-graph.html` in a browser to interact with the diagram.
