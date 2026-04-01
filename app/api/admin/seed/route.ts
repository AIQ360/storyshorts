import { NextResponse } from "next/server";
import {
  getAdminSupabase,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/seed
 * Checks whether an admin user already exists.
 */
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data: users, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json(
        { message: "Failed to check users" },
        { status: 500 },
      );
    }

    const exists = users.users.some((u) => u.user_metadata?.role === "admin");

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/seed
 * Creates the default admin user if no admin exists yet.
 * Safe to call multiple times — idempotent.
 */
export async function POST() {
  try {
    const supabase = getAdminSupabase();

    // Check if any admin user already exists
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      console.error("Admin seed - list users error:", listError);
      return NextResponse.json(
        { message: "Failed to check existing users" },
        { status: 500 },
      );
    }

    const existingAdmin = users.users.find(
      (u) => u.user_metadata?.role === "admin",
    );

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin already exists",
        exists: true,
      });
    }

    // Create default admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: "Admin",
        is_default_credentials: true,
      },
    });

    if (error) {
      console.error("Admin seed - create error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Default admin created",
      exists: false,
      userId: data.user.id,
    });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
