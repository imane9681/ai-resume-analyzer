import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { randomBytes } from "crypto";

// نحتاج لـ Supabase Admin لكتابة البيانات
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, name, supabase_id } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists in your database
    let { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      // Create new user if doesn't exist
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          email: email,
          password_hash: "google_oauth",
          name: name || email.split("@")[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      user = newUser;
    }

    // Create session token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save session
    await supabaseAdmin.from("sessions").insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt.toISOString(),
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.json(
      { error: "Failed to process Google login" },
      { status: 500 }
    );
  }
}