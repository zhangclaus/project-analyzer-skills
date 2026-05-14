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

## Diagram Templates

### Function Call Chain (Overview — no WHY)

```mermaid
flowchart TD
    A[handleRequest] --> B[validateInput]
    A --> C[processOrder]
    C --> D[calculateTotal]
    C --> E[applyDiscounts]
    C --> F[saveToDB]
    D --> G[getPrice]
    E --> H[lookupCoupon]
```

### Function Call Chain (Architecture/Deep — with WHY)

```mermaid
flowchart TD
    A["handleRequest\n入口函数，统一错误处理"]
    B["validateInput\n防御性校验，防止脏数据进入"]
    C["processOrder\n核心业务逻辑编排"]
    D["calculateTotal\n价格计算，含折扣和税费"]
    E["applyDiscounts\n折扣规则引擎，支持促销"]
    F["saveToDB\n数据持久化，事务保证"]

    A -->|"参数解构"| B
    A -->|"校验通过后"| C
    C -->|"金额汇总"| D
    C -->|"优惠计算"| E
    C -->|"落盘存储"| F
    D -->|"获取基础价格"| G[getPrice]
    E -->|"查询优惠券"| H[lookupCoupon]
```

### Control Flow (Detailed)

```mermaid
flowchart TD
    Start([Entry]) --> Check{isValid?}
    Check -->|Yes| Process[process data]
    Check -->|No| Error[return error]
    Process --> Save[save to DB]
    Save --> Success[return result]
    Save -->|fail| Retry{retry?}
    Retry -->|Yes| Save
    Retry -->|No| Error
```

### State Machine

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Processing: start()
    Processing --> Completed: finish()
    Processing --> Failed: error()
    Failed --> Processing: retry()
    Completed --> [*]
    Failed --> [*]
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant H as Handler
    participant S as Service
    participant R as Repository
    participant DB as Database

    C->>H: request
    H->>H: validate()
    H->>S: process()
    S->>R: find(id)
    R->>DB: SELECT
    DB-->>R: row
    R-->>S: entity
    S->>S: transform()
    S->>R: save(entity)
    R->>DB: INSERT
    DB-->>R: ok
    R-->>S: saved
    S-->>H: result
    H-->>C: response
```

## Depth Configuration

| Depth | What to Include | WHY Annotations |
|-------|----------------|-----------------|
| Overview | Top-level function names and their purpose | No |
| Architecture | Call chains, key branching logic, side effects | Yes — node ≤15 chars, edge ≤20 chars |
| Deep | Full control flow, every branch, error paths, state machines | Yes — node ≤25 chars, edge ≤30 chars |

## Example Output

### Functional Flow: User Registration (Architecture depth, with WHY)

```mermaid
flowchart TD
    A["POST /register\n入口，接收注册请求"]
    B["validateEmail\n格式校验，拒绝无效邮箱"]
    C["validatePassword\n强度校验，防止弱密码"]
    G["checkDuplicate\n查重，避免重复注册"]
    J["hashPassword\nbcrypt哈希，安全存储"]
    K["createUser\n创建账号，写入数据库"]
    L["sendWelcomeEmail\n发送欢迎邮件，提升体验"]

    A -->|"提取邮箱"| B
    A -->|"提取密码"| C
    B -->|"邮箱合法"| G
    C -->|"密码合规"| G
    G -->|"无重复"| J
    J --> K
    K -->|"注册成功"| L
    K -->|"返回201"| M[201 Created]
    B -->|"格式错误"| F[400 Bad Request]
    C -->|"强度不足"| F
    G -->|"已存在"| I[409 Conflict]
```

### State: User Account
```mermaid
stateDiagram-v2
    [*] --> Pending: register
    Pending --> Active: verify email
    Pending --> Deleted: timeout (24h)
    Active --> Suspended: admin action
    Suspended --> Active: admin action
    Active --> Deleted: user deletes
    Suspended --> Deleted: admin deletes
```
