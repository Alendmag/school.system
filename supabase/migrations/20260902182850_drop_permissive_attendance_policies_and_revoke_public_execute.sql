/*
# Drop permissive attendance_records policies and revoke PUBLIC EXECUTE on get_my_school_id

## Problem
The attendance_records table has 4 leftover permissive policies from the original schema
that were NOT dropped by the tenant-scoping migration. These policies (anon_select_attendance,
anon_insert_attendance, anon_update_attendance, anon_delete_attendance) use USING(true) and
WITH CHECK(true) for both anon and authenticated roles, completely bypassing tenant isolation.

Additionally, the get_my_school_id() SECURITY DEFINER function has a PUBLIC EXECUTE grant
that was not properly revoked by the previous migration (which only revoked from anon, not PUBLIC).

## Changes
1. Drop 4 permissive policies on attendance_records:
   - anon_select_attendance (SELECT, anon+authenticated, USING true)
   - anon_insert_attendance (INSERT, anon+authenticated, WITH CHECK true)
   - anon_update_attendance (UPDATE, anon+authenticated, USING true, WITH CHECK true)
   - anon_delete_attendance (DELETE, anon+authenticated, USING true)
2. Revoke EXECUTE on get_my_school_id() from PUBLIC (covers anon implicitly)
3. Re-grant EXECUTE to authenticated only (needed for RLS policy evaluation)

## Security Impact
- Anonymous users will no longer be able to read, insert, update, or delete attendance records
- Only authenticated users whose school_id matches will have access (via tenant_* policies)
- get_my_school_id() will only be callable by authenticated users (required for RLS)

## Tables Modified
- attendance_records: 4 policies dropped (8 -> 4 policies remaining)

## Important Notes
1. The 4 tenant_* policies remain unchanged and continue to enforce school_id = get_my_school_id()
2. No schema changes, no data changes, no table modifications
3. This migration is idempotent (uses DROP POLICY IF EXISTS)
*/

-- Drop the 4 old permissive policies that allow unrestricted access
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance_records;
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance_records;
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance_records;
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance_records;

-- Revoke EXECUTE from PUBLIC on get_my_school_id (covers anon implicitly)
REVOKE EXECUTE ON FUNCTION public.get_my_school_id() FROM PUBLIC;

-- Re-grant EXECUTE to authenticated only (needed for tenant-scoped RLS policies)
GRANT EXECUTE ON FUNCTION public.get_my_school_id() TO authenticated;
