import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // استخدم الرابط المباشر بدلاً من المتغير
    const redirectUrl = "https://ai-resume-analyzer-lemon-gamma.vercel.app/auth/callback";
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
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