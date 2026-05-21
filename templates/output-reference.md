# Output Reference

## Report: `docs/analysis/<project-name>/README.md`

Read `templates/report-template.md` for the structure. Three sections:
1. **What it does** — positioning statement, project overview, subsystem table, core concepts
2. **How it works** — integration model, core flow(s) Mermaid diagram, step-by-step explanation
3. **What's innovative** — key design decisions with rationale

Plus a Mermaid architecture overview diagram showing modules grouped by subsystem (not layer).

## Explorer: `docs/analysis/<project-name>/architecture-explorer.html`

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
