// The /admin page reaches the API through Caddy's password-protected /admin-api proxy,
// which swaps in the service-role key. Public callers only ever have the anon key.
export const isAdmin = (req: Request) =>
  req.headers.get("Authorization") === `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;
