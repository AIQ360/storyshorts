import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminSupabase,
  isAdminUser,
  isTestAdminUser,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "@/lib/admin";
import { validatePasswordServer } from "@/lib/password";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/settings
 * Updates admin email and/or password via Supabase Auth.
 * Clears the is_default_credentials flag on success.
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        { message: "Not authenticated as admin" },
        { status: 401 },
      );
    }

    if (isTestAdminUser(user)) {
      return NextResponse.json(
        { message: "Demo mode — changes are disabled" },
        { status: 403 },
      );
    }

    const { newEmail, newPassword, currentPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json(
        { message: "Current password is required" },
        { status: 400 },
      );
    }

    if (!newEmail && !newPassword) {
      return NextResponse.json(
        { message: "Provide a new email or password" },
        { status: 400 },
      );
    }

    // Verify current password by attempting sign-in
    const adminSupabase = getAdminSupabase();
    const { error: verifyError } = await adminSupabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      user_metadata: {
        ...user.user_metadata,
        is_default_credentials: false,
      },
    };

    if (newEmail) {
      updatePayload.email = newEmail;
    }
    if (newPassword) {
      const passwordError = validatePasswordServer(newPassword);
      if (passwordError) {
        return NextResponse.json({ message: passwordError }, { status: 400 });
      }
      updatePayload.password = newPassword;
    }

    // Use admin API to update the user (bypasses email confirmation requirement)
    const { error: updateError } =
      await adminSupabase.auth.admin.updateUserById(user.id, updatePayload);

    if (updateError) {
      console.error("Admin settings update error:", updateError);
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 },
      );
    }

    // Also update via session client so the JWT cookie gets refreshed with new metadata
    await supabase.auth.updateUser({
      data: { is_default_credentials: false },
    });

    return NextResponse.json({
      message: "Credentials updated successfully",
      emailChanged: !!newEmail,
      passwordChanged: !!newPassword,
    });
  } catch (error) {
    console.error("Admin settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/settings
 * Restores admin credentials to defaults.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        { message: "Not authenticated as admin" },
        { status: 401 },
      );
    }

    if (isTestAdminUser(user)) {
      return NextResponse.json(
        { message: "Demo mode — changes are disabled" },
        { status: 403 },
      );
    }

    const { currentPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json(
        { message: "Current password is required" },
        { status: 400 },
      );
    }

    // Verify current password
    const adminSupabase = getAdminSupabase();
    const { error: verifyError } = await adminSupabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Reset to defaults
    const { error: updateError } =
      await adminSupabase.auth.admin.updateUserById(user.id, {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        user_metadata: {
          ...user.user_metadata,
          is_default_credentials: true,
        },
      });

    if (updateError) {
      console.error("Admin restore defaults error:", updateError);
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Credentials restored to defaults",
    });
  } catch (error) {
    console.error("Admin restore defaults error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
