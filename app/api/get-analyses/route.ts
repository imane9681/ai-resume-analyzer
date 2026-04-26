import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .select("user_id")
      .eq("token", token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Get user's saved analyses
    const { data: analyses, error } = await supabaseAdmin
      .from("saved_analyses")
      .select("*")
      .eq("user_id", session.user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get analyses error:", error);
      return NextResponse.json(
        { error: "Failed to get analyses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses: analyses,
    });
  } catch (error) {
    console.error("Get analyses error:", error);
    return NextResponse.json(
      { error: "Failed to get analyses" },
      { status: 500 }
    );
  }
}