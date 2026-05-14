# Project X-Ray Skills

An [Agent Skills](https://agentskills.io/specification) skill that generates visual documentation for any codebase — architecture diagrams, data flow diagrams, functional flow charts, and user interaction patterns.

Give it a local path or a GitHub URL, and it will analyze the project and produce structured Markdown reports with embedded Mermaid diagrams.


## Features

- **4 diagram types** — Architecture, Data Flow, Functional Flow, User Interaction
- **3 analysis depths** — Overview, Architecture-level, Deep (function-level)
- **Multiple input sources** — Local directory or GitHub URL
- **Interactive workflow** — Step-by-step guidance with confirmation at each stage
- **Mermaid output** — Renders natively on GitHub, easy to embed anywhere
- **Configurable** — Choose depth, diagram types, and output format

## Installation

```bash
npx skills add zhangclaus/project-xray-skills
```

Works with Claude Code, Cursor, Windsurf, Copilot CLI, and other [Agent Skills compatible tools](https://agentskills.io/clients).

For global installation (available in all projects):

```bash
npx skills add zhangclaus/project-xray-skills -g
```

## Usage

Just ask naturally:

```
"分析这个项目"
"帮我理解这个代码库"
"generate architecture diagram for https://github.com/expressjs/express"
"explain how this project works"
"项目详解 /path/to/local/project"
"codebase overview"
```

Or invoke directly:

```
/project-xray-skills
```

## How It Works

```mermaid
flowchart TD
    Input[User provides path/URL] --> Scan[Quick scan project structure]
    Scan --> Summary[Show project summary]
    Summary --> Select[User selects depth & diagram types]
    Select --> Analyze[Analyze codebase]
    Analyze --> Diagram[Generate Mermaid diagrams]
    Diagram --> Review[User reviews & iterates]
    Review --> Output[Output report to docs/analysis/]
```

### Step by step

1. **Input** — Provide a local path or GitHub URL
2. **Scan** — The skill reads README, package.json/Cargo.toml/go.mod, and directory structure
3. **Select** — Choose analysis depth (Overview / Architecture / Deep) and diagram types
4. **Analyze** — Uses Glob, Read, Grep to explore the codebase
5. **Generate** — Produces Mermaid diagrams with explanations
6. **Review** — Confirm each diagram, iterate if needed
7. **Output** — Saves structured report to `docs/analysis/<project-name>/`

## Output Structure

```
docs/analysis/<project-name>/
├── README.md                       # Overview report with index
├── architecture/
│   ├── module-dependency.md        # Module dependency graph
│   └── tech-stack.md               # Tech stack analysis
├── data-flow/
│   ├── data-flow-diagram.md        # Data flow visualization
│   └── data-model.md               # ER diagram / data model
├── functional-flow/
│   ├── core-flows.md               # Business logic flowcharts
│   └── call-chains.md              # Function call chains
└── user-interaction/
    ├── user-flow.md                # User operation flows
    └── page-navigation.md          # Navigation maps
```

## Diagram Types

### Architecture

Module dependencies, component relationships, tech stack overview.

```mermaid
graph TD
    API[api/] --> Core[core/]
    API --> DB[db/]
    Web[web/] --> API
    Core --> DB
```

### Data Flow

Data entry points, transformations, storage, and outputs.

```mermaid
flowchart LR
    Input[User Input] --> Validate[Validation]
    Validate --> Transform[Business Logic]
    Transform --> Store[(Database)]
    Transform --> Output[Response]
```

### Functional Flow

Core business logic, function call chains, state machines.

```mermaid
flowchart TD
    A[handleRequest] --> B[validateInput]
    A --> C[processOrder]
    C --> D[calculateTotal]
    C --> E[saveToDB]
```

### User Interaction

User entry points, navigation paths, interaction sequences.

```mermaid
flowchart TD
    Landing[Landing Page] --> Login[Login]
    Landing --> Signup[Signup]
    Login --> Dashboard[Dashboard]
    Signup --> Dashboard
```

## Analysis Depths

| Depth | Scope | Best For |
|-------|-------|----------|
| **Overview** | Directory structure, tech stack, module boundaries | First look at a project |
| **Architecture** | Module dependencies, APIs, data models | Understanding system design |
| **Deep** | Function call chains, conditionals, state machines | Debugging or contributing |

## Supported Languages

The skill works with any language by analyzing directory structure and imports. Best results with:

- TypeScript / JavaScript
- Python
- Go
- Rust
- Java / Kotlin
- Ruby
- PHP
- C / C++

## Project Structure

```
project-xray-skills/
├── SKILL.md                        # Main skill orchestrator
├── references/
│   ├── architecture.md             # Architecture analysis guide
│   ├── data-flow.md                # Data flow analysis guide
│   ├── functional-flow.md          # Functional flow analysis guide
│   └── user-interaction.md         # User interaction flow guide
└── templates/
    └── report-template.md          # Output report template
```

## Contributing

Contributions welcome! The skill follows the [Agent Skills specification](https://agentskills.io/specification).

To add a new diagram type:
1. Create a reference file in `references/`
2. Add the dispatch entry in `SKILL.md`
3. Update this README

## License

MIT
