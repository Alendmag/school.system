# School ERP - Product Refinement Backlog

**Date:** July 5, 2026
**Prepared By:** Senior Product Team (Product Manager, ERP UX Architect, Frontend Engineer, Operations Consultant, Design System Architect, HCI Expert)
**Objective:** Transform the ERP frontend into a high-productivity, commercially viable product by prioritizing high-ROI usability and workflow improvements.

---

## 1. Methodology & Filtering

We reviewed the 10 architecture and UX/UI audit documents. To create this backlog, we ruthlessly filtered out:
* **Cosmetic-only changes** (e.g., tweaking shadow opacities unless it affects hierarchy).
* **Duplicate recommendations** across audits.
* **Low-value features** that do not directly save time or prevent errors for school staff.

The resulting backlog focuses strictly on **Data-Entry Speed, Cognitive Load Reduction, Error Prevention, and Operational Efficiency.**

---

## 2. Top 30 Highest ROI Improvements

These 30 items represent the core of the upcoming frontend refinement phase.

### P0 – Critical (Must have for Commercial Demo)
1. **Spreadsheet Mode for Grades:** Excel-like grid for rapid, mouseless data entry.
2. **Spreadsheet Mode for Attendance:** Class-wide grid, defaulting to "Present."
3. **Slide-out Sheets for Admissions:** Replace cramped modals with full-height slide-out sheets for complex forms.
4. **Command Palette (Ctrl+K):** Global search and quick-action navigation.
5. **Bulk Invoice Generation:** Checkbox selection to apply fees to entire classes instantly.
6. **Global Keyboard Shortcuts (Core):** `Ctrl+S` (Save), `Esc` (Close with unsaved warning), `Enter` (Submit).
7. **Table Bulk Actions:** Select multiple rows to Delete, Promote, or Change Status.

### P1 – High Priority (Massive Productivity Gains)
8. **Auto-focus & Tab Indexing:** First field auto-focus on all forms; strict, unbroken tab sequencing.
9. **Data Table Virtualization:** Render 1000+ rows without freezing the DOM.
10. **Right-click Context Menus:** Edit/Delete/View actions without chasing the "..." button.
11. **Sticky Table Headers:** Headers remain visible during deep vertical scrolling.
12. **Print-Optimized CSS:** `@media print` stylesheets stripping UI elements for A4 MOE reporting.
13. **Local Storage Form Caching:** Save complex form drafts automatically to prevent data loss on refresh.
14. **Quick Create FAB:** Floating Action Button (`Alt+N`) to create records from anywhere.
15. **Advanced Smart Filters:** Combinable AND/OR filters for student/financial records.

### P2 – Medium Priority (Workflow Polish)
16. **Split View Layout:** List on the left, details on the right to eliminate back-and-forth navigation.
17. **Customizable Dashboard Layout:** Drag-and-drop widgets.
18. **Saved Filter Presets:** Allow principals/clerks to save frequent search queries.
19. **Inline Table Editing:** Double-click a cell to edit directly without opening a form.
20. **Duplicate/Clone Record:** Button to copy a sibling's data for faster family registration.
21. **Currency Auto-formatting:** Format numbers on blur (1000 -> 1,000.00).
22. **Date Keyboard Input:** Type "0101" to auto-format to the current year's date.
23. **"Undo" Toast (5 seconds):** Catch accidental deletions before they commit.
24. **Multi-select Checkbox Dropdowns:** Faster than standard tag-selects.

### P3 – Future (Post-Backend / Advanced)
25. **Internal Multi-tab Workspace:** Open multiple student profiles within the app framework.
26. **Role-Specific Dashboard Masks:** Completely different views for Accountants vs. Teachers.
27. **Predictive Search Tolerance:** Handle Arabic/English keyboard layout typos (e.g., typing "lpl]" for "محمد").
28. **Batch Printing:** Generate 500 PDF report cards in one click.
29. **Visual Loading Skeletons:** Replace blocking spinners with skeleton layouts.
30. **Cash Register Mode:** Specialized ultra-fast UI for accountants taking cash payments.

---

## 3. Detailed Backlog Classification

### P0 Items (Critical Details)

**1. Spreadsheet Mode for Grades**
* **Title:** Implement Hands-on-Keyboard Grade Grid
* **Business value:** Reduces grade entry time by 80%.
* **User roles affected:** Teachers, Academic Admins.
* **Expected productivity impact:** 500 clicks saved per class.
* **Complexity:** High (requires custom grid component or library).
* **Dependencies:** None.
* **Estimated implementation time:** 3 Days.
* **Recommended priority:** P0

**2. Spreadsheet Mode for Attendance**
* **Title:** Default-Present Attendance Grid
* **Business value:** Reduces daily administrative overhead.
* **User roles affected:** Teachers.
* **Expected productivity impact:** 60 clicks reduced to 2 clicks per average class.
* **Complexity:** Medium.
* **Dependencies:** None.
* **Estimated implementation time:** 2 Days.
* **Recommended priority:** P0

**3. Slide-out Sheets for Admissions**
* **Title:** Replace CRUD Modals with Slide-out Sheets (Sheet Component)
* **Business value:** Prevents accidental data loss, provides space for 20+ fields.
* **User roles affected:** Registrars.
* **Expected productivity impact:** Zero data loss, faster visual scanning.
* **Complexity:** Low.
* **Dependencies:** Shadcn Sheet component.
* **Estimated implementation time:** 1 Day.
* **Recommended priority:** P0

**4. Command Palette (Ctrl+K)**
* **Title:** Global Command Palette Navigation
* **Business value:** "Wow" factor for demos; instant navigation for power users.
* **User roles affected:** All.
* **Expected productivity impact:** Eliminates mouse travel time for navigation.
* **Complexity:** Medium.
* **Dependencies:** `cmdk` or Shadcn Command.
* **Estimated implementation time:** 2 Days.
* **Recommended priority:** P0

**5. Bulk Invoice Generation**
* **Title:** Checkbox-driven Bulk Invoicing
* **Business value:** Critical for school financial viability (billing entire grades at once).
* **User roles affected:** Accountants.
* **Expected productivity impact:** Turns a 3-hour task into a 3-minute task.
* **Complexity:** Medium.
* **Dependencies:** Table Row Selection.
* **Estimated implementation time:** 2 Days.
* **Recommended priority:** P0

---

## 4. Implementation Roadmap (Frontend Refinement)

### Sprint 1: Speed & Navigation (The Power-User Sprint)
**Focus:** Keyboard efficiency, rapid navigation, and data entry safety.
* Implement Command Palette (Ctrl+K).
* Map Global Keyboard Shortcuts (Ctrl+S, Esc, Alt+N).
* Convert all major Data Entry Modals to Slide-out Sheets.
* Implement Auto-focus and strict Tab indexing on all forms.
* Implement Local Storage Form Caching.

### Sprint 2: The Grid & Data Density (The Clerical Sprint)
**Focus:** Spreadsheet-style entry for high-volume tasks.
* Build Spreadsheet Mode for Grades (Keyboard arrow navigation).
* Build Spreadsheet Mode for Attendance (Default "Present").
* Implement Data Table Virtualization for large lists.
* Add Sticky Headers to all data tables.

### Sprint 3: Bulk Operations & Actions (The Management Sprint)
**Focus:** Operating on multiple records simultaneously.
* Implement Table Row Selection (Checkboxes).
* Build Bulk Invoice Generation workflow.
* Add Bulk Delete / Bulk Status Update actions.
* Add Right-click Context Menus to table rows.
* Implement Quick Create Floating Action Button (FAB).

### Sprint 4: Polish & Reporting (The Executive Sprint)
**Focus:** Advanced UX, printing, and executive features.
* Create `@media print` CSS for Invoices and MOE Reports.
* Implement Advanced Smart Filters with Save functionality.
* Add Currency Auto-formatting and Date Keyboard Input shortcuts.
* Implement "Undo" toast notifications for destructive actions.
* Audit and implement Visual Loading Skeletons across modules.

---
*End of Document*
