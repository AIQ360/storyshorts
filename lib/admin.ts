import { createClient } from "@supabase/supabase-js";

// Default admin credentials — used for seeding and detecting if admin should change them
export const DEFAULT_ADMIN_EMAIL = "admin@framecast.local";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

// Test admin credentials — used for demo/showcase mode
export const TEST_ADMIN_EMAIL = "demo@framecast.local";
export const TEST_ADMIN_PASSWORD = "demo123";

/**
 * Get a Supabase admin client (service role).
 * Only use on the server side.
 */
export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}

/**
 * Check if a Supabase auth user has any admin role (real or test) in their metadata.
 * Use this for access control to the admin dashboard.
 */
export function isAdminUser(user: { user_metadata?: Record<string, unknown> }) {
  const role = user?.user_metadata?.role;
  return role === "admin" || role === "test_admin";
}

/**
 * Check if a Supabase auth user is the test/demo admin.
 */
export function isTestAdminUser(user: {
  user_metadata?: Record<string, unknown>;
}) {
  return user?.user_metadata?.role === "test_admin";
}
