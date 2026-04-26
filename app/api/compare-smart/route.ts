import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  try {
    const { resumes } = await request.json();

    if (!resumes || resumes.length < 2) {
      return NextResponse.json(
        { error: "At least 2 resumes are required for comparison" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not found" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // اكتشاف اللغة من أسماء المرشحين
    const hasArabic = resumes.some((r: any) => 
      /[\u0600-\u06FF]/.test(r.name)
    );
    const language = hasArabic ? "ar" : "en";

    const resumesText = resumes.map((resume: any, index: number) => {
      if (language === "ar") {
        return `
المرشح ${index + 1}: ${resume.name}
- الخبرة: ${resume.years_experience} سنوات
- درجة ATS: ${resume.ats_score}%
- المهارات: ${resume.skills.join(", ")}
- نقاط القوة: ${resume.strengths.join(", ")}
- نقاط الضعف: ${resume.weaknesses.join(", ")}
- المجال: ${resume.field}
`;
      } else {
        return `
Candidate ${index + 1}: ${resume.name}
- Experience: ${resume.years_experience} years
- ATS Score: ${resume.ats_score}%
- Skills: ${resume.skills.join(", ")}
- Strengths: ${resume.strengths.join(", ")}
- Weaknesses: ${resume.weaknesses.join(", ")}
- Field: ${resume.field}
`;
      }
    }).join("\n");

    const prompt = language === "ar" 
      ? `أنت خبير موارد بشرية متخصص في تحليل ومقارنة السير الذاتية.

قم بتحليل ومقارنة السير الذاتية التالية:

${resumesText}

أعد تحليلاً شاملاً بالمقارنة بينهم في JSON فقط، باستخدام هذا التنسيق:

{
  "summary": "ملخص عام للمقارنة بين جميع المرشحين",
  "best_candidate": {
    "name": "اسم أفضل مرشح",
    "reason": "سبب اختياره"
  },
  "comparison_table": [
    {
      "criterion": "الخبرة",
      "winner": "اسم المرشح الأفضل في هذا المعيار",
      "analysis": "تحليل مقارن مختصر"
    },
    {
      "criterion": "المهارات التقنية",
      "winner": "اسم المرشح الأفضل",
      "analysis": "تحليل مقارن"
    },
    {
      "criterion": "القيادة والإدارة",
      "winner": "اسم المرشح الأفضل",
      "analysis": "تحليل مقارن"
    },
    {
      "criterion": "الإنجازات",
      "winner": "اسم المرشح الأفضل",
      "analysis": "تحليل مقارن"
    },
    {
      "criterion": "جاهزية للوظيفة",
      "winner": "اسم المرشح الأفضل",
      "analysis": "تحليل مقارن"
    }
  ],
  "recommendations": [
    "توصية عامة لجميع المرشحين",
    "توصية محددة للمرشح الأقل خبرة"
  ],
  "verdict": "الحكم النهائي: من هو الأفضل ولماذا؟"
}`
      : `You are an expert HR professional specializing in resume analysis and comparison.

Analyze and compare the following resumes:

${resumesText}

Return a comprehensive comparison analysis in JSON format:

{
  "summary": "Overall summary comparing all candidates",
  "best_candidate": {
    "name": "Name of the best candidate",
    "reason": "Reason for selection"
  },
  "comparison_table": [
    {
      "criterion": "Experience",
      "winner": "Best candidate name for this criterion",
      "analysis": "Brief comparative analysis"
    },
    {
      "criterion": "Technical Skills",
      "winner": "Best candidate name",
      "analysis": "Comparative analysis"
    },
    {
      "criterion": "Leadership & Management",
      "winner": "Best candidate name",
      "analysis": "Comparative analysis"
    },
    {
      "criterion": "Achievements",
      "winner": "Best candidate name",
      "analysis": "Comparative analysis"
    },
    {
      "criterion": "Job Readiness",
      "winner": "Best candidate name",
      "analysis": "Comparative analysis"
    }
  ],
  "recommendations": [
    "General recommendation for all candidates",
    "Specific recommendation for less experienced candidate"
  ],
  "verdict": "Final verdict: Who is the best and why?"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, analysis });
    }

    return NextResponse.json({ 
      success: false, 
      error: "Failed to parse analysis" 
    }, { status: 500 });

  } catch (error) {
    console.error("Smart comparison error:", error);
    return NextResponse.json(
      { error: "Failed to generate smart comparison" },
      { status: 500 }
    );
  }
}