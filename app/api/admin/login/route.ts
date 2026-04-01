import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Signs in via Supabase Auth, then verifies the user has role: admin.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify the user is actually an admin
    if (!isAdminUser(data.user)) {
      // Sign them out — they're not an admin
      await supabase.auth.signOut();
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const isDefault = data.user.user_metadata?.is_default_credentials === true;

    return NextResponse.json({
      message: "Login successful",
      isDefault,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
