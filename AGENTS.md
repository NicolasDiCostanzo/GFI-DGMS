# GFI-DGMS Development Guide

> Tool-agnostic project context ([AGENTS.md](https://agents.md/) convention) — read by Claude Code, Codex, Copilot, Cursor, Gemini CLI, Aider, Windsurf, and other AI coding tools that support it, as well as human contributors.

## Project Overview

The GoodFoodInstitute ROI is a web component for visualizing and calculating regional impact and ROI data. It outputs as a custom element (`gfi-dgms-widget`) and can be used as a standalone SPA for development.

## Business Context & Scientific Foundation

The system helps global advocacy teams at the Good Food Institute (GFI) engage with policymakers and treasury officials by providing an interactive map and dashboard interface. This interface simulates how public funding shifts into the alternative protein sector translate into tangible regional and national returns. 

The application core maps budget adjustments against localized economic growth, Gross Value Added (GVA), and environmental yields by 2040. To maintain absolute credibility with government ministries, the underlying simulation models are anchored strictly in peer-reviewed scientific, macroeconomic, and lifecycle assessment (LCA) data pools.

### Data & Multiplier Foundations

The internal domain service calculations and static database adapters are structured around the frameworks established in these core reports:

1. **Economic & Job Projections:** Grounded in the *Systemiq & GFI Europe (2026)* macroeconomic impact study: *["Seizing the economic opportunity of alternative proteins in Europe"](https://www.systemiq.earth/wp-content/uploads/2026/01/Seizing-the-economic-opportunity-of-alternative-proteins-in-Europe-report.pdf)*. This research models employment returns, supply chain job creation, and industry value baselines under targeted public funding scenarios across primary European markets (including Germany, France, Spain, and Italy).
2. **Environmental & Carbon Multipliers:** Sourced from the *CE Delft Ex-Ante Lifecycle Assessment (LCA)* framework: *["LCA of Cultivated Meat Report"](https://gfieurope.org/wp-content/uploads/2022/04/CE_Delft_190107_LCA_of_cultivated_meat_Def.pdf)*. This research provides the greenhouse gas footprint reduction baselines ($CO_2e$ offsets) achieved when diversified alternative proteins displace conventional livestock operations under regional energy grid conditions.

When implementing or updating domain rules, ensure changes directly map to the verified dataset thresholds contained within these source publications.

## Hexagonal Architecture (Ports and Adapters)

Based on [Alistair Cockburn's Hexagonal Architecture](https://medium.com/ssense-tech/hexagonal-architecture-there-are-always-two-sides-to-every-story-bc0780ed7d9c) and Domain-Driven Design principles.

### Core Concepts

- **Ports**: Technology-agnostic entry points that determine the interface allowing foreign actors to communicate with the Application. Represented as interfaces in code.
- **Adapters**: Components that initiate interaction with the Application through a Port, using a specific technology (e.g., a REST controller, Vue component).
- **Application (The Core)**: The core of the system containing Application Services (orchestrating functionality/use cases) and the Domain Model (business logic).

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                               src/                                            │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           <bounded-context>/                            │  │
│  │  ┌───────────────┐    ┌──────────────┐    ┌──────────────┐              │  │
│  │  │   domain/     │    │    app/      │    │infrastructure│              │  │
│  │  │               │    │              │    │              │              │  │
│  │  │• entities     │    │• use cases   │    │• adapters    │              │  │
│  │  │• value objects│    │• services    │    │• UI          │              │  │
│  │  │• services     │    │              │    │• external    │              │  │
│  │  └───────────────┘    └──────────────┘    └──────────────┘              │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           shared/                                       │  │
│  │  ┌──────────────┐                                                       │  │
│  │  │              │                                                       │  │
│  │  │• utilities   │                                                       │  │
│  │  │• types       │                                                       │  │
│  │  │• constants   │                                                       │  │
│  │  └──────────────┘                                                       │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Dependency Rules (Dependency Inversion)

These rules are enforced by `dependency-cruiser` (run `npm run depcruise`):

| From Layer | Must NOT Import From | MAY Import From |
|------------|---------------------|-----------------|
| `src/<bounded-context>/domain/` | `src/<bounded-context>/infrastructure/`, `src/<bounded-context>/app/`, `vue` | `src/shared/` |
| `src/<bounded-context>/app/` | `src/<bounded-context>/infrastructure/` | `src/<bounded-context>/domain/`, `src/shared/` |
| `src/<bounded-context>/infrastructure/` | - | `src/<bounded-context>/domain/`, `src/<bounded-context>/app/`, `src/shared/` |
| `src/shared/` | - | `src/shared/` (self) |

### Two Sides of the Architecture

- **Driving (Primary) Side**: Actors that initiate interaction (e.g., user interface, controllers). Driving Adapters use a Port, and an Application Service implements the interface defined by that Port.
- **Driven (Secondary) Side**: Actors "kicked into behavior" by the Application (e.g., databases, external APIs). Driven Adapters implement the Port, and an Application Service uses it.

### Benefits

- Complete isolation of application and domain logic, making it fully testable
- Designing system interfaces "by purpose" rather than by technology
- No vendor lock-in; tech stack can evolve easily
- Plays well with Domain-Driven Design by shielding domain logic

## Domain-Driven Design (DDD)

Based on [Eric Evans' Domain-Driven Design](https://ddd.academy/blog/what-is-ddd-by-eric-evans) principles.

### Core Concepts

- **Models**: Purpose-driven abstractions, not realistic representations of reality. They embody specific assumptions and make deliberate trade-offs.
- **Ubiquitous Language**: Building the domain language directly into the code to bridge the gap between domain experts and developers.
- **Bounded Contexts**: Separate conceptual areas within a larger system, each with its own model and ubiquitous language.

### Key Principles

- **Fit, Not Perfection**: The goal is to have a model well-suited to specific problems within the domain and context, not a perfect model.
- **Domain Complexity**: This project focuses on domain complexity (ROI calculations, geographic projections) rather than technical complexity.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Vue | ^3.5.40 (peer) |
| Language | TypeScript | ^5.9.3 |
| Build | Vite | ^8.1.5 |
| Visualization | d3-geo | ^3.1.1 |
| Data | topojson-client, world-atlas | ^3.1.0, ^2.0.2 |
| Testing | Vitest, @vitest/coverage-istanbul | ^4.1.10 |
| E2E | Playwright | ^1.61.1 |
| Coverage | nyc | ^18.0.0 |
| Linting | ESLint | ^10.7.0 |
| | @typescript-eslint/parser, @typescript-eslint/eslint-plugin | ^8.64.0 |
| Formatting | Prettier | ^3.9.5 |

## File Structure

### `src/<bounded-context>/domain/`

- **Purpose**: Pure business logic, no external dependencies
- **Contents**:
  - Domain entities (e.g., `Country`)
  - Value objects (e.g., `TargetBudget`, `Currency`)
  - Domain errors (e.g., `DomainError`)
- **Rules**: No Vue, no infrastructure imports, no side effects

### `src/<bounded-context>/app/`

- **Purpose**: Use case orchestration and application logic
- **Contents**:
  - `use-cases/` - Application use cases (e.g., `LoadGeoData`, `CalculateROI`)
  - `services/` - Application services
- **Rules**: Depends only on domain abstractions (ports), not infrastructure

### `src/<bounded-context>/infrastructure/`

- **Purpose**: Adapters, UI components, external integrations
- **Contents**:
  - `adapters/` - Port implementations (e.g., `GeoDataAdapter`)
  - `ui/` - Vue components
  - `api/` - External API clients
- **Rules**: Can import from any inner layer

### `src/shared/`

- **Purpose**: Shared utilities, types, and constants
- **Contents**:
  - `utils/` - Pure utility functions
  - `types/` - Shared TypeScript types
  - `constants/` - Application constants

## Coding Standards

- **Immutability**: All domain objects must be immutable
- **Pure Functions**: Domain layer functions must be pure (no side effects)
- **No Framework Dependencies**: Domain layer must not import Vue or any framework
- **Type Safety**: Strict TypeScript with `noUnusedLocals` and `noUnusedParameters`
- **Formatting**: Prettier with 4-space indentation, single quotes, trailing commas
- **Test Coverage**: 100% required for lines, functions, branches, and statements

## Testing Requirements

### Unit/Integration Tests

- **Framework**: Vitest
- **Environment**: node
- **Location**: `src/**/*.{test,spec}.{ts,js}`
- **Coverage**: 100% threshold enforced

### Test Style

- Use loops (e.g. `it.each`) over repeated near-identical test cases instead of copy-pasting assertions, to keep tests condensed and readable.
- Store test data in dedicated `.fixtures` files instead of declaring long literals inline in the test file.

### E2E Tests

- **Framework**: Playwright
- **Location**: `e2e/`
- **Browser**: Chromium (Desktop Chrome)

### Coverage Merging

- Code is instrumented via Istanbul (`vite-plugin-istanbul`, configured in `vite.config.ts`), active whenever `VITE_COVERAGE=true`.
- `e2e/coverage-fixtures.ts` extracts `window.__coverage__` after each Playwright test and dumps it as raw Istanbul coverage into `.nyc_output/`.
- Vitest's istanbul provider emits `coverage/coverage-final.json` (via the `json` reporter in `vitest.config.ts`).
- `npm run test:coverage:merge` combines both into `coverage/merged/coverage-final.json` (`nyc merge`) and enforces the 100% threshold across the union of unit and E2E coverage (`nyc report --check-coverage`). This is what makes 100% achievable at all: `src/main.ts` is excluded from the Vitest run (only exercised through the browser) and is only covered thanks to the E2E contribution.
- `npm run test:coverage:all` runs the full chain locally: clean → unit tests → E2E → merge.
- The dev server disables HMR when `VITE_COVERAGE=true` (see `vite.config.ts`): HMR wiring code (`import.meta.hot.accept(...)`) gets instrumented but can never execute in an automated test run, which otherwise makes 100% permanently unreachable.
- `nyc report` requires `--extension .vue` in addition to `.ts`/`.js` — its default extension list silently drops `.vue` files from the report.

## Build Targets

- **Custom Element**: `gfi-dgms-widget` (defined in `src/sovereign/infrastructure/ui/entry/gfi-dgms-widget.ce.ts`)
- **Output Formats**: ES module (`gfi-dgms-widget.js`) and UMD (`gfi-dgms-widget.umd.js`)
- **Development**: Standalone SPA via `index.html`; embed test via `embed-test.html`
- **Self-contained**: Vue is bundled into the output so the widget can be embedded on any host page (WordPress, Wix, etc.) without loading a separate Vue runtime
- **Bundle size**: `npm run check:size` enforces a gzip limit (default 120 kB, configurable via `MAX_GZIP_KB`); the 110m world topology is used to keep the bundle small, with Malta (ISO 470) added as a point feature

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build library (TypeScript + Vite) |
| `npm run preview` | Preview built library |
| `npm run typecheck` | Run `vue-tsc` for type checking |
| `npm run lint` | Run ESLint on source files |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run depcruise` | Validate architecture dependencies |
| `npm run check` | Run all checks (lint, format, typecheck, depcruise) |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:coverage:merge` | Merge Vitest + Playwright coverage and enforce the 100% threshold on the union (requires `test:coverage` and `test:e2e` to have run first) |
| `npm run test:coverage:all` | Full local chain: clean → `test:coverage` → `test:e2e` → `test:coverage:merge` |
| `npm run check:size` | Verify the built ES bundle stays under the gzip size limit (default 120 kB) |

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs these jobs on every push/PR to `main`:
1. Lint check (`npm run lint`)
2. Format check (`npm run format:check`)
3. TypeScript type check (`npm run typecheck`)
4. Architecture validation (`npm run depcruise`)
5. Unit/integration tests with coverage (`npm run test:coverage`), uploads `coverage/coverage-final.json` as an artifact
6. Security audit (`npm audit --audit-level=high`)
7. Build (`npm run build`)
8. E2E tests (`npm run test:e2e`, Chromium only), uploads `.nyc_output/` as an artifact
9. `coverage-merge` (needs jobs 5 and 8): downloads both artifacts and runs `npm run test:coverage:merge` — the final, authoritative 100% coverage gate across unit + E2E combined

`axe-playwright` is installed but not yet wired into the pipeline (no accessibility gate). The `build` job also runs `npm run check:size` to enforce the gzip bundle-size limit.

## Implementation Workflow

Once a plan has been validated, implement it one step at a time, following this loop per step:

1. Write the tests for the step.
2. Wait for validation.
3. Write the implementation for the step.
4. Wait for validation.
5. Move to the next step and repeat from 1.

## Notes

- All new code must follow the dependency rules to pass CI checks
- Unit/integration test files should be placed alongside source files with `.spec.ts` suffix
- E2E test files are located in the `e2e/` directory
