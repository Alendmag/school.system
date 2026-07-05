# School ERP - Code Wiki

**Date:** July 3, 2026
**Purpose:** Developer reference guide for the frontend codebase architecture and module boundaries.

## 1. Core Architecture
- **Framework:** React 18 + TypeScript + Vite
- **Routing:** `wouter` for lightweight, hook-based routing
- **Styling:** Tailwind CSS + `shadcn/ui` components
- **State Management:** React Context (`AppContext.tsx`)

## 2. Directory Structure
- `/client/src/components/`: Reusable UI elements (cards, dialogs, form inputs)
- `/client/src/pages/`: Top-level route components representing major ERP modules
- `/client/src/context/`: Global state providers (`AppContext`)
- `/client/src/lib/`: Utilities, constants, and data services
  - `types.ts`: Core TypeScript interfaces (Student, Invoice, etc.)
  - `mockData.ts`: Initial dataset for the mockup mode
  - `services.ts`: Business logic encapsulating ERP rules (`ERPServices`)

## 3. Module Boundaries
- **Students:** Handled in `Students.tsx`. Depends on `students` state.
- **Finance:** Handled in `Finance.tsx`. Depends on `invoices` and `payments`.
- **Academics:** Handled in `Academics.tsx`. Depends on `grades` and `attendance`.

## 4. Best Practices
- Keep components purely presentational where possible.
- All complex data derivations (e.g., GPA calculation, outstanding balances) MUST be routed through `ERPServices`.
