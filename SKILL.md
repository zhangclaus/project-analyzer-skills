---
name: project-xray-skills
license: MIT
github: https://github.com/zhangclaus/project-xray-skills
description:
  为任何代码库生成可视化文档 — 架构图、数据流图、功能流程图、用户交互模式。
  触发场景：用户想理解、分析或文档化一个项目，如 "分析这个项目"、"帮我理解这个代码库"、
  "generate architecture diagram"、"explain how this project works"、"项目详解"、
  "codebase overview"、"project deep dive"，或用户提供 GitHub URL / 本地路径并询问其结构。
metadata:
  author: zhangclaus
  version: "1.0.0"
---

# Project Analysis

Generate visual documentation for any codebase — architecture diagrams, data flows, functional flows, and user interaction patterns.

## Input Handling

The user provides either a local path or a GitHub URL.

**Local path:**
1. Use `Glob` to verify the directory exists and contains code files
2. If path doesn't exist, ask the user to check it

**GitHub URL:**
1. Extract owner/repo from the URL
2. Use `Bash` with `gh repo view <owner/repo>` to verify accessibility
3. Use `Bash` with `gh repo clone <owner/repo> /tmp/project-xray-skills-<repo>` to clone
4. If inaccessible, ask the user to check the URL or network

## Quick Scan

Before asking detailed questions, scan the project:

1. `Glob` for `**/*` to get directory structure (limit to top 2-3 levels)
2. `Read` these files if they exist:
   - `README.md` or `readme.md`
   - `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `pom.xml` (tech stack)
   - Main entry files (`src/index.ts`, `main.py`, `cmd/main.go`, etc.)
3. `Grep` for import/require patterns to understand module boundaries

Present a summary to the user:
- Project name and description
- Tech stack detected
- Approximate size (file count)
- Top-level module structure

## Interactive Selection

Ask the user (one question at a time):

**Question 1: Analysis depth**
- **Overview** — directory structure, tech stack, module boundaries
- **Architecture** — module dependencies, APIs, data models
- **Deep** — function call chains, conditionals, detailed flows

**Question 2: Diagram types** (multi-select)
- Architecture diagrams
- Data flow diagrams
- Functional flow diagrams
- User interaction flows

**Question 3: Diagram syntax** (if user has a preference)
- Mermaid (default, best GitHub compatibility)
- Graphviz (dot syntax)
- PlantUML

## Analysis Dispatch

Based on the user's selections, read the relevant reference file(s):

| Diagram Type | Reference File |
|---|---|
| Architecture | `references/architecture.md` |
| Data Flow | `references/data-flow.md` |
| Functional Flow | `references/functional-flow.md` |
| User Interaction | `references/user-interaction.md` |

Read only the selected types. Each reference file contains:
- Detailed analysis steps
- Mermaid/Graphviz diagram templates
- Depth-level adjustments
- Example output

## Analysis Execution

For each selected diagram type, follow the reference file's steps:

1. **Explore** — use Glob, Read, Grep to gather information
2. **Analyze** — identify components, relationships, flows
3. **Diagram** — generate the diagram using Mermaid syntax
4. **Confirm** — show the diagram to the user, ask if it looks right
5. **Iterate** — adjust based on feedback before moving to next type

Process diagram types in this order (if selected):
1. Architecture (provides context for other types)
2. Data Flow
3. Functional Flow
4. User Interaction

## WHY Annotations

For **Architecture** and **Functional Flow** diagrams at **Architecture** or **Deep** depth, add WHY annotations to explain design decisions.

**When to enable:**
- Diagram type = Architecture or Functional Flow
- Depth = Architecture or Deep (Overview stays lightweight, no WHY)

**Format:**
- Modules ≤ 20: Inline labels — `ModuleName["name\nWHY statement"]`
- Modules > 20: Subgraph grouping — group modules by layer, subgraph title includes WHY

**Node WHY:** Each module node gets a one-line explanation of why it exists (not what it does).
- Architecture depth: ≤15 characters
- Deep depth: ≤25 characters

**Edge WHY:** Each dependency edge gets a one-line explanation of why the dependency exists.
- Architecture depth: ≤20 characters
- Deep depth: ≤30 characters

**Quality rules:**
- WHY must answer "why", not describe "what"
- Good: "封装业务规则，不依赖框架"
- Bad: "包含核心业务逻辑"

## Output Generation

After all diagrams are confirmed, generate the report.

Read `templates/report-template.md` for the output structure.

Create files under `docs/analysis/<project-name>/`:
- `README.md` — overview report with links to all diagrams
- One subdirectory per diagram type with individual diagram files

Use this naming: `docs/analysis/<project-name>/`

## Error Handling

| Scenario | Action |
|---|---|
| Path doesn't exist | "That path doesn't exist. Please check and try again." |
| GitHub repo inaccessible | "Cannot access that repository. Check the URL or your network." |
| Project too large (>1000 files) | "This project has many files. Want to focus on a specific module?" |
| Unknown language | "I don't recognize this language/framework. Results may be less accurate." |
| Diagram syntax error | Auto-fix Mermaid syntax (escape special chars, simplify labels) |

## Review Loop

After generating the report:
1. Show the user the README.md overview
2. Ask: "Does this look right? Want to adjust anything?"
3. If changes requested, update the relevant diagram(s) and regenerate
4. Offer to add more diagram types or go deeper on any section
