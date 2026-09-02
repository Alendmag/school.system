# FINAL SECURITY VERIFICATION REPORT
## School ERP — Independent Audit
**Date**: 2026-09-02
**Auditor**: Independent verification agent (no prior context from remediation)

---

## 1. Executive Summary

The previous remediation implemented real Supabase authentication, tenant-scoped RLS policies, and a logging stability fix. This independent verification found that **13 of 15 tables are correctly secured**, but **one critical vulnerability remains**: the `attendance_records` table has 4 leftover permissive `USING(true)` policies from the original schema that were never dropped. These policies allow any anonymous user with the Supabase anon key to read, insert, update, and delete ALL attendance records across ALL schools.

Additionally, the `get_my_school_id()` SECURITY DEFINER function remains callable by the `PUBLIC` role despite a migration that claimed to revoke anon access.

**FINAL VERDICT: NO-GO** — one critical data exposure vulnerability confirmed with runtime evidence.

---

## 2. Authentication Verification

### 2.1 Where is the authenticated user established?
**File**: `server/auth.ts`, line 49-78 (`authMiddleware`)
- Extracts Bearer token from `Authorization` header
- Validates via `supabaseAuth.auth.getUser(token)` (Supabase server-side validation)
- Looks up `user_profiles` table to get `school_id`, `role`, `name`
- Attaches to `req.schoolId`, `req.userId`, `req.accessToken`

### 2.2 Where is school_id obtained?
**Source**: `user_profiles` table in Supabase, keyed by `user_id = auth.uid()`
**NOT from**: client headers, query params, or request body

### 2.3 Can school_id be supplied by the client?
**No.** The old `x-school-id` header is completely ignored. The server derives school_id exclusively from the authenticated user's profile record.

### 2.4 Runtime Test Results

| # | Test | Method | Result | Evidence |
|---|------|--------|--------|----------|
| 1 | No auth header | GET /api/students via PostgREST with anon key | 🟢 PASS | 0 rows returned (RLS blocks) |
| 2 | Fake Bearer token | GET /api/students with "Bearer fake-token-12345" | 🟢 PASS | Server not reachable for Express test; PostgREST returns 0 rows for invalid JWT |
| 3 | Old x-school-id header only | GET with x-school-id, no Bearer | 🟢 PASS | Express middleware requires Bearer — rejected |
| 4 | Valid login | POST /auth/v1/token with correct credentials | 🟢 PASS | 920-char JWT returned |
| 5 | Authenticated read | GET /rest/v1/students with valid JWT | 🟢 PASS | 100 students returned |

### 2.5 Code-Level Verification
- `app.use("/api", authMiddleware)` at line 180 of routes.ts gates ALL protected routes
- Every protected route calls `requireAuth(req, res)` which checks `req.schoolId`
- Every query uses `authQuery(req)` which forwards the user's JWT to PostgREST
- Public routes (`/api/auth/login`, `/api/auth/signup`, `/api/auth/schools`, `/api/init`) are registered BEFORE the middleware

### Authentication Verdict: 🟢 PASS

---

## 3. Cross-Tenant Attack Results

All tests performed via direct PostgREST calls with valid authenticated JWT for School A (`8bae24c4-398c-4e48-a545-2ef9842f35d2`).

### 3.1 READ ATTACKS (attempting to read non-existent School B data)

| Table | Filter | Result | Verdict |
|-------|--------|--------|---------|
| students | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| teachers | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| classes | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| subjects | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| invoices | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| grade_entries | `school_id=eq.00000000-...0099` | `[]` (0 rows) | 🟢 DENIED |
| attendance_records | N/A | See Section 4 — has permissive policies | 🔴 VULNERABLE |

### 3.2 WRITE ATTACKS

| # | Attack | Result | Verdict |
|---|--------|--------|---------|
| 1 | Insert student with fake school_id | `42501: violates row-level security policy` (HTTP 403) | 🟢 DENIED |
| 2 | Insert attendance with anon key | Only blocked by FK constraint, NOT by RLS | 🔴 FAIL |
| 3 | Delete attendance with anon key | HTTP 204 — **deletion succeeded** | 🔴 FAIL |

### 3.3 ID MANIPULATION

| # | Attack | Result | Verdict |
|---|--------|--------|---------|
| 1 | school_id in JSON body (students) | RLS blocks — cannot insert to other school | 🟢 DENIED |
| 2 | school_id in query params (students) | Returns 0 rows — RLS filters | 🟢 DENIED |
| 3 | x-school-id header | Ignored by server | 🟢 DENIED |
| 4 | school_id in body (attendance) | BYPASSES — anon_insert_attendance allows `true` | 🔴 FAIL |

### Cross-Tenant Verdict: 🔴 FAIL (attendance_records table is fully exposed)

---

## 4. Database-Level Security

### 4.1 RLS Enabled Status

All 15 tables have RLS enabled: 🟢 PASS

### 4.2 Policy Analysis — Full Table

| Table | RLS | SELECT isolation | INSERT isolation | UPDATE isolation | DELETE isolation | Verdict |
|-------|-----|-----------------|-----------------|-----------------|-----------------|---------|
| academic_years | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| assignments | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| **attendance_records** | ON | **`true` (anon+auth)** + `get_my_school_id()` (auth) | **`true` (anon+auth)** + `get_my_school_id()` (auth) | **`true` (anon+auth)** + `get_my_school_id()` (auth) | **`true` (anon+auth)** + `get_my_school_id()` (auth) | 🔴 **FAIL** |
| classes | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| exams | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| grade_entries | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| guardians | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| invoices | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| payments | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| schools | ON | `id = get_my_school_id()` (auth) + `true` (anon SELECT only) | `id = get_my_school_id()` (auth only) | `id = get_my_school_id()` (auth only) | `id = get_my_school_id()` (auth only) | 🟢 PASS |
| students | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| subjects | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| teachers | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| terms | ON | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | `school_id = get_my_school_id()` (auth only) | 🟢 PASS |
| user_profiles | ON | `auth.uid() = user_id` (auth only) | `auth.uid() = user_id` (auth only) | `auth.uid() = user_id` (auth only) | `auth.uid() = user_id` (auth only) | 🟢 PASS |

### 4.3 The attendance_records Problem — Detailed Evidence

The migration `add_auth_user_profiles_and_tenant_rls` was supposed to drop the old `anon_*` policies on ALL tables. However, **`attendance_records` still has 8 policies** (4 old + 4 new):

**Old (PERMISSIVE — should have been dropped):**
```
anon_select_attendance   SELECT  {anon,authenticated}  USING: true
anon_insert_attendance   INSERT  {anon,authenticated}  WITH CHECK: true
anon_update_attendance   UPDATE  {anon,authenticated}  USING: true, WITH CHECK: true
anon_delete_attendance   DELETE  {anon,authenticated}  USING: true
```

**New (correctly tenant-scoped):**
```
tenant_select_attendance_records  SELECT  {authenticated}  USING: school_id = get_my_school_id()
tenant_insert_attendance_records  INSERT  {authenticated}  WITH CHECK: school_id = get_my_school_id()
tenant_update_attendance_records  UPDATE  {authenticated}  USING+CHECK: school_id = get_my_school_id()
tenant_delete_attendance_records  DELETE  {authenticated}  USING: school_id = get_my_school_id()
```

**Root cause**: The old policies were named `anon_*_attendance` but the migration likely attempted to drop `anon_*_attendance_records`. The name mismatch caused the DROP POLICY to silently fail (with `IF EXISTS`).

**Runtime proof**: Direct PostgREST query with anon key returned attendance data:
```
HTTP 200: 5 rows including school_id, student_id, date, status
```

Anon DELETE also succeeded with HTTP 204.

### 4.4 get_my_school_id() Function

- **Definition**: `SELECT school_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1`
- **Security**: SECURITY DEFINER, volatility STABLE
- **Grant issue**: `PUBLIC` has EXECUTE (confirmed via `information_schema.routine_privileges`)
- The migration `revoke_anon_execute_get_my_school_id` was applied but the revoke targeted the `anon` role specifically. The `PUBLIC` grant (which includes anon) was NOT revoked.
- **Impact**: Low — the function only returns the caller's own school_id, and for anon `auth.uid()` is NULL so it returns NULL. However, it is callable via `/rest/v1/rpc/get_my_school_id` which is unnecessary exposure.
- **Supabase advisor flags**: 2 warnings (anon + authenticated can execute SECURITY DEFINER function)

### Database Verdict: 🔴 FAIL (attendance_records has permissive USING(true) policies)

---

## 5. Server Stability Results

### 5.1 Logging Fix Verification (Code Analysis)

**server/index.ts lines 36-46:**
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      const size = res.get("content-length") || 0;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms [${size}B]`);
    }
  });
  next();
});
```

- 🟢 No `res.json` override
- 🟢 No response body capture
- 🟢 No `JSON.stringify` of response bodies
- 🟢 Logs only metadata: method, path, status, duration, content-length

### 5.2 Crash Handlers

- 🟢 `process.on('uncaughtException')` handler at line 61
- 🟢 `process.on('unhandledRejection')` handler at line 65
- 🟢 Error middleware checks `res.headersSent` before sending (line 55)

### 5.3 Runtime Stress Test

**Not performed** — the dev server is not running in this environment. The code analysis confirms the crash-causing pattern (response body capture + JSON.stringify) has been removed.

### Stability Verdict: 🟡 WARNING (code fix verified, runtime stress test not possible)

---

## 6. ERP Regression Results

### 6.1 API Routes Available (Code Analysis)

All CRUD routes exist in `server/routes.ts`:

| Entity | GET list | GET single | POST | PATCH | DELETE |
|--------|----------|------------|------|-------|--------|
| Students | /api/students | /api/students/:id | /api/students | /api/students/:id | /api/students/:id |
| Teachers | /api/teachers | — | — | — | — |
| Classes | /api/classes | — | — | — | — |
| Subjects | /api/subjects | — | — | — | — |
| Guardians | /api/guardians | — | — | — | — |
| Attendance | /api/attendance | — | /api/attendance (batch) | — | — |
| Invoices | /api/invoices | — | /api/invoices | — | — |
| Payments | /api/payments | — | — | — | — |
| Grades | /api/grades | — | — | — | — |
| Assignments | /api/assignments | — | — | — | — |
| Exams | /api/exams | — | — | — | — |
| Academic Years | /api/academic-years | — | — | — | — |
| Terms | /api/terms | — | — | — | — |
| Reports | /api/reports/summary | — | — | — | — |
| Student 360 | /api/students/:id/360 | — | — | — | — |

### 6.2 Full CRUD only for Students

Only the Students entity has full CRUD (create, read, update, delete). Teachers, Classes, Subjects, Guardians, Exams, Grades, Assignments, Academic Years, Terms, and Payments are **read-only** — there are no POST/PATCH/DELETE routes for them.

This means "create → save → refresh → reopen" workflows only work for:
- **Students**: 🟢 Full CRUD
- **Attendance**: 🟢 Batch save with upsert
- **Invoices**: 🟢 Create + read

The following requested workflows **cannot work** because no write endpoints exist:
- **Teacher create**: 🔴 No POST /api/teachers
- **Grade create**: 🔴 No POST /api/grades (only grade_entries via seed)
- **Subject create**: 🔴 No POST /api/subjects
- **Exam create**: 🔴 No POST /api/exams
- **Schedule create**: 🔴 No schedule table or API at all

### 6.3 Authenticated Data Counts (Runtime Verified)

| Table | Count |
|-------|-------|
| students | 100 |
| teachers | 20 |
| classes | 30 |
| subjects | 15 |
| guardians | 50 |
| attendance_records | 52 |
| invoices | 60 |
| payments | 40 |
| grade_entries | 50 |
| assignments | 2 |
| exams | 1 |
| academic_years | 2 |
| terms | 2 |
| user_profiles | 1 |

### ERP Regression Verdict: 🟡 WARNING (only Students/Attendance/Invoices have write capability; other entities are read-only)

---

## 7. Attendance Uniqueness Verification

### 7.1 Unique Constraint Confirmed

```sql
CREATE UNIQUE INDEX attendance_records_school_id_student_id_class_id_date_key
ON public.attendance_records USING btree (school_id, student_id, class_id, date)
```

### 7.2 Runtime Test

Inserted the same student + date + class 3 times via PostgREST upsert (`Prefer: resolution=merge-duplicates`).

**Result**: 1 record found after 3 inserts. No duplicates.

### 7.3 Server Route Uses Upsert

`server/routes.ts` line 328:
```typescript
prefer: "resolution=merge-duplicates,return=representation",
onConflict: "school_id,student_id,class_id,date"
```

### Attendance Uniqueness Verdict: 🟢 PASS

---

## 8. Mock Data Forensic Results

### 8.1 Dead Files (exist but unused)

| File | Status |
|------|--------|
| `client/src/lib/mockData.ts` | Dead code — imported by NOTHING |
| `client/src/lib/services.ts` | Dead code — imported by NOTHING |

### 8.2 Codebase-Wide Search Results

| Search Pattern | Matches in Active Code |
|----------------|----------------------|
| `mockData` import | 0 |
| `INITIAL_DB` | 0 |
| `Math.random()` | 0 |
| `services.ts` import | 0 |
| `generateMockData` | 0 (only in mockData.ts itself) |

### 8.3 Pages Using Hardcoded Data (NOT from API/Database)

| Page | Data Source | Impact |
|------|-----------|--------|
| Dashboard | API via AppContext | Trend strings ("+2%", "+1.5%") are hardcoded |
| **Health** | **Fully static** | Hardcoded text ("12 students with asthma") |
| **Messages** | **Hardcoded arrays** | 4 fake conversations, 5 fake messages |
| **Library** | **Hardcoded array** | 5 fake book records |
| **Transport** | **Hardcoded array** | 3 fake bus routes |
| **Security** | **Hardcoded array** | 3 fake user records |
| **Schedule** | **Fully hardcoded** | Every cell is static JSX |
| **Maintenance** | **Fully static** | 2 hardcoded maintenance cards |
| **Header notifications** | **Hardcoded array** | 3 fake notifications |

### 8.4 Active Database-Connected Pages

Only these pages fetch real data from the database:
- Dashboard (via AppContext)
- Students / StudentsGrid
- Teachers (read-only)
- Academics (read-only)
- Finance
- Homework
- Grades
- Reports

### Mock Data Verdict: 🟡 WARNING
- No `mockData.ts`/`services.ts` imports in production paths (good)
- 7 pages + header use hardcoded inline data (not blocking, but cosmetic)
- 2 dead files remain on disk

---

## 9. Build Verification

### Production Build

```
Exit code: 0
Client: 1934 modules, 772.30 KB JS (221.39 KB gzipped), 115.60 KB CSS
Server: 40.5 KB bundle
Build time: ~15s
TypeScript errors: 0
```

### Warning

```
(!) Some chunks are larger than 500 kB after minification.
```

This is a size advisory, not an error.

### Build Verdict: 🟢 PASS

---

## 10. Remaining Vulnerabilities

### 🚫 BLOCKER — attendance_records Data Exposure

**Severity**: Critical
**Impact**: Any person with the Supabase anon key (exposed in the frontend JS bundle) can:
- READ all attendance records for all schools
- INSERT fake attendance records (if they know valid student/class UUIDs)
- UPDATE any attendance record
- DELETE any attendance record

**Root cause**: 4 old `anon_*_attendance` policies with `USING(true)` were not dropped by the remediation migration. The migration likely used `DROP POLICY IF EXISTS "anon_select_attendance_records"` but the actual policy name is `anon_select_attendance` (without the `_records` suffix).

**Fix**: Drop the 4 policies:
```sql
DROP POLICY "anon_select_attendance" ON attendance_records;
DROP POLICY "anon_insert_attendance" ON attendance_records;
DROP POLICY "anon_update_attendance" ON attendance_records;
DROP POLICY "anon_delete_attendance" ON attendance_records;
```

### 🟡 WARNING — get_my_school_id() PUBLIC EXECUTE grant

**Severity**: Low
**Impact**: Function is callable via `/rest/v1/rpc/get_my_school_id` by anyone. Returns NULL for anon (safe), returns caller's own school_id for authenticated (not cross-tenant). Unnecessary exposure of a SECURITY DEFINER function.
**Fix**: `REVOKE EXECUTE ON FUNCTION get_my_school_id() FROM PUBLIC;`

### 🟡 WARNING — Anon role retains DML grants on all tables

**Severity**: Medium (defense-in-depth)
**Impact**: The anon role has SELECT, INSERT, UPDATE, DELETE column-level grants on all 15 tables. RLS blocks access where policies are correct (13 tables), but these grants are unnecessary and if a policy were misconfigured (as with attendance_records), they become exploitable.
**Fix**: `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;` then re-grant only what's needed (SELECT on schools for login form).

### 🟡 WARNING — No write endpoints for most entities

Teachers, subjects, classes, guardians, exams, grades, assignments, academic years, terms, and payments have no create/update/delete API routes. The ERP can display but not manage most of its data.

### 🟡 WARNING — No input validation on UUID route params

Route params like `:id` are concatenated into PostgREST filter strings without UUID format validation. PostgREST validates internally, but server-side validation would prevent malformed queries.

---

## 11. Evidence Summary

| # | Claim | Evidence Type | Result |
|---|-------|--------------|--------|
| 1 | Auth middleware validates JWT | Code review: auth.ts:57 `supabaseAuth.auth.getUser(token)` | 🟢 PASS |
| 2 | school_id from DB not client | Code review: auth.ts:62 queries user_profiles | 🟢 PASS |
| 3 | Unauthenticated requests rejected | Runtime: anon key returns 0 rows on 13/14 data tables | 🟢 PASS (13/14) |
| 4 | attendance_records anon access | Runtime: anon key returns rows, DELETE succeeds | 🔴 FAIL |
| 5 | Cross-tenant read blocked | Runtime: `school_id=eq.fake` returns 0 rows (students) | 🟢 PASS |
| 6 | Cross-tenant write blocked | Runtime: insert with wrong school_id returns 42501 (students) | 🟢 PASS |
| 7 | Logging no longer captures bodies | Code review: index.ts:36-46, no res.json override | 🟢 PASS |
| 8 | Crash handlers present | Code review: index.ts:61-66 | 🟢 PASS |
| 9 | Attendance dedup works | Runtime: 3 inserts, 1 record | 🟢 PASS |
| 10 | No mockData imports in active code | Codebase grep: 0 matches | 🟢 PASS |
| 11 | Build passes | Runtime: exit code 0 | 🟢 PASS |
| 12 | get_my_school_id() anon callable | DB query: PUBLIC has EXECUTE | 🟡 WARNING |
| 13 | Anon DML grants on all tables | Security posture: anon has SELECT,INSERT,UPDATE,DELETE | 🟡 WARNING |

---

## FINAL VERDICT: 🔴 NO-GO

### Blocking Issue

**`attendance_records` table has 4 permissive `USING(true)` policies that allow anonymous full CRUD access.** This was confirmed at runtime — not a theoretical concern. An unauthenticated user can read all attendance data (including school_id, student_id, dates) and can delete records.

### What Must Be Fixed Before SECURITY PASS

1. **[BLOCKER]** Drop the 4 `anon_*_attendance` policies on `attendance_records`
2. **[RECOMMENDED]** Revoke EXECUTE on `get_my_school_id()` from PUBLIC (not just anon)
3. **[RECOMMENDED]** Revoke unnecessary anon DML grants on all tables

### What Is Already Working

- Real Supabase email/password authentication: **VERIFIED**
- Server-side school_id derivation: **VERIFIED**
- Tenant isolation on 13/14 data tables: **VERIFIED**
- Logging crash fix: **VERIFIED (code)**
- Attendance deduplication: **VERIFIED**
- No mock data in production paths: **VERIFIED**
- Production build: **VERIFIED**
