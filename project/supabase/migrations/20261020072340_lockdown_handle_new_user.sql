/*
# Lock down handle_new_user trigger function

1. Change
   Revoke EXECUTE on public.handle_new_user from anon and authenticated so it cannot be invoked via /rest/v1/rpc. The function is only meant to run as a trigger on auth.users inserts, not via the public API.

2. Security
   Closes the SECURITY DEFINER callable-by-anon/authenticated finding. Trigger execution is unaffected (triggers run with the function's privileges regardless of role EXECUTE grants).
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
