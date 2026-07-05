# School ERP - Pages Forensics

**Date:** July 3, 2026
**Purpose:** Detailed analysis of existing screens, routing maps, and UI elements.

## Route Map
1. **`/` (Dashboard):** Executive summary. Renders key KPIs, recent activity, and demographic charts.
2. **`/students` (Student Management):** List view of students with filtering. Contains the "Student 360" modal for detailed views.
3. **`/finance` (Financial Management):** Ledger and invoicing view. Tracks paid vs. outstanding fees.
4. **`/academics` (Academics):** Gradebook and attendance records.
5. **`/reports` (Reporting):** Aggregated charts and compliance data.
6. **`/library` (Library):** Book catalog and lending system.
7. **`/transport` (Transport):** Bus route management and assignments.
8. **`/health` (Health Center):** Student medical records and incident logging.

## Component Forensics
- **Navigation Sidebar:** Shared layout wrapper. Maintains active state via wouter's `useLocation`.
- **Data Tables:** Custom-built using `shadcn/ui` Table primitives. Currently lacks virtualization.
- **Forms:** Controlled components using standard React state. Validation is currently rudimentary (HTML5 + manual checks).
- **Modals (Dialogs):** Extensively used for CRUD operations (Add Student, Add Invoice). Need optimization for heavy data entry.
