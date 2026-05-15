# Functional Flow Analysis

Analyze and visualize the core business logic — function call chains, control flow, and state transitions.

## Analysis Steps

### Step 1: Identify Core Functions

Find the main business logic functions:
1. Start from entry points (routes, handlers, main functions)
2. Follow the call chain one level deep
3. Identify the "core" functions that do the real work (not just routing/dispatch)

`Grep` for patterns:
- Function definitions: `function `, `def `, `func `, `fn `, `pub fn`
- Class methods: `async `, `public `, `private `
- Exported functions: `export function`, `export const`, `export default`

### Step 2: Map Function Call Chains

For each core function:
1. Read the function body
2. List all functions it calls
3. For significant callees, read their implementation
4. Continue until you reach leaf functions (no further meaningful calls)

### Step 3: Analyze Control Flow

Within each function, identify:
- **Branches:** if/else, switch/match, ternary
- **Loops:** for, while, forEach, map/filter/reduce
- **Error handling:** try/catch, Result/Option, error returns
- **Early returns:** guard clauses, validation failures

### Step 4: Identify State Transitions

Look for state machines:
- Status fields that change (e.g., `order.status = 'shipped'`)
- State pattern implementations
- Workflow engines
- Enum-based state machines

### Step 5: Find Side Effects

Identify functions that:
- Write to database
- Send HTTP requests
- Emit events/messages
- Modify global state
- Read/write files

### Step 6: Infer Function WHY (Architecture + Deep only)

For each function identified in the call chain, infer **why it exists** in the flow.

**For each function node:**
1. `Read` the function body
2. Identify what problem it solves (not what operations it performs)
3. Synthesize a one-line WHY: "This function exists because [caller] needs [capability]"

**For each call edge A → B:**
1. Identify what A needs from B (data transformation? validation? persistence?)
2. Summarize the reason in one phrase

**Quality constraints:**
- Must answer "why this step is needed", not "what this step does"
- Good node WHY: "入口函数，统一错误处理"
- Bad node WHY: "处理请求" (this is WHAT)
- Good edge WHY: "校验通过后进入业务逻辑"
- Bad edge WHY: "调用validateInput" (no reasoning)

## Output: Interactive HTML

Functional flow diagrams are output as interactive HTML files using Cytoscape.js.

### Core Flows (`functional-flow/core-flows.html`)

Shows the main business logic call chains with WHY annotations.

**Graph data structure:**

```javascript
{
  nodes: [
    // Each function is a node
    { id: 'func_name', label: 'display_name', layer: 'business', why: 'WHY it exists' },
    // layer values: 'access' (entry points), 'business' (core logic), 'tool' (utilities), 'data' (persistence), 'infra' (cross-cutting)
  ],
  edges: [
    // Each call relationship is an edge
    { source: 'caller', target: 'callee', reason: 'WHY the call' },
  ]
}
```

**Node fields:**
- `id` — unique identifier, typically the function name
- `label` — display name (e.g., `handleRequest`, `validateInput`)
- `layer` — categorize by function role: `access` (entry/handler), `business` (core logic), `tool` (utility), `data` (persistence), `infra` (logging/events)
- `why` — one-line WHY annotation (≤15 chars for Architecture, ≤25 for Deep)

**Edge fields:**
- `source` — the calling function
- `target` — the called function
- `reason` — one-line WHY (≤20 chars for Architecture, ≤30 for Deep)

### Call Chains (`functional-flow/call-chains.html`)

Same structure as core flows, but focused on specific call chains from entry points to leaf functions.

### State Machines (`functional-flow/state-machines.md`)

Keep as Mermaid markdown — state machines are typically small (5-10 states) and render well in Mermaid.

## Depth Configuration

| Depth | What to Include | WHY Annotations | Output |
|-------|----------------|-----------------|--------|
| Overview | Top-level function names and their purpose | No | Mermaid in README |
| Architecture | Call chains, key branching logic, side effects | Yes — node ≤15 chars, edge ≤20 chars | Interactive HTML |
| Deep | Full control flow, every branch, error paths, state machines | Yes — node ≤25 chars, edge ≤30 chars | Interactive HTML |

## Example Output

For a User Registration flow (Architecture depth), the HTML file contains:

```javascript
{
  nodes: [
    { id: 'register', label: 'POST /register', layer: 'access', why: '入口，接收注册请求' },
    { id: 'validateEmail', label: 'validateEmail', layer: 'business', why: '格式校验，拒绝无效邮箱' },
    { id: 'validatePw', label: 'validatePassword', layer: 'business', why: '强度校验，防止弱密码' },
    { id: 'checkDup', label: 'checkDuplicate', layer: 'business', why: '查重，避免重复注册' },
    { id: 'hashPw', label: 'hashPassword', layer: 'business', why: 'bcrypt哈希，安全存储' },
    { id: 'createUser', label: 'createUser', layer: 'data', why: '创建账号，写入数据库' },
    { id: 'sendEmail', label: 'sendWelcomeEmail', layer: 'infra', why: '发送欢迎邮件，提升体验' },
  ],
  edges: [
    { source: 'register', target: 'validateEmail', reason: '提取邮箱' },
    { source: 'register', target: 'validatePw', reason: '提取密码' },
    { source: 'validateEmail', target: 'checkDup', reason: '邮箱合法' },
    { source: 'validatePw', target: 'checkDup', reason: '密码合规' },
    { source: 'checkDup', target: 'hashPw', reason: '无重复' },
    { source: 'hashPw', target: 'createUser', reason: '密码已哈希' },
    { source: 'createUser', target: 'sendEmail', reason: '注册成功' },
  ]
}
```

The user opens `functional-flow/core-flows.html` in a browser to interact with the diagram.
