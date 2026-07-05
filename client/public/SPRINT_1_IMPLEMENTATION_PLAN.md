# School ERP - Sprint 1 Implementation Plan

**Date:** July 5, 2026
**Role:** Engineering Lead
**Sprint Focus:** The Power-User Sprint (Speed & Navigation)

---

## 1. Sprint Objective
The primary objective of Sprint 1 is to dramatically increase the raw data-entry speed and navigational efficiency for power users (clerks, registrars, and accountants). By the end of this sprint, a user should be able to navigate the entire application and complete core data-entry tasks primarily using the keyboard, with zero risk of accidental data loss from closed modals.

---

## 2. Features Included
1. **Global Command Palette (Ctrl+K):** Instant navigation and quick actions. *Why:* Eliminates mouse travel time and flattens the deep hierarchy.
2. **Global Keyboard Shortcuts (Ctrl+S, Esc, Alt+N):** *Why:* Fundamental for power-user productivity.
3. **Convert CRUD Modals to Slide-out Sheets:** For Student Admissions and Invoice Creation. *Why:* Prevents accidental clicks from closing complex forms, provides more visual space.
4. **Auto-focus & Strict Tab Indexing:** First field auto-focus on all forms. *Why:* Reduces the initial click required to start typing.
5. **Local Storage Form Caching:** Save drafts automatically. *Why:* Protects users from internet drops and accidental refreshes during long forms.

---

## 3. Files To Modify & Create

### Feature 1: Command Palette
* **Create:** `client/src/components/ui/command-palette.tsx`
* **Modify:** `client/src/App.tsx` (To mount globally), `client/src/components/Sidebar.tsx` (To trigger via button).
* **Reusable:** Shadcn `<Command>` primitives.

### Feature 2: Global Keyboard Shortcuts
* **Create:** `client/src/hooks/useKeyPress.ts` (Custom hook for global listeners).
* **Modify:** `client/src/context/AppContext.tsx` (To provide global shortcut state), existing forms in `Students.tsx` and `Finance.tsx`.

### Feature 3: Slide-out Sheets (Admissions & Invoices)
* **Modify:** `client/src/pages/Students.tsx`, `client/src/pages/Finance.tsx`.
* **Replace:** Shadcn `<Dialog>` with `<Sheet>`.
* **Reusable:** Existing form components inside the new Sheet wrapper.

### Feature 4: Auto-focus & Tab Indexing
* **Modify:** `client/src/components/ui/input.tsx`, `client/src/pages/Students.tsx` (Registration form), `client/src/pages/Finance.tsx` (Invoice form).

### Feature 5: Local Storage Form Caching
* **Create:** `client/src/hooks/useFormCache.ts`.
* **Modify:** `client/src/pages/Students.tsx` (Registration form).

---

## 4. Component Architecture
* **Post-Sprint Structure:** The global layout (`App.tsx`) will wrap the application in a new `ShortcutProvider` and permanently mount the `<CommandPalette>`. 
* **Reusable Opportunity:** The `useFormCache` hook and `useKeyPress` hook will become standard utilities for all future forms and actions. `<Sheet>` will become the standard container for any form exceeding 5 fields, replacing `<Dialog>`.

---

## 5. UX Changes
* **Navigation:** Users can press `Ctrl+K` anywhere. A spotlight search appears. Typing "Add Student" or "John Doe" instantly navigates them.
* **Forms:** Clicking "Add Student" slides a panel from the left (RTL). The first name field is instantly highlighted. The user types, presses `Tab` through fields, and presses `Ctrl+S` to save. 
* **Safety:** If the user presses `Esc` while typing, a warning appears. If they refresh the page, their partially filled form remains intact upon returning.

---

## 6. Risk Assessment

| Feature | Regression Risk | Performance Risk | RTL / Responsive Risk | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **Command Palette** | Low | Medium (If searching full DB client-side) | Medium (Animation direction in RTL) | Limit search index to top 100 items/menus. Test slide-in animations in RTL. |
| **Keyboard Shortcuts** | High (Conflicts with browser/OS defaults) | Low | Low | Avoid overriding critical OS shortcuts. Use `e.preventDefault()` carefully. |
| **Slide-out Sheets** | Medium (Form state resets on unmount) | Low | High (Must slide from Right to Left in Arabic) | Ensure Shadcn `<Sheet>` handles RTL context (`dir="rtl"`) properly. Lift state up if necessary. |
| **Auto-focus** | Low | Low | Low (Mobile keyboard pop-ups) | Disable auto-focus on mobile viewports to prevent jarring keyboard pops. |
| **Form Caching** | Low | Low | Low | Clear cache strictly upon successful submission. |

---

## 7. Dependency Graph (Implementation Order)
1. **Foundation:** Implement `useKeyPress` hook (No dependencies).
2. **Infrastructure:** Implement Command Palette (Depends on routing map).
3. **UI Swap:** Convert Modals to Sheets in Students/Finance (Depends on Shadcn Sheet component).
4. **UX Polish:** Add Auto-focus to the new Sheets.
5. **Data Safety:** Implement `useFormCache` on the new Sheets.
6. **Integration:** Bind Global Shortcuts (`Ctrl+S`, `Esc`) to the active Sheets.

---

## 8. Acceptance Criteria
* `Ctrl+K` opens the Command Palette on any page.
* Command Palette accurately routes to `/students`, `/finance`, etc.
* "Add Student" opens a Slide-out Sheet, NOT a center Modal.
* The Sheet slides from the Right edge of the screen (RTL).
* The first input in the Student form has an active cursor immediately upon opening.
* Typing data, refreshing the page, and reopening the form restores the typed data.
* Pressing `Ctrl+S` while the form is open submits the form.
* Pressing `Esc` while the form has dirty data triggers a confirmation alert.

---

## 9. Testing Checklist
- [ ] **Desktop:** Press `Ctrl+K`, type "Fin", press Enter -> routes to Finance.
- [ ] **Desktop:** Open Add Student, type a name, refresh browser, open Add Student -> name is still there.
- [ ] **Desktop:** Fill form, press `Ctrl+S` -> form submits and cache clears.
- [ ] **Tablet:** Ensure Sheet takes up 50-70% of screen width.
- [ ] **Mobile:** Ensure Sheet takes up 100% of screen width. Disable auto-focus to prevent keyboard pop.
- [ ] **RTL:** Ensure Command Palette and Sheets animate from the correct sides and text aligns right.

---

## 10. Estimated Effort
* **Total Effort:** ~10-14 Engineering Hours.
* **Highest-Risk Task:** Command Palette (ensuring it searches efficiently and routes correctly without breaking the client-side Wouter history).
