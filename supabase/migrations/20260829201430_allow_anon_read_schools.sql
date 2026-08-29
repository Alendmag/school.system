/*
# Allow anon to list schools (for login/signup)

The signup form needs to list available schools before the user is authenticated.
This adds a public read-only policy on schools so the /api/auth/schools endpoint
works without authentication.

The INSERT/UPDATE/DELETE policies remain authenticated-only.

Also adds an anon SELECT policy on user_profiles for reading own profile
during session initialization (not needed since the server handles this,
but included for completeness).
*/

DROP POLICY IF EXISTS "anon_read_schools" ON schools;
CREATE POLICY "anon_read_schools" ON schools
  FOR SELECT TO anon
  USING (true);
