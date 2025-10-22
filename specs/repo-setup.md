
## Summary of Specifications

| Component | Detail |
| :--- | :--- |
| **Workspace Structure** | All packages under a `packages/` directory. |
| **Build Tooling** | PNPM only (no Turborepo/Nx initially). |
| **Node.js Version** | Latest LTS (We'll target **Node.js 20** as the current LTS at this time). |
| **Root Scripts** | Yes, a root `package.json` for shared scripts. |
| **Frontend (Next.js)** | **Tailwind CSS** and **ShadCN** for styling. Imports both **`shared`** (types) and **`drizzle`** packages. Deployed via **Docker** on a custom Node.js server. |
| **Sourcing Worker (NestJS)** | Communicates via **Message Queue** and **DB Connection**. Consumes **`drizzle`** directly. Uses **Jest** for testing. |
| **Shared Package** | Renamed to **`shared`**. Contains shared utility types. **No build step**; exports pure TS files. |
| **Drizzle Package** | Renamed to **`db`** (or stick with `drizzle`? Let's use **`db`** for clarity). Contains **all DB-related setup**, including schemas and config. Configured for **PostgreSQL**. Exports **only the schemas**. |

-----

## Next Steps: Initial Configuration

Based on these choices, we can define the core structure and configuration files.

### 1\. Directory Structure 📂

Your root structure will look like this:

```
/
├── packages/
│   ├── frontend/         # Next.js App
│   ├── sourcing-worker/  # NestJS App
│   ├── shared/           # Pure TS Library (Utility Types)
│   └── db/               # Drizzle Schemas/Config (Postgres)
├── package.json          # Root workspace config
└── pnpm-workspace.yaml   # PNPM configuration
```

### 2\. PNPM Workspace Setup

You'll need a root `package.json` and a `pnpm-workspace.yaml`.

**`pnpm-workspace.yaml`** (To define the workspace root):

```yaml
packages:
  - 'packages/*'
```

**Root `package.json`** (For shared scripts and defining Node version):

We'll use the `"packageManager": "pnpm@latest"` key to enforce PNPM. We'll also set up a basic structure for shared scripts like `lint` and `test`.

```json
{
  "name": "my-pnpm-monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@latest",
  "engines": {
    "node": ">=20.0.0"  // Targetting latest LTS (e.g., Node 20)
  },
  "scripts": {
    "build": "pnpm --filter './packages/*' build",
    "lint": "pnpm --filter './packages/*' lint",
    "test": "pnpm --filter './packages/*' test"
  },
  "devDependencies": {
    // Add TypeScript/ESLint/Prettier here if you want them globally
  }
}
```

### 3\. Package-Specific Details

#### A. `@repo/shared` (Utility Types)

Since you want **no build step**, this package will rely on consumers (like Next.js and NestJS) setting their `tsconfig.json` `moduleResolution` correctly (usually `node` or `bundler` in newer configs) to import the `.ts` files directly.

  * **`package.json` snippet:**
    ```json
    {
      "name": "@repo/shared",
      "version": "1.0.0",
      "type": "module", // Good practice for modern TS export
      "main": "./index.ts", // Point to the main entry file
      "types": "./index.d.ts",
      "files": ["**/*.ts"] // Only include TS files when publishing/linking
    }
    ```
  * **Consumption:** Both `frontend` and `sourcing-worker` will list it under `devDependencies` in their respective `package.json` files to get type checking and auto-completion.

#### B. `@repo/db` (Drizzle Schemas)

This package will hold your Drizzle setup for **PostgreSQL** and export **only the schemas**.

  * **Dependencies:** Will need `drizzle-orm` and the appropriate DB driver (e.g., `pg`).
  * **`package.json` snippet:**
    ```json
    {
      "name": "@repo/db",
      "version": "1.0.0",
      "type": "module",
      "dependencies": {
        "drizzle-orm": "^x.y.z",
        "pg": "^x.y.z"
      },
      "main": "./src/schema.ts", // Points to the main schema file
      "files": ["src/**/*"]
    }
    ```
  * **Migration Management:** Since the **`sourcing-worker`** manages DB interaction and the **`db`** package contains everything, you should place the **Drizzle configuration** (`drizzle.config.ts`) and **migration scripts** inside the **`db`** package. The `sourcing-worker` will depend on `@repo/db` and execute the migrations/queries using the exported schemas.

#### C. `@repo/frontend` (Next.js + Tailwind/ShadCN)

  * **Dependencies:** `next`, `react`, `react-dom`, `@repo/shared`, `@repo/db`.
  * **Dev Dependencies:** `tailwindcss`, `@types/react`, etc.
  * **Next Configuration:** Configure `tailwind.config.js` to reference files in the `packages/frontend` directory and potentially the `packages/shared` directory (if you use shared components/utilities).

#### D. `@repo/sourcing-worker` (NestJS + Message Queue)

  * **Dependencies:** `@nestjs/common`, etc., plus `@repo/shared` and `@repo/db`.
  * **Testing:** Will use **Jest** configured in its own scope, potentially inheriting settings from the root if you add a root Jest configuration later.
