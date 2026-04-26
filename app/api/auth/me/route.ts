import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Get session with user data
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*, users(*)")
      .eq("token", token)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.users.id,
        email: session.users.email,
        name: session.users.name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ user: null });
  }
}