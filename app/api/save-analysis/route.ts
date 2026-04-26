import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    const { analysis, resumeName } = await request.json();

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis data is required" },
        { status: 400 }
      );
    }

    // Save analysis to database
    const { data, error } = await supabaseAdmin
      .from("saved_analyses")
      .insert({
        user_id: session.user_id,
        resume_name: resumeName || analysis.name,
        analysis_data: analysis,
      })
      .select()
      .single();

    if (error) {
      console.error("Save analysis error:", error);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      saved: data,
    });
  } catch (error) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}