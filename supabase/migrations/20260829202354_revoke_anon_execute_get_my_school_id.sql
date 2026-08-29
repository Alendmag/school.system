/*
# Revoke anon EXECUTE on get_my_school_id

The security advisor flagged that anon can call get_my_school_id() via RPC.
While the function only returns the caller's own school (scoped to auth.uid()),
anon should not be able to call it at all since it returns NULL for unauthenticated
users anyway. Revoking EXECUTE from anon eliminates the advisory warning.
*/

REVOKE EXECUTE ON FUNCTION get_my_school_id() FROM anon;
