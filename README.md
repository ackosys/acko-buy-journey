# ACKO Insurance – Buy Journey 2.5

A modular, conversational insurance buy journey built with **Next.js 14**, **TypeScript**, **Zustand**, **Framer Motion**, and **Tailwind CSS**.

## Architecture

The project follows a **modular LOB-isolated architecture** where each Line of Business (Health, Motor, Life) operates as an independent module while sharing a common core.

```
prototype/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Global Entry Homepage
│   ├── layout.tsx          # Root layout
│   └── health/page.tsx     # Health Insurance journey
├── components/
│   ├── core/               # Shared UI components (all LOBs)
│   ├── global/             # Global homepage components
│   └── health/             # Health-specific components
└── lib/
    ├── core/               # Shared engine (types, store factory, personas, translations)
    └── health/             # Health-specific logic (scripts, plans, store, translations)
```

### Key Design Principles

- **Conversational UI** – Progressive information collection through chat-like interactions
- **LOB Isolation** – Each LOB owns its journey flow, eligibility logic, decision rules, and data models
- **Shared Core** – Common conversation engine, store factory, persona system, and translation hooks
- **Parallel Development** – Multiple developers can work on different LOBs without merge conflicts

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the Global Entry Homepage.  
Navigate to [http://localhost:3000/health](http://localhost:3000/health) for the Health Insurance journey.

## Scripts

| Command         | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Start development server   |
| `npm run build` | Create production build    |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |

## Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| Next.js 14       | React framework (App Router)   |
| TypeScript       | Type safety                    |
| Zustand          | Lightweight state management   |
| Framer Motion    | Animations & transitions       |
| Tailwind CSS     | Utility-first styling          |

## Adding a New LOB

1. Create `lib/<lob>/` with types, store, scripts, personas, and translations
2. Create `components/<lob>/` for LOB-specific UI
3. Create `app/<lob>/page.tsx` for the route
4. Register the LOB in `components/global/LobSelector.tsx`

Each LOB extends the shared `BaseJourneyState` and uses `createJourneyStore()` from `lib/core/createStore.ts`.

## License

Proprietary – ACKO Technology & Services Pvt. Ltd.
