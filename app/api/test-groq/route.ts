import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: "GROQ_API_KEY not found" 
    });
  }

  try {
    const groq = new Groq({ apiKey });
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Hello' in one word" }],
      model: "llama-3.3-70b-versatile",
    });

    return NextResponse.json({ 
      success: true, 
      response: completion.choices[0]?.message?.content 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}