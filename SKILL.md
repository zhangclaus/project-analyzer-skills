---
name: project-analyzer-skills
license: MIT
github: https://github.com/zhangclaus/project-analyzer-skills
description:
  分析任何代码库，回答三个核心问题：做了什么、流程什么样、创新在哪。
  生成结构化报告 + 交互式架构浏览器。
  触发场景：用户想理解、分析或文档化一个项目，如 "分析这个项目"、"帮我理解这个代码库"、
  "generate architecture diagram"、"explain how this project works"、"项目详解"、
  "codebase overview"、"project deep dive"，或用户提供 GitHub URL / 本地路径并询问其结构。
metadata:
  author: zhangclaus
  version: "2.0.0"
---

# Project Analysis

分析任何代码库，回答三个核心问题：
1. **做了什么** — 解决什么问题，核心功能
2. **流程什么样** — 主流程怎么跑的
3. **创新在哪** — 设计上有什么不同

## Input Handling

The user provides either a local path or a GitHub URL.

**Local path:**
1. Use `Glob` to verify the directory exists and contains code files
2. If path doesn't exist, ask the user to check it

**GitHub URL:**
1. Extract owner/repo from the URL
2. Use `Bash` with `gh repo view <owner/repo>` to verify accessibility
3. Use `Bash` with `gh repo clone <owner/repo> /tmp/project-analyzer-skills-<repo>` to clone
4. If inaccessible, ask the user to check the URL or network

## Quick Scan

Before analysis, scan the project:

1. `Glob` for `**/*` to get directory structure (top 2-3 levels)
2. `Read` config files to detect tech stack: `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `pom.xml`
3. `Read` README for project description
4. `Read` main entry files to understand the project type
5. `Glob` for source files to count approximate size

Present summary to user: project name, description, tech stack, size, top-level structure. Then proceed to analysis.

## Analysis

Answer three questions about the project. Process them in order — each builds on the previous.

### Question 1: What does it do?

**Goal:** Understand the project's purpose and core capabilities.

**Steps:**
1. `Read` README, docs, and main entry files to understand the problem domain
2. `Grep` for exported functions/classes/APIs to identify core capabilities
3. `Glob` source directories to map module boundaries
4. For each major module: `Read` its entry file, `Grep` its exports, infer WHY it exists
5. Classify each module into a layer:
   - `access` — entry points (CLI, API routes, UI, MCP server)
   - `business` — core logic (services, controllers, engines)
   - `tool` — utilities (adapters, formatters, validators)
   - `data` — storage (repositories, stores, caches)
   - `infra` — cross-cutting (config, logging, events, workers)
6. Map cross-module dependencies: `Grep` for import patterns between modules

**Output:** Module list with layer classification, WHY annotations, and dependency graph data.

**Layer detection rules:**
- Module exports route handlers / CLI commands → `access`
- Module has business logic but no framework imports → `business`
- Module provides pure functions or type definitions → `tool`
- Module imports ORM / database / file system for CRUD → `data`
- Module handles config, logging, events, process management → `infra`
- When ambiguous → `business`

### Question 2: How does it work?

**Goal:** Trace the ONE main workflow end-to-end.

**Steps:**
1. Identify the primary entry point (the most common user action)
2. From the entry point, trace the call chain step by step:
   - `Read` each function's implementation
   - Follow calls to other modules
   - Continue until the workflow completes (returns result, writes output, etc.)
3. At each step, note:
   - What happens (function name + brief action)
   - Which module it's in
   - Any branching (if/else, error handling)
   - Any side effects (DB write, API call, file I/O)
4. Identify the "critical path" — the happy path that most executions follow

**Output:** Linear flow description with branching points. Rendered as a Mermaid flowchart.

**How to find THE main flow:**
- Look for the most prominent CLI command or API endpoint
- Check README for the primary use case
- Find the function with the most incoming references
- If unclear, ask the user which flow they care about

### Question 3: What's innovative?

**Goal:** Identify what makes this project's design different from typical approaches.

**Steps:**
1. Identify the project's architectural pattern (monolith, microservices, event-driven, plugin system, etc.)
2. Look for unusual design decisions:
   - `Grep` for patterns like `class.*Mixin`, `@decorator`, `metaclass`, `__init_subclass__`
   - Check for custom protocols, message formats, or serialization
   - Look for non-standard dependency injection or service discovery
3. Compare with common patterns in the same domain:
   - If it's a web framework: how does routing work differently?
   - If it's a CLI tool: how does it handle config/plugins?
   - If it's a library: what's the API design philosophy?
4. Check for interesting technical choices:
   - Concurrency model (async, threads, processes, actors)
   - State management (immutable, event sourcing, CRDT)
   - Extension mechanism (plugins, hooks, middleware)
5. Read design docs or ADRs if they exist (`docs/`, `adr/`, `decisions/`)

**Output:** 3-5 key innovations with explanations of WHY they matter.

**Quality rules:**
- Don't list features — explain design decisions
- Good: "用事件溯源替代状态快照，支持任意时间点回放"
- Bad: "支持事件溯源"
- Each innovation should answer: "为什么这样做？好在哪？"

## Output

Generate a single report + one interactive HTML file.

### Report: `docs/analysis/<project-name>/README.md`

Read `templates/report-template.md` for the structure. The report has three sections matching the three questions:

1. **What it does** — project overview, core features, module table with layer/WHY
2. **How it works** — main workflow Mermaid diagram, step-by-step explanation
3. **What's innovative** — key design decisions with rationale

Plus a Mermaid architecture overview diagram showing modules grouped by layer.

### Explorer: `docs/analysis/<project-name>/architecture-explorer.html`

Interactive HTML for drilling into module details and dependencies.

**HTML generation process:**
1. Read the template: `Read templates/architecture-explorer.html`
2. Collect graph data during Question 1 analysis
3. Replace `PROJECT_TITLE` with the project name (two occurrences: `<title>` and toolbar `<h1>`)
4. Replace `DIAGRAM_TITLE` with the diagram title (one occurrence: `<title>`)
5. Replace `/* GRAPH_DATA_PLACEHOLDER */` with the JSON graph data
6. Write the HTML file to `docs/analysis/<project-name>/architecture-explorer.html`

**Graph data format:**
```javascript
{
  nodes: [
    { id: 'module_name', label: 'display_name', layer: 'business', path: 'src/module/', why: 'WHY annotation' }
  ],
  edges: [
    { source: 'caller', target: 'callee', reason: 'edge WHY annotation' }
  ]
}
```

**Layer values:** `access`, `business`, `tool`, `data`, `infra`

**Completeness check before generating HTML:**
- Every layer must have at least one node (if the project has that layer)
- Every edge must have a reason
- Every node must have a path and why
- If a layer is empty but should exist, re-scan for missed modules

### Cleanup

Before writing output, delete any existing files in the output directory from previous analyses:
```
rm -rf docs/analysis/<project-name>/*
```

## Error Handling

| Scenario | Action |
|---|---|
| Path doesn't exist | "That path doesn't exist. Please check and try again." |
| GitHub repo inaccessible | "Cannot access that repository. Check the URL or your network." |
| Project too large (>1000 files) | "This project has many files. Want to focus on a specific module?" |
| Unknown language | "I don't recognize this language/framework. Results may be less accurate." |
| Can't identify main flow | Ask the user which flow they want analyzed |

## Review Loop

After generating the report:
1. Show the user the README.md overview
2. Tell the user to open architecture-explorer.html to explore interactively
3. Ask: "Does this capture the key points? Want to adjust anything?"
4. If changes requested, update and regenerate
