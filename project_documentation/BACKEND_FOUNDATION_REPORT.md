# School ERP - Backend Foundation Report (Phase 1 Blueprint)

**Date:** July 3, 2026
**Status:** Blueprint / Pending Implementation
**Purpose:** Outlines the planned Phase 1 Backend Foundation for the future transition from the Mockup.

## 1. Database Architecture
- **Engine:** PostgreSQL
- **ORM:** Drizzle ORM
- **Design Pattern:** Fully normalized relational schema with strict foreign key constraints.

## 2. Core Schema Elements
- **Audit Columns:** Every table includes `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.
- **Soft Deletion:** Implemented universally to preserve historical ERP data.
- **Multi-tenancy:** Schema designed to accommodate future `tenant_id` (Institution) boundaries.

## 3. Implemented Entities (Planned for Phase 1)
- `users`, `roles`, `permissions`
- `students`, `guardians`, `student_guardians` (Junction)
- `academic_years`, `terms`, `classes`
- `enrollments` (Junction mapping students to classes per year)
- `invoices`, `payments`

## 4. API Foundation
- **Framework:** Express.js + REST standard
- **Versioning:** `/api/v1/*`
- **Validation:** Zod schemas applied at the middleware layer.
- **Layered Architecture:** Routes -> Controllers -> Services -> Repositories.

## 5. Next Steps
Once the project graduates from Frontend Mockup Mode, Phase 1 will be executed to replace `AppContext` with live API calls.
