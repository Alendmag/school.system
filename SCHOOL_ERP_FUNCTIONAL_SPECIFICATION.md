# School ERP - Functional Specification

**Document Version:** 1.0  
**Role Context:** Senior ERP Business Analyst  
**Objective:** Define the complete functional and business logic landscape of the School ERP system to serve as the blueprint for Database and API architecture.

---

## 1. Complete Module List

1. **Student Management (360° View)**
   * *Purpose:* Manage student lifecycle, demographics, guardians, and aggregate data from all other modules.
   * *Interactions:* Pulls data from Academics, Finance, Attendance, Health, Library, and Transport to create a unified profile.
2. **Academic Management**
   * *Purpose:* Define the educational structure (Years, Terms, Classes, Subjects).
   * *Interactions:* Provides the foundation for Enrollment, Timetabling, Homework, and Examinations.
3. **Teacher / Staff Management**
   * *Purpose:* Manage educator profiles, qualifications, and subject assignments.
   * *Interactions:* Connects to Academics (Subject assignment), Schedule, and Security (Role access).
4. **Examination & Grading**
   * *Purpose:* Manage the assessment lifecycle, track marks, and compute GPA.
   * *Interactions:* Connects to Academics (Subjects), Students, and Reports.
5. **Attendance System**
   * *Purpose:* Track daily/period attendance for students and staff.
   * *Interactions:* Triggers Notifications (absences) and feeds into Reports and Student 360°.
6. **Finance & Billing**
   * *Purpose:* Manage tuition, fees, discounts, and payment collection.
   * *Interactions:* Connects to Students (Accounts), Notifications (Overdue alerts), and Reports (Collection KPIs).
7. **Homework & Assignments**
   * *Purpose:* Manage daily academic tasks and continuous assessment.
   * *Interactions:* Connects to Teachers (Creators), Students (Submitters), and Grades.
8. **Library Management**
   * *Purpose:* Catalog books and track borrowing/returns.
   * *Interactions:* Connects to Students/Teachers (Borrowers) and Finance (Late fees).
9. **Transport Management**
   * *Purpose:* Manage bus routes, capacities, and student assignments.
   * *Interactions:* Connects to Students and Finance (Transport fees).
10. **Health Clinic**
    * *Purpose:* Maintain medical records, allergies, and clinic visits.
    * *Interactions:* Connects to Students and Notifications (Emergency alerts).
11. **Communication & Notifications**
    * *Purpose:* Centralized messaging and system alerts.
    * *Interactions:* Subscribes to events from all modules (Finance, Attendance, Academics).
12. **Reporting & Analytics**
    * *Purpose:* Generate actionable insights and official documents.
    * *Interactions:* Aggregates data across the entire ERP.

---

## 2. Business Processes

### Student Lifecycle
* **Student Admission:** Inquiry received → Application evaluated → Approved/Rejected → Parent notified.
* **Student Enrollment:** Approved student → Assigned Student ID → Assigned to Academic Year/Term → Assigned to Class → Fee structure generated.
* **Class Assignment:** Batch select students → Assign to Class (checking capacity limits) → Generate timetables.
* **Student Transfer:** Request transfer → Settle outstanding financials → Print transfer certificate → Mark status as 'Transferred'.
* **Student Promotion:** End of year → Evaluate Pass/Fail criteria → If Pass: Promote to next Grade Level / Class → Generate new year fees.
* **Student Graduation:** Final year completed → Verify no outstanding dues → Issue Diploma/Certificate → Change status to 'Graduated'.
* **Student Withdrawal:** Parent request → Settle financials → Return library books → Revoke transport → Change status to 'Withdrawn'.

### Daily Operations
* **Attendance Recording:** Teacher opens Class list for the day → Marks Present/Absent/Late → System saves record → If Absent, trigger automatic SMS/Email to Guardian.
* **Homework Assignment:** Teacher selects Subject/Class → Enters details and Due Date → Publishes → Students notified → Students submit → Teacher grades.
* **Medical Visit:** Student arrives at clinic → Nurse opens profile → Logs symptoms/treatment → Checks allergies → If severe, triggers Guardian notification.
* **Library Borrowing/Return:** Librarian scans Book ISBN → Scans Student ID → Checks borrowing limits → Checks outstanding late fees → Approves borrowing / Processes return.

### Financial Workflows
* **Invoice Generation:** Finance team selects Fee Category (e.g., Tuition) → Selects Target (All Students, Specific Grade, Specific Student) → Generates Invoices → Notifications sent.
* **Payment Collection:** Parent logs in or visits cashier → Selects Invoice → Submits Payment (Cash/Card/Transfer) → System generates Receipt → Invoice status updates (Paid/Partial).
* **Partial Payment:** Total Amount X → Payment Y received (Y < X) → Invoice status 'Partial' → Remaining Balance = X - Y.
* **Discount Approval:** Parent requests discount (e.g., Sibling discount) → Admin reviews → Applies percentage/fixed discount to Invoice → Invoice total adjusted.

### Academic Workflows
* **Examination Lifecycle:** Admin creates Exam Schedule → Generates seating/rooms → Exam takes place → Teachers enter raw marks → Admin closes entry.
* **Grade Approval:** Teachers submit marks → Head of Department reviews → Principal approves → Grades locked (read-only) → Published to Students.
* **Report Card Generation:** System aggregates approved grades → Calculates GPA/Rank → Applies templates → Generates PDF → Publishes to Parent portal.
* **Teacher Assignment:** HR registers Teacher → Assigns to Subjects → Maps to Classes based on weekly limits.

---

## 3. Business Rules

### Academic Rules
* **Enrollment:** A student *cannot* be enrolled without an Active Academic Year and a defined Grade Level. Class assignment can be deferred.
* **GPA Calculation:** `GPA = (Sum of (Earned Marks) / Sum of (Total Possible Marks)) * 100`. (Can be adapted to 4.0 scale depending on institution rules).
* **Attendance Percentage:** `(Total Present + Excused) / (Total Working Days) * 100`.

### Financial Rules
* **Invoice Editing:** An invoice *cannot* be deleted or edited once a payment has been applied to it. It must be cancelled via a credit note/reversal.
* **Outstanding Balances:** Calculated globally as `Sum(All Active Invoices) - Sum(All Successful Payments)`.
* **Late Fees:** Automatically applied if `Current Date > Due Date` and Status != 'Paid'.

### Operational Rules
* **Grade Locking:** Grades cannot be modified by a teacher after 'Approval' status is granted. Only an Admin with 'Audit override' can change locked grades.
* **Attendance Modification:** Attendance cannot be modified after the Month is closed, except by Admin.
* **Capacity Limits:** A class cannot accept new enrollments if `Current Students >= Capacity`.
* **Borrowing Limits:** A student cannot borrow a new book if they have overdue books or unpaid library fines.

---

## 4. User Roles

1. **Admin (Super User / Principal)**
   * *Permissions:* Full access to all modules, settings, financial overrides, grade approvals.
   * *Restrictions:* None.
   * *Responsibilities:* System configuration, final approvals, institutional oversight.
2. **Teacher**
   * *Permissions:* View assigned classes, enter attendance for assigned classes, create homework, enter grades, view student medical alerts.
   * *Restrictions:* Cannot view school financials, cannot alter grades after approval, cannot view unassigned students.
   * *Responsibilities:* Daily academic execution, student evaluation.
3. **Student**
   * *Permissions:* View own grades, timetable, homework, attendance, and library status.
   * *Restrictions:* Read-only access. Can only submit homework. Cannot view other students' data.
   * *Responsibilities:* Academic compliance, homework submission.
4. **Parent (Guardian)**
   * *Permissions:* View data for linked children only (Grades, Attendance, Behavior). View and pay financial invoices.
   * *Restrictions:* Cannot modify academic records. Cannot view other families.
   * *Responsibilities:* Financial settlements, tracking student progress.

---

## 5. Required Reports

1. **Academic Performance Report (Report Card)**
   * *Inputs:* Academic Year, Term, Student ID.
   * *Filters:* Class, Subject.
   * *Outputs:* Subject-wise marks, GPA, Teacher remarks, Class Rank.
   * *KPIs:* Student GPA, Pass/Fail status.
2. **Fee Defaulters Report**
   * *Inputs:* Date Date, Fee Category.
   * *Filters:* Grade Level, Amount threshold.
   * *Outputs:* List of students, Guardian contact info, Total Due, Days Overdue.
   * *KPIs:* Total Outstanding Revenue, Aging Analysis.
3. **Daily Attendance Summary**
   * *Inputs:* Date.
   * *Filters:* Grade, Class.
   * *Outputs:* Present count, Absent count, List of absentees.
   * *KPIs:* School Daily Attendance Rate.
4. **Staff Workload Report**
   * *Inputs:* Academic Term.
   * *Outputs:* Teacher name, assigned subjects, total weekly periods.
   * *KPIs:* Average periods per teacher.

---

## 6. Dashboard KPIs

1. **Total Active Students:** Count of students where status = 'active'. Shows institutional scale.
2. **Overall Attendance Rate:** `(Present Students Today / Total Active Students) * 100`. Indicates daily operational health.
3. **Revenue Collected:** Sum of all successful payments in current financial year. Measures financial liquidity.
4. **Outstanding Dues:** Sum of unpaid invoice balances. Highlights collection risks.
5. **Average School GPA:** Average of all student GPAs. Measures academic effectiveness.
6. **Active Assignments:** Count of homework/projects whose due date > today. Shows current academic workload.

---

## 7. Notifications

| Event | Trigger | Recipients | Priority |
| :--- | :--- | :--- | :--- |
| **Absence Alert** | Student marked 'Absent' in daily attendance. | Parent | High |
| **New Invoice** | Finance generates a new fee invoice. | Parent | Medium |
| **Payment Received**| Payment recorded successfully. | Parent, Admin | Medium |
| **Grades Published**| Admin approves Term exams. | Student, Parent | High |
| **Homework Due** | 24 hours before assignment deadline. | Student | Low |
| **Medical Alert** | Nurse logs severe clinic visit / injury. | Parent, Admin | Urgent |
| **Book Overdue** | Library book passes return due date. | Student, Parent | Low |

---

## 8. Missing Business Requirements (Functional Gaps)

To be a fully comprehensive ERP, the following functional business areas are still missing from the design:

* **Admissions CRM:** Managing prospective students, inquiries, entrance exams, and waiting lists before they become enrolled students.
* **Human Resources (HR) & Payroll:** Managing staff contracts, leaves, salary generation, and deductions.
* **Inventory & Asset Management:** Tracking school assets (desks, computers) and consumable inventory (markers, paper) beyond just library books.
* **Timetable Generation Engine:** Algorithmic clash-detection for generating schedules based on teacher availability and room constraints.
* **Disciplinary & Behavior Log:** A formalized points/demerits system for tracking student behavior, detentions, and rewards.
* **Alumni Management:** Tracking graduated students, alumni events, and donations.

---

## 9. Production Readiness Checklist

Before commercializing this ERP SaaS, the following business capabilities MUST be implemented:

- [ ] **Multi-Tenancy Isolation:** Absolute data isolation between different schools sharing the same infrastructure.
- [ ] **Role-Based Access Control (RBAC) Engine:** Ability to define custom roles (e.g., 'Accountant', 'Librarian') with granular feature toggles, rather than hardcoded roles.
- [ ] **Audit Trail / Event Logging:** A non-editable log of who changed what and when (e.g., "User X changed Grade Y from 80 to 90 on Date Z").
- [ ] **End-of-Year Rollover Wizard:** An automated process to archive the current year, promote students, and generate the next academic year cleanly.
- [ ] **Data Import/Export Tools:** CSV/Excel uploaders for bulk importing students, teachers, and historical grades during school onboarding.
- [ ] **Payment Gateway Integration:** Connecting to Stripe/Payfort/Local Banks for automated digital payments, replacing manual receipt entry.
- [ ] **Localization Engine:** Fully manageable dictionary to switch between Arabic/English dynamic terminology (e.g., changing "Class" to "Section" based on school preference).
- [ ] **Custom Report Builder:** Allowing schools to drag-and-drop columns to build their own specific reports without developer intervention.
- [ ] **Subscription Billing:** If sold as SaaS, a module to bill the schools themselves based on active student count.
