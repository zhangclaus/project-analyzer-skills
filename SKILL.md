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

Present summary to user: project name, description, tech stack, size, top-level structure.

Then ask:

**Language:** Report language?
- **中文** — 报告用中文写
- **English** — Report in English

Default: match the project's primary language (if README is in Chinese → 中文, otherwise → English). Proceed to analysis after selection.

## Analysis

Answer three questions about the project. Process them in order — each builds on the previous.

### Question 1: What does it do?

**Goal:** Understand the project's purpose and core capabilities.

**Steps:**
1. `Read` README, docs, and main entry files to understand the problem domain
2. **Position the project — answer "what IS it?" and "how is it used?":**
   - What category? (library, CLI tool, framework, service, SDK, plugin, platform...)
   - What form factor? (npm package, Docker image, SaaS, standalone binary, Python package...)
   - How does a user interact with it? (API, CLI, GUI, SDK import, MCP protocol...)
   - What does it replace? (e.g. "replaces traditional RAG pipeline", "alternative to X")
   - Is there a built-in demo/example app? (e.g. VikingBot is an example app, not the core)
   - **Integration model**: active call (user invokes directly) or passive trigger (hooks/plugins/middleware/lifecycle callbacks)?
     - `Grep` for hook registrations, plugin mounts, event listeners, middleware chains
     - For passive trigger: list ALL trigger points with their timing and purpose
   - Write a one-line positioning statement: "<Name> is a <category> that <what it does> for <who>"
3. `Grep` for exported functions/classes/APIs to identify core capabilities
4. `Glob` source directories to map module boundaries
5. For each major module: `Read` its entry file, `Grep` its exports, infer WHY it exists. Tag each module with a layer (`access`/`business`/`tool`/`data`/`infra`) as you go.
6. Map cross-module dependencies: `Grep` for import patterns between modules
7. **Group modules into subsystems (8-12 groups):**
   - Group by functional domain, NOT by layer
   - Each subsystem: `id` (snake_case), `name` (Chinese/display name), `icon` (emoji), `color` (hex), `desc` (one sentence), `modules` (list of module ids)
   - Subsystem name must be human-readable (e.g. "对抗引擎", not "adversarial_engine")
   - Module `name` field must be Chinese/display name (e.g. "对抗评估器", not "adversarial")
   - Aim for 8-12 subsystems total; avoid groups with only 1 module
8. **For each subsystem, extract its internal flow and key details:**
   - `Read` the subsystem's core module code to understand its process
   - `flow`: ordered list of steps the subsystem executes (e.g. "意图分析 → 向量搜索 → 重排序 → 收敛检查")
   - Each step: `name` (Chinese/display), `module` (which module handles it), `desc` (what happens, one sentence)
   - `key_details`: important facts a learner must know — search sources, thresholds, algorithms, defaults, platform-specific behavior
   - **CRITICAL: ALL details must come from reading the actual code.** Do NOT guess or infer. If you can't find a specific number/threshold in the code, omit it rather than fabricate.
   - Look for: function bodies, config constants, default parameters, conditional branches, loop logic
9. **Extract 3-5 core concepts (domain model):**
   - Identify the key abstractions the project revolves around (e.g. Crew, Worker, Turn, Challenge)
   - For each concept: `name` (Chinese/display name), `what` (one sentence: what is it), `why` (one sentence: why does it exist)
   - These are the concepts someone must understand BEFORE reading code
   - Look for: main data structures, key classes, central protocol/message types

**Output:** Module list with subsystem groupings, WHY annotations, dependency graph data, core concepts, and integration model.

**Layer detection rules (tag during step 5):**
- Module exports route handlers / CLI commands → `access`
- Module has business logic but no framework imports → `business`
- Module provides pure functions or type definitions → `tool`
- Module imports ORM / database / file system for CRUD → `data`
- Module handles config, logging, events, process management → `infra`
- When ambiguous → `business`

### Question 2: How does it work?

**Goal:** Trace the main workflow end-to-end.

**Steps:**
1. **Trace the workflow** (use integration model from Q1 to determine approach):
   - For active call: trace from the primary entry point through the call chain
   - For passive trigger: trace EACH trigger's flow, and show the lifecycle sequence (when triggers fire relative to each other)
   - `Read` each function's implementation, follow calls to other modules
   - Continue until the workflow completes (returns result, writes output, etc.)
2. At each step, note:
   - What happens (function name + brief action)
   - Which module it's in
   - Any branching (if/else, error handling)
   - Any side effects (DB write, API call, file I/O)
3. Identify the "critical path" — the happy path that most executions follow

**Output:**
- For active call: Linear flow diagram with branching points (Mermaid flowchart)
- For passive trigger: Lifecycle diagram showing all triggers, their timing, and what each does (Mermaid flowchart or table)

**How to find THE main flow:**
- Look for the most prominent CLI command or API endpoint
- Check README for the primary use case
- Find the function with the most incoming references
- For hook/plugin projects: find the hook registration file, trace each hook's handler
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

Generate a single report + one interactive HTML file. All text content (report, WHY annotations, layer names) uses the language selected during Quick Scan.

### Report: `docs/analysis/<project-name>/README.md`

Read `templates/report-template.md` for the structure. The report has three sections matching the three questions:

1. **What it does** — positioning statement, project overview, subsystem table, core concepts
2. **How it works** — integration model, main workflow Mermaid diagram, step-by-step explanation
3. **What's innovative** — key design decisions with rationale

Plus a Mermaid architecture overview diagram showing modules grouped by subsystem (not layer).

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
  subsystems: [
    {
      id: 'semantic_retrieval', name: '语义检索', icon: '🔍', color: '#a371f7',
      desc: '目录递归检索 + 重排序',
      modules: ['retriever', 'intent_analyzer', 'rerank_client'],
      flow: [
        { step: 1, name: '意图分析', module: 'intent_analyzer', desc: '将查询拆解为类型过滤、关键词、范围等检索条件' },
        { step: 2, name: '向量搜索', module: 'hierarchical_retriever', desc: '搜 3 个源：user/memories + agent/memories + agent/skills，每源 topk=10' }
      ],
      key_details: [
        '搜索 3 个源：viking://user/memories, viking://agent/memories, viking://agent/skills',
        '目录递归最多 3 轮，topk 不再变化时收敛',
        '分数传播：子目录得分 × 1.2 向上聚合',
        '去重阈值：相似度 > 0.92 的结果合并'
      ]
    }
  ],
  nodes: [
    { id: 'module_id', name: '模块中文名', subsystem: 'adversarial_engine', layer: 'business', why: 'WHY annotation' }
  ],
  edges: [
    { source: 'caller', target: 'callee', reason: 'edge WHY annotation' }
  ]
}
```

**Key rules:**
- `subsystems[].name` — human-readable name (Chinese or English, matching report language)
- `nodes[].name` — human-readable module name (NOT code-level identifier)
- `nodes[].subsystem` — must match a `subsystems[].id`
- `nodes[].why` — one sentence explaining WHY this module exists
- `edges[].reason` — one sentence explaining WHY this dependency exists
- Layer values: `access`, `business`, `tool`, `data`, `infra` (for internal classification only)

**Completeness check before generating HTML:**
- Every subsystem must have at least one module
- Every edge must have a reason
- Every node must have `name`, `subsystem`, and `why`
- Every node's `subsystem` must reference a valid subsystem id
- Every subsystem should have a `flow` (at least 2 steps) if the subsystem has a clear process
- Every `flow` step must have `name`, `module`, and `desc`
- `key_details` must be factual — every detail must be traceable to a specific code location
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
