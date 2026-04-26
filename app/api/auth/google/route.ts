import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.json({ error: "Failed to initialize Google login" }, { status: 500 });
  }
}