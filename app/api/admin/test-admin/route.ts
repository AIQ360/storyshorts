import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminSupabase,
  isAdminUser,
  isTestAdminUser,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/test-admin
 * Check if the test admin account exists.
 * Only accessible to real admins (not the test admin itself).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user) || isTestAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = getAdminSupabase();
  const { data: users, error } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to check users" },
      { status: 500 },
    );
  }

  const testAdmin = users.users.find(
    (u) => u.user_metadata?.role === "test_admin",
  );

  return NextResponse.json({
    exists: !!testAdmin,
    email: testAdmin?.email || null,
    createdAt: testAdmin?.created_at || null,
  });
}

/**
 * POST /api/admin/test-admin
 * Create the test admin account.
 * Only accessible to real admins.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user) || isTestAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = getAdminSupabase();

  // Check if test admin already exists
  const { data: users } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000,
  });

  const existingTestAdmin = users?.users.find(
    (u) => u.user_metadata?.role === "test_admin",
  );

  if (existingTestAdmin) {
    return NextResponse.json(
      { error: "Test admin already exists" },
      { status: 409 },
    );
  }

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: "test_admin",
      full_name: "Demo Admin",
    },
  });

  if (error) {
    console.error("Create test admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Test admin created",
    userId: data.user.id,
    email: TEST_ADMIN_EMAIL,
  });
}

/**
 * DELETE /api/admin/test-admin
 * Delete the test admin account.
 * Only accessible to real admins.
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user) || isTestAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = getAdminSupabase();

  const { data: users } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000,
  });

  const testAdmin = users?.users.find(
    (u) => u.user_metadata?.role === "test_admin",
  );

  if (!testAdmin) {
    return NextResponse.json(
      { error: "Test admin not found" },
      { status: 404 },
    );
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(testAdmin.id);

  if (error) {
    console.error("Delete test admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Test admin deleted" });
}
