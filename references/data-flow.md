# Data Flow Analysis

Trace how data moves through a system — from input to transformation to output.

## Analysis Steps

### Step 1: Identify Data Entry Points

Find where external data enters the system:
- HTTP handlers / controllers / routes
- CLI argument parsing
- File readers / importers
- Message queue consumers
- Webhook receivers
- Database queries (read side)

`Grep` for patterns:
- `req.body`, `req.params`, `req.query` (Express)
- `request.json()`, `request.form` (Python web)
- `os.Args`, `flag.Parse()` (Go CLI)
- `stdin`, `input()` (general)

### Step 2: Trace Data Transformations

For each entry point, follow the data:
1. What validation/parsing happens?
2. What business logic transforms it?
3. What intermediate data structures are created?
4. What serialization/deserialization occurs?

`Grep` for patterns:
- Validation: `validate`, `schema`, `parse`, `sanitize`
- Transform: `map`, `filter`, `reduce`, `transform`, `convert`
- Serialization: `JSON.stringify`, `json.dumps`, `marshal`, `serialize`

### Step 3: Identify Data Storage

Find where data is persisted:
- Database operations: `INSERT`, `UPDATE`, `save`, `create`, `update`
- File writes: `writeFile`, `write`, `open(..., 'w')`
- Cache: `set`, `put`, `store`
- External API calls: `fetch`, `axios`, `requests.post`

### Step 4: Identify Data Outputs

Find where data leaves the system:
- HTTP responses: `res.json`, `res.send`, `return Response`
- File exports: CSV, JSON, PDF generation
- Message queue producers
- WebSocket pushes
- CLI output: `console.log`, `print`, `fmt.Println`

### Step 5: Map the Complete Flow

Connect entry → transform → store → output into a coherent flow.

## Diagram Templates

### High-Level Data Flow

```mermaid
flowchart LR
    Input[User Input] --> Validate[Validation]
    Validate --> Transform[Business Logic]
    Transform --> Store[(Database)]
    Transform --> Output[Response]
```

### Detailed Data Flow

```mermaid
flowchart TD
    subgraph Input
        HTTP[HTTP Request]
        CLI[CLI Args]
    end
    subgraph Processing
        Parse[Parse & Validate]
        Business[Business Logic]
        Enrich[Enrich Data]
    end
    subgraph Storage
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end
    subgraph Output
        Response[HTTP Response]
        Export[File Export]
    end

    HTTP --> Parse
    CLI --> Parse
    Parse --> Business
    Business --> Enrich
    Enrich --> DB
    Enrich --> Cache
    Business --> Response
    DB --> Export
```

### Data Model (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }|--|| PRODUCT : references
    USER {
        int id PK
        string email
        string name
    }
    ORDER {
        int id PK
        int user_id FK
        datetime created_at
        string status
    }
```

### Sequence Diagram (Deep)

```mermaid
sequenceDiagram
    participant U as User
    participant API as API Server
    participant SVC as Service
    participant DB as Database

    U->>API: POST /orders
    API->>SVC: createOrder(data)
    SVC->>DB: INSERT order
    DB-->>SVC: order created
    SVC-->>API: order object
    API-->>U: 201 Created
```

## Depth Configuration

| Depth | What to Include |
|-------|----------------|
| Overview | Main data sources and sinks, high-level flow |
| Architecture | Transformation steps, storage details, data models |
| Deep | Field-level flow, validation rules, error paths |

## Example Output

```markdown
## Data Flow: Order Processing

```mermaid
flowchart TD
    User[User] -->|POST /orders| API[API Handler]
    API -->|validate| Validator[Request Validator]
    Validator -->|create| Service[Order Service]
    Service -->|persist| DB[(orders table)]
    Service -->|emit| Event[OrderCreated Event]
    Event -->|notify| Email[Email Service]
    Event -->|update| Inventory[Inventory Service]
    Service -->|response| User
```

### Data Model
```mermaid
erDiagram
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        string id PK
        string user_id FK
        string status
        datetime created_at
    }
    ORDER_ITEM {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal price
    }
```
```
