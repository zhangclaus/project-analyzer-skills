# User Interaction Flow Analysis

Map how users interact with the system — entry points, navigation paths, and interaction sequences.

## Analysis Steps

### Step 1: Identify User Entry Points

Find all ways users can interact with the system:
- Web routes/pages
- CLI commands and subcommands
- API endpoints (if user-facing)
- WebSocket connections
- Mobile app screens

`Grep` for patterns:
- Web routes: `app.get`, `app.post`, `router.`, `Route(`, `@app.route`
- CLI commands: `command(`, `add_command`, `Command(`, `cobra.Command`
- Pages: `pages/`, `views/`, `templates/`, `screens/`

### Step 2: Map Navigation Paths

For web apps:
1. Find all routes/pages
2. Identify links between pages (`<Link>`, `href`, `navigate`, `router.push`)
3. Map form submissions and their targets
4. Identify redirect chains

For CLI apps:
1. Find all commands and subcommands
2. Map command dependencies (which commands need others first)
3. Identify interactive prompts

For APIs:
1. List all endpoints
2. Map typical usage sequences (what order do clients call them?)

### Step 3: Identify User Flows

Group interactions into meaningful user flows:
- Authentication flow (login → dashboard)
- CRUD flows (list → create → edit → delete)
- Onboarding flow
- Settings/configuration flow
- Error recovery flows

### Step 4: Analyze Feedback Mechanisms

Find how the system communicates with users:
- Success/error messages
- Loading states
- Notifications
- Form validation feedback
- Toast/alert messages

## Diagram Templates

### User Flow (Web App)

```mermaid
flowchart TD
    Landing[Landing Page] --> Login[Login Page]
    Landing --> Signup[Signup Page]
    Login --> Dashboard[Dashboard]
    Signup --> Verify[Email Verification]
    Verify --> Dashboard
    Dashboard --> Profile[Profile]
    Dashboard --> Settings[Settings]
    Dashboard --> Main[Main Feature]
    Main --> Detail[Detail View]
    Detail --> Edit[Edit Form]
```

### Navigation Map

```mermaid
graph LR
    Home --> Products
    Home --> About
    Products --> Product[Product Detail]
    Product --> Cart[Shopping Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Confirmation[Order Confirmation]
    Products --> Search[Search Results]
```

### CLI Command Tree

```mermaid
graph TD
    CLI[myapp] --> Init[init]
    CLI --> Build[build]
    CLI --> Deploy[deploy]
    CLI --> Config[config]
    Build --> BuildDev[build dev]
    Build --> BuildProd[build prod]
    Deploy --> DeployStaging[deploy staging]
    Deploy --> DeployProd[deploy production]
    Config --> Set[config set]
    Config --> Get[config get]
```

### Interaction Sequence (Deep)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API
    participant Auth

    User->>Browser: Click "Login"
    Browser->>API: POST /auth/login
    API->>Auth: validate credentials
    Auth-->>API: JWT token
    API-->>Browser: 200 + token
    Browser->>Browser: store token
    Browser->>User: Redirect to dashboard
```

## Depth Configuration

| Depth | What to Include |
|-------|----------------|
| Overview | Main entry points and top-level navigation |
| Architecture | All routes/pages, user flow groupings |
| Deep | Every link, form, redirect, feedback mechanism |

## Example Output

```markdown
## User Interaction Flow: E-Commerce App

### Main Navigation
```mermaid
graph LR
    Home[Home] --> Shop[Shop]
    Home --> Account[My Account]
    Shop --> Product[Product]
    Product --> Cart[Cart]
    Cart --> Checkout[Checkout]
    Account --> Orders[Order History]
    Account --> Profile[Profile]
```

### Checkout Flow
```mermaid
flowchart TD
    Cart[Cart] --> Address[Shipping Address]
    Address --> Payment[Payment Method]
    Payment --> Review[Review Order]
    Review --> Place[Place Order]
    Place --> Success[Confirmation Page]
    Place -->|fail| Payment
    Address -->|back| Cart
    Payment -->|back| Address
```
```
