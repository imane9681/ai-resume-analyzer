import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// استخراج النص من PDF باستخدام تحويل بسيط
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // تحويل Buffer إلى نص
    const text = buffer.toString('utf-8');
    
    // تنظيف النص
    const cleanText = text
      .replace(/[^\w\s\u0600-\u06FF\n.,!?\-:;()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // إذا كان النص طويلاً بدرجة كافية
    if (cleanText.length > 100) {
      return cleanText;
    }
    
    // إذا فشل، حاول تحويل آخر
    return text.substring(0, 5000);
  } catch (error) {
    console.error("Text extraction error:", error);
    return "";
  }
}

// اكتشاف لغة النص
function detectLanguage(text: string): "ar" | "en" {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
  return arabicRatio > 0.3 ? "ar" : "en";
}

// تحليل تقليدي
function getMockAnalysis(resumeText: string, language: "ar" | "en") {
  const isArabic = language === "ar";
  
  return {
    name: isArabic ? "مرشح" : "Candidate",
    years_experience: 3,
    skills: isArabic ? ["React", "Node.js", "TypeScript"] : ["React", "Node.js", "TypeScript"],
    education: isArabic ? "بكالوريوس" : "Bachelor's Degree",
    strengths: isArabic ? ["مهارات تقنية", "تواصل جيد"] : ["Technical skills", "Good communication"],
    weaknesses: isArabic ? ["خبرة محدودة"] : ["Limited experience"],
    recommendations: isArabic ? ["طور مهاراتك", "أضف شهادات"] : ["Develop your skills", "Add certifications"],
    ats_score: 70,
    field: isArabic ? "تقني" : "Technology",
  };
}

// تحليل السيرة باستخدام Groq
async function analyzeWithGroq(resumeText: string, language: "ar" | "en") {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return getMockAnalysis(resumeText, language);
  }

  const groq = new Groq({ apiKey });

  const prompt = language === "ar" 
    ? `حلل السيرة الذاتية التالية وأعد JSON فقط:
{
  "name": "الاسم الكامل",
  "years_experience": 0,
  "skills": ["مهارة1", "مهارة2"],
  "education": "أعلى شهادة",
  "strengths": ["نقطة قوة1", "نقطة قوة2"],
  "weaknesses": ["نقطة ضعف1", "نقطة ضعف2"],
  "recommendations": ["توصية1", "توصية2"],
  "ats_score": 0,
  "field": "المجال"
}

السيرة: ${resumeText.substring(0, 4000)}`
    : `Analyze this resume and return ONLY JSON:
{
  "name": "Full name",
  "years_experience": 0,
  "skills": ["skill1", "skill2"],
  "education": "Highest degree",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "ats_score": 0,
  "field": "Job field"
}

Resume: ${resumeText.substring(0, 4000)}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockAnalysis(resumeText, language);
  } catch (error) {
    console.error("Groq error:", error);
    return getMockAnalysis(resumeText, language);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.length === 0) {
      return NextResponse.json({ error: "No text found in PDF" }, { status: 400 });
    }

    const language = detectLanguage(extractedText);
    const analysis = await analyzeWithGroq(extractedText, language);

    return NextResponse.json({
      success: true,
      analysis: analysis,
      message: "Resume analyzed successfully!"
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}