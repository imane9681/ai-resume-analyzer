import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { analysis, name } = await request.json();

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis data is required" },
        { status: 400 }
      );
    }

    // Generate unique share ID
    const shareId = randomBytes(8).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Save to shared_analyses table
    const { data, error } = await supabaseAdmin
      .from("shared_analyses")
      .insert({
        share_id: shareId,
        analysis_data: analysis,
        resume_name: name,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Share error:", error);
      return NextResponse.json(
        { error: "Failed to create share link" },
        { status: 500 }
      );
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareUrl: shareUrl,
      shareId: shareId,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}