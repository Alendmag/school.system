# School ERP - Business Rules & Process Architecture

**Document Version:** 1.0  
**Role Context:** Senior ERP Domain Architect  
**Objective:** Define the exhaustive internal mechanics, state transitions, constraints, and dependencies of the School ERP system. This document is the definitive blueprint for the future PostgreSQL schema and REST API.

---

## 1. Business Process Architectures

*(Note: Processes are detailed with strict ERP mechanics)*

### 1.1 Academic Lifecycle Processes

#### Student Promotion
1. **Preconditions:** Academic Year is closed; Student status is 'Active'; Final grades are 'Approved'; No pending disciplinary holds.
2. **Trigger:** Admin initiates "Batch Promotion Workflow".
3. **Validation Rules:** Target Grade Level must exist. Student must have passing GPA. Target Academic Year must be 'Upcoming' or 'Active'.
4. **Main Flow:** System identifies eligible students -> Creates new `Enrollment` record for target year -> Updates student's `gradeLevel` -> Closes current `Enrollment`.
5. **Alternative Flows:** Student fails -> Retained in current grade level -> New `Enrollment` created for same grade in new year.
6. **Exception Flows:** Target class capacity exceeded -> Promotion deferred, student flagged for manual class assignment.
7. **Business Constraints:** Cannot promote to a non-existent academic year.
8. **Postconditions:** Student is enrolled in the new academic year.
9. **Data Created:** New `Enrollment` record. New `Invoice` (Tuition for new year).
10. **Data Updated:** `Student` (gradeLevel), Old `Enrollment` (status='Closed').
11. **Data Locked:** Old `Enrollment`, Old `Grades`.
12. **Notifications Generated:** Parent (Promotion Success + New Invoice).
13. **Reports Affected:** Enrollment Demographics, Financial Projections.
14. **Audit Log Entries:** `BATCH_PROMOTION_EXEC`, `ENROLLMENT_CREATED`.
15. **Security Requirements:** Role: Admin only.

#### Student Transfer (Leaving School)
1. **Preconditions:** Student is 'Active'.
2. **Trigger:** Parent/Admin requests Transfer Certificate (TC).
3. **Validation Rules:** Outstanding Balance MUST be exactly 0.00. Library books must be returned.
4. **Main Flow:** Validate balances -> Generate TC -> Mark Student as 'Transferred' -> Close active Enrollments.
5. **Alternative Flows:** Outstanding balance > 0 -> Transfer blocked -> Generate outstanding invoice statement.
6. **Exception Flows:** Student has unreturned books -> Block transfer -> Auto-generate 'Lost Book' invoice -> Proceed to Alt Flow.
7. **Business Constraints:** A transferred student's historical data CANNOT be deleted.
8. **Postconditions:** Student loses portal access. Status is 'Transferred'.
9. **Data Created:** Transfer Certificate (Document).
10. **Data Updated:** `Student` (status), `Enrollment` (status).
11. **Data Locked:** `Student` profile, all `Invoices`.
12. **Notifications Generated:** Admin, Parent.
13. **Reports Affected:** Active Student Count, Retention Rate.
14. **Audit Log Entries:** `STUDENT_TRANSFERRED`, `TC_GENERATED`.
15. **Security Requirements:** Role: Admin/Registrar.

#### Academic Year Closing
1. **Preconditions:** All Term Exams are 'Completed'. All Grades are 'Approved'.
2. **Trigger:** Admin executes "Close Academic Year".
3. **Validation Rules:** No pending grades. No open attendance registers.
4. **Main Flow:** Lock all academic data for the year -> Calculate final rankings -> Change Year status to 'Closed' -> Change next year status to 'Active'.
5. **Alternative Flows:** Pending grades found -> Process blocked -> Display list of pending subjects.
6. **Exception Flows:** Database timeout during batch lock -> Rollback transaction.
7. **Business Constraints:** A closed Academic Year can NEVER be reopened.
8. **Postconditions:** System context shifts to the new Academic Year.
9. **Data Created:** Final Year Aggregates (Materialized).
10. **Data Updated:** `AcademicYear` (status).
11. **Data Locked:** `Grades`, `AttendanceRecords`, `Assignments`, `Enrollments`.
12. **Notifications Generated:** System-wide broadcast to Staff.
13. **Reports Affected:** Annual Academic Report.
14. **Audit Log Entries:** `ACADEMIC_YEAR_CLOSED`.
15. **Security Requirements:** Role: Super Admin.

### 1.2 Financial Lifecycle Processes

#### Invoice Cancellation
1. **Preconditions:** Invoice status is 'Pending' or 'Overdue'.
2. **Trigger:** Finance Admin requests cancellation.
3. **Validation Rules:** Invoice MUST NOT have any associated 'Successful' Payments.
4. **Main Flow:** Mark Invoice as 'Cancelled' -> Add cancellation reason -> Nullify from outstanding balance.
5. **Alternative Flows:** Invoice has partial payments -> Cannot cancel -> Must issue 'Credit Note' instead.
6. **Exception Flows:** Invoice linked to a closed financial period -> Cancellation blocked.
7. **Business Constraints:** Cancelled invoices remain in the database for audit (Soft delete/Status change, never hard delete).
8. **Postconditions:** Student outstanding balance decreases by invoice amount.
9. **Data Created:** None (unless Credit Note is used).
10. **Data Updated:** `Invoice` (status='Cancelled', cancellation_reason).
11. **Data Locked:** `Invoice`.
12. **Notifications Generated:** Parent (Invoice Cancelled).
13. **Reports Affected:** Projected Revenue, Outstanding Balances.
14. **Audit Log Entries:** `INVOICE_CANCELLED`.
15. **Security Requirements:** Role: Finance Admin.

#### Partial Payment
1. **Preconditions:** Invoice status is 'Pending' or 'Overdue'. Amount > 0.
2. **Trigger:** Cashier/Gateway logs payment.
3. **Validation Rules:** Payment Amount MUST be > 0 and < Invoice Total.
4. **Main Flow:** Record Payment -> Update Invoice Status to 'Partial' -> Recalculate Outstanding.
5. **Alternative Flows:** Payment Amount == Invoice Total -> Execute Full Payment process.
6. **Exception Flows:** Payment failed/bounced -> Revert Payment -> Restore Invoice status.
7. **Business Constraints:** Partial payments cannot exceed the invoice total.
8. **Postconditions:** Invoice remains open but outstanding balance is reduced.
9. **Data Created:** `Payment`, `Receipt`.
10. **Data Updated:** `Invoice` (status='Partial', amount_paid).
11. **Data Locked:** `Payment` record (immutable once logged).
12. **Notifications Generated:** Parent (Receipt generated).
13. **Reports Affected:** Cash Flow, Daily Collection.
14. **Audit Log Entries:** `PAYMENT_RECEIVED`, `RECEIPT_GENERATED`.
15. **Security Requirements:** Role: Cashier, Parent (via gateway).

### 1.3 Assessment & Grading Processes

#### Grade Modification
1. **Preconditions:** Grade entry exists.
2. **Trigger:** Teacher requests modification.
3. **Validation Rules:** Assignment/Exam MUST NOT be 'Approved' or 'Locked'.
4. **Main Flow:** Update score -> Recalculate GPA -> Save.
5. **Alternative Flows:** Assignment IS 'Approved' -> Teacher cannot modify -> Must submit "Grade Change Request" to Admin -> Admin approves -> Admin modifies.
6. **Exception Flows:** New score exceeds `totalMarks` -> Reject.
7. **Business Constraints:** Grade modification after approval requires a strict audit trail containing the "Reason for Change".
8. **Postconditions:** Student GPA is updated.
9. **Data Created:** `GradeChangeRequest` (if alternative flow).
10. **Data Updated:** `GradeEntry` (score, updated_at).
11. **Data Locked:** None.
12. **Notifications Generated:** Admin (if request needed). Student (if grade was already published).
13. **Reports Affected:** Report Cards, Class Ranking.
14. **Audit Log Entries:** `GRADE_MODIFIED_PRE_APPROVAL` or `GRADE_MODIFIED_POST_APPROVAL`.
15. **Security Requirements:** Role: Teacher (Pre-approval), Admin (Post-approval).

### 1.4 Attendance Processes

#### Attendance Locking
1. **Preconditions:** Date is in the past.
2. **Trigger:** Nightly cron job OR End of Month trigger.
3. **Validation Rules:** All registers for the date must be submitted.
4. **Main Flow:** Mark all `AttendanceRecord`s for the date/period as 'Locked'.
5. **Alternative Flows:** Registers missing -> Auto-fill missing with 'Present' (or default policy) -> Lock.
6. **Exception Flows:** System outage -> Retry next cycle.
7. **Business Constraints:** Teachers cannot modify attendance for days > X days in the past (e.g., > 3 days).
8. **Postconditions:** Attendance is read-only for Teachers.
9. **Data Created:** None.
10. **Data Updated:** `AttendanceRecord` (is_locked=true).
11. **Data Locked:** `AttendanceRecord`.
12. **Notifications Generated:** Admin (if registers were missing).
13. **Reports Affected:** Monthly Attendance Report.
14. **Audit Log Entries:** `ATTENDANCE_LOCKED`.
15. **Security Requirements:** Role: System / Admin.

---

## 2. Entity Lifecycle & State Transitions

### Student
* **Draft:** Application submitted, pending review.
* **Active:** Enrolled in a current class. Normal operations permitted.
* **Suspended:** Temporary halt. Cannot attend classes, portal access restricted. Financials still accrue.
* **Transferred:** Left for another school. Read-only. Access revoked.
* **Graduated:** Completed highest grade. Read-only. Access shifts to Alumni mode.
* **Withdrawn:** Dropped out. Read-only.
* *Legal Transitions:* Draft -> Active -> Suspended -> Active. Active -> Transferred / Graduated / Withdrawn.

### Invoice
* **Draft:** Being generated, not visible to parents.
* **Pending:** Issued, awaiting payment. Visible to parents.
* **Partial:** Partially paid. Still active.
* **Paid:** Fully paid. Locked.
* **Overdue:** Due date passed, unpaid. Penalties may apply.
* **Cancelled:** Voided by admin. Locked.
* *Legal Transitions:* Draft -> Pending -> Partial -> Paid. Pending -> Overdue -> Paid. Pending -> Cancelled.

### GradeEntry / Assignment
* **Draft:** Teacher preparing questions.
* **Active:** Published to students.
* **Submitted:** Student completed work.
* **Graded:** Teacher entered raw marks.
* **Approved:** HOD/Admin verified.
* **Locked:** Term closed. Immutable.
* *Legal Transitions:* Draft -> Active -> Submitted -> Graded -> Approved -> Locked.

---

## 3. ERP State Machine

The ERP operates on a **Hierarchical Time-Bound State Machine**.
1. **Macro State:** `AcademicYear` dictates the global context. If the Year is closed, all child entities (Enrollments, Grades, Attendance) automatically transition to `Locked`.
2. **Meso State:** `Term/Semester`. Controls grading windows. When Term is `Closed`, grade entry forms disable globally.
3. **Micro State:** `Invoice` and `Attendance`. These operate independently on daily/monthly cycles, governed by chronological constraints (e.g., Attendance auto-locks after 72 hours).

---

## 4. Cross Module Dependency Matrix

| Module | Affects | Affected By | Constraint Example |
| :--- | :--- | :--- | :--- |
| **Students** | Academics, Finance, Transport | Guardians, Classes | Cannot delete a student with Invoices. |
| **Finance** | Students (Transfer blocks) | Transport, Library | Transport fees auto-generate on route assignment. |
| **Academics**| Grades, Timetable | Teachers, Students | Cannot assign teacher if subject not in curriculum. |
| **Attendance**| Reports, Notifications | Academics (Timetable) | Cannot mark attendance for unassigned days. |
| **Library** | Finance (Late Fees) | Students, Books | Cannot borrow if outstanding fines exist. |

---

## 5. Database Design Recommendations (Rules for PostgreSQL Schema)

The future PostgreSQL database MUST strictly enforce these business rules via schema design, constraints, and triggers:

1. **Multi-Tenancy:** EVERY core table (except global system config) MUST have a `tenant_id` UUID.
2. **Immutability of Financials:** `invoices`, `payments`, and `receipts` must NOT have `ON DELETE CASCADE`. If a student is deleted, financial records must prevent the deletion (`RESTRICT`).
3. **Ledger Design:** Implement a double-entry journal pattern for `transactions`. Payments should credit the cash account and debit the student's accounts receivable.
4. **Soft Deletes:** Tables must have a `deleted_at` TIMESTAMP. Hard deletes are explicitly forbidden in ERPs.
5. **Historical Integrity:** `enrollments` must be a separate table linking `student_id`, `class_id`, and `academic_year_id`. A student's current class is a derived view of their active enrollment, NOT a direct column on the `students` table.
6. **Audit Trails:** A separate `audit_logs` table must exist, capturing `table_name`, `record_id`, `action`, `old_payload` (JSONB), `new_payload` (JSONB), and `user_id`.
7. **Array Anti-Pattern:** Do not use `TEXT[]` or JSON arrays for relationships (like `subjectIds` on teachers). Must use explicit junction tables (`teacher_subjects`).
8. **Concurrency:** `available_copies` in `library_books` must be updated using row-level locking (`SELECT FOR UPDATE`) to prevent double-borrowing race conditions.
