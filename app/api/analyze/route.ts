import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// استيراد pdf-parse بشكل ديناميكي لتجنب مشاكل Edge Runtime
// استخراج النص من PDF - طريقة مضمونة للعمل
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // استخدام require مباشرة مع المسار الكامل
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    
    const options = {
      pagerender: undefined,
      max: 0,
      version: 'v1.10.100'
    };
    
    const data = await pdfParse(buffer, options);
    
    if (!data || !data.text) {
      throw new Error('No text extracted from PDF');
    }
    
    const extractedText = data.text.trim();
    console.log(`PDF extracted successfully: ${extractedText.length} characters`);
    
    if (extractedText.length === 0) {
      throw new Error('Extracted text is empty');
    }
    
    return extractedText;
  } catch (error) {
    console.error("PDF parsing error details:", error);
    throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
  }
}
// اكتشاف لغة النص
function detectLanguage(text: string): "ar" | "en" {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
  return arabicRatio > 0.3 ? "ar" : "en";
}

// ترجمة التوصيات من الإنجليزية إلى العربية
function translateRecommendationsToArabic(recommendations: string[]): string[] {
  const translations: { [key: string]: string } = {
    "Add quantifiable achievements with numbers": "أضف إنجازات قابلة للقياس بأرقام محددة",
    "Get relevant certifications": "احصل على شهادات مهنية ذات صلة",
    "Tailor your resume for each job application": "خصص سيرتك الذاتية لكل وظيفة تتقدم لها",
    "Add links to your GitHub or LinkedIn": "أضف روابط لمشاريعك على GitHub أو LinkedIn",
    "Improve ATS compatibility with better formatting": "حسن توافق السيرة مع أنظمة ATS باستخدام تنسيق أفضل",
    "Add more keywords from job descriptions": "أضف المزيد من الكلمات المفتاحية من أوصاف الوظائف",
    "Highlight your leadership experience": "أبرز خبراتك القيادية",
    "Showcase your achievements with metrics": "اعرض إنجازاتك بمقاييس رقمية",
    "Expand your technical skills section": "وسع قسم المهارات التقنية",
    "Add a professional summary at the top": "أضف ملخصاً مهنياً في الأعلى",
    "Use action verbs to start bullet points": "استخدم أفعال عمل لبدء النقاط",
    "Keep your resume to 1-2 pages": "احتفظ بسيرتك الذاتية في 1-2 صفحات",
    "Add more technical skills": "أضف المزيد من المهارات التقنية",
    "List both technical and soft skills": "أدرج المهارات التقنية والشخصية معاً",
    "Include frameworks and libraries": "ضمن الأطر والمكتبات التي تستخدمها",
    "Add development tools (Git, Docker, etc.)": "أضف أدوات التطوير (Git, Docker، إلخ)",
    "Use numbers and percentages": "استخدم الأرقام والنسب المئوية",
    "Show impact of your work": "أظهر تأثير عملك",
    "Mention awards or recognition": "اذكر الجوائز أو التكريمات",
    "Consider adding more details": "فكر في إضافة المزيد من التفاصيل",
  };
  
  return recommendations.map(rec => {
    if (translations[rec]) return translations[rec];
    let translated = rec;
    for (const [en, ar] of Object.entries(translations)) {
      if (translated.includes(en)) {
        translated = translated.replace(en, ar);
      }
    }
    return translated;
  });
}

// تحليل تقليدي (في حالة فشل API)
function getMockAnalysis(resumeText: string, language: "ar" | "en") {
  const isArabic = language === "ar";
  const text = resumeText.toLowerCase();
  
  let name = isArabic ? "مرشح" : "Candidate";
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
  if (nameMatch) name = nameMatch[1];
  
  let years = 0;
  const yearPatterns = isArabic 
    ? [/(\d+)\s*(?:سنوات|سنين)/i, /خبرة\s*(\d+)/i]
    : [/(\d+)\s*(?:years|year|yrs|yr)/i];
    
  for (const pattern of yearPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      years = parseInt(match[1]);
      if (years < 30) break;
    }
  }
  if (years === 0) years = 4;
  
  let field = isArabic ? "تقني" : "Technology";
  if (text.match(/react|node|python|javascript|html|css|software|developer|web|frontend|backend/i)) field = isArabic ? "تطوير ويب" : "Web Development";
  else if (text.match(/طبيب|دكتور|تمريض|طبي|medical|doctor|nurse/i)) field = isArabic ? "طبي" : "Medical";
  else if (text.match(/مهندس|بناء|ميكانيكا|كهرباء|engineering|civil|mechanical|electrical/i)) field = isArabic ? "هندسي" : "Engineering";
  else if (text.match(/تسويق|مبيعات|marketing|sales|digital|social media/i)) field = isArabic ? "تسويق ومبيعات" : "Marketing & Sales";
  else if (text.match(/محامي|قانون|legal|lawyer|law/i)) field = isArabic ? "قانوني" : "Legal";
  else if (text.match(/محاسب|accounting|finance|audit|tax/i)) field = isArabic ? "محاسبة ومالية" : "Accounting & Finance";
  else if (text.match(/معلم|تدريس|education|teacher|professor/i)) field = isArabic ? "تعليمي" : "Education";
  
  const allSkills: string[] = [];
  const skillKeywords = [
    "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express",
    "Django", "Flask", "Java", "Spring", "C#", ".NET", "PHP", "Laravel",
    "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub Actions",
    "TailwindCSS", "Bootstrap", "SASS", "HTML", "CSS", "Redux", "Zustand",
    "GraphQL", "REST API", "Jest", "Cypress", "Figma", "Adobe XD"
  ];
  
  for (const skill of skillKeywords) {
    if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
      allSkills.push(skill);
    }
  }
  
  const skills = allSkills.length > 0 ? allSkills.slice(0, 12) : ["React", "Node.js", "TypeScript"];
  
  let education = isArabic ? "بكالوريوس" : "Bachelor's Degree";
  if (resumeText.match(/master|ms|mba/i)) education = isArabic ? "ماجستير" : "Master's Degree";
  else if (resumeText.match(/phd|doctorate/i)) education = isArabic ? "دكتوراه" : "PhD";
  else if (resumeText.match(/associate/i)) education = isArabic ? "دبلوم" : "Associate Degree";
  
  const hasLeadership = resumeText.match(/lead|mentor|manage|senior|leadership|team lead/i);
  const hasAchievements = resumeText.match(/achievement|award|recognition|winner|first place|top performer/i);
  const hasQuantifiable = resumeText.match(/\d+%|\d+\s*(?:users|customers|projects|reduction|increase)/i);
  
  const strengths = [];
  if (skills.length >= 6) strengths.push(isArabic ? "مجموعة واسعة من المهارات التقنية" : "Wide range of technical skills");
  if (hasLeadership) strengths.push(isArabic ? "خبرة في القيادة والإدارة" : "Leadership and management experience");
  if (hasAchievements) strengths.push(isArabic ? "إنجازات موثقة" : "Documented achievements");
  if (hasQuantifiable) strengths.push(isArabic ? "نتائج قابلة للقياس" : "Quantifiable results");
  if (skills.includes("React") || skills.includes("Node.js")) strengths.push(isArabic ? "خبرة في التقنيات الحديثة" : "Experience with modern technologies");
  
  if (strengths.length === 0) {
    strengths.push(isArabic ? "مهارات تقنية جيدة" : "Good technical skills");
    strengths.push(isArabic ? "خبرة عملية" : "Practical experience");
  }
  
  const weaknesses = [];
  if (!hasQuantifiable) weaknesses.push(isArabic ? "يحتاج إلى إضافة إنجازات قابلة للقياس بأرقام" : "Need to add quantifiable achievements with numbers");
  if (skills.length < 5) weaknesses.push(isArabic ? "مجال المهارات يحتاج إلى توسيع" : "Skills area needs expansion");
  if (!hasLeadership && years < 5) weaknesses.push(isArabic ? "فرص لتطوير المهارات القيادية" : "Opportunities to develop leadership skills");
  
  if (weaknesses.length === 0) {
    weaknesses.push(isArabic ? "توثيق أفضل للإنجازات" : "Better documentation of achievements");
  }
  
  const recommendations = isArabic ? [
    "أضف أرقاماً محددة لتحسين الأداء (مثل: 'حسّنت الأداء بنسبة 30%')",
    "أضف شهادات مهنية ذات صلة بمجالك",
    "خصص السيرة الذاتية لكل وظيفة تتقدم لها",
    "أضف روابط لمشاريعك على GitHub أو LinkedIn",
  ] : [
    "Add specific performance improvement numbers (e.g., 'Improved performance by 30%')",
    "Add relevant professional certifications",
    "Tailor your resume for each job application",
    "Add links to your projects on GitHub or LinkedIn",
  ];
  
  const ats_score = Math.min(95, Math.max(45, 60 + Math.floor(skills.length * 2) + (hasQuantifiable ? 10 : 0) + (hasLeadership ? 8 : 0)));
  
  return {
    name,
    years_experience: years,
    skills,
    education,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    recommendations: recommendations.slice(0, 5),
    ats_score,
    field,
  };
}

// تحليل السيرة باستخدام Groq
async function analyzeWithGroq(resumeText: string, language: "ar" | "en") {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY not found");
    return getMockAnalysis(resumeText, language);
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = language === "ar" 
    ? `أنت خبير موارد بشرية محترف. قم بتحليل السيرة الذاتية التالية بدقة وإرجاع JSON فقط. لا تكتب أي شيء خارج JSON. استخدم التنسيق التالي بالضبط:
{
  "name": "الاسم الكامل",
  "years_experience": "عدد سنوات الخبرة (رقم فقط)",
  "skills": ["مهارة1", "مهارة2", "مهارة3", "مهارة4", "مهارة5"],
  "education": "أعلى شهادة",
  "strengths": ["نقطة قوة1", "نقطة قوة2", "نقطة قوة3", "نقطة قوة4"],
  "weaknesses": ["نقطة ضعف1", "نقطة ضعف2", "نقطة ضعف3"],
  "recommendations": ["توصية1", "توصية2", "توصية3", "توصية4"],
  "ats_score": "رقم من 0 إلى 100",
  "field": "المجال الوظيفي (مثل: تقني، طبي، هندسي، تسويق، مبيعات، قانوني، محاسبة، تعليمي)"
}`
    : `You are a professional HR expert. Analyze the following resume carefully and return ONLY valid JSON. Do not write anything outside the JSON. Use this exact format:
{
  "name": "Full name",
  "years_experience": "number of years (number only)",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "education": "Highest degree",
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4"],
  "ats_score": "number from 0 to 100",
  "field": "Job field (e.g., Technology, Medical, Engineering, Marketing, Sales, Legal, Accounting, Education)"
}`;

  const userPrompt = `${systemPrompt}\n\nالسيرة الذاتية / Resume:\n${resumeText.substring(0, 7000)}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: userPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "";
    console.log("Groq response received, length:", content.length);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        let recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
        if (language === "ar" && recommendations.length > 0) {
          const hasEnglish = recommendations.some((rec: string) => !/[\u0600-\u06FF]/.test(rec));
          if (hasEnglish) {
            recommendations = translateRecommendationsToArabic(recommendations);
          }
        }
        
        return {
          name: parsed.name || (language === "ar" ? "مرشح" : "Candidate"),
          years_experience: typeof parsed.years_experience === 'number' ? parsed.years_experience : (parseInt(parsed.years_experience) || 3),
          skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 15) : ["React", "Node.js", "TypeScript"],
          education: parsed.education || (language === "ar" ? "بكالوريوس" : "Bachelor's Degree"),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : (language === "ar" ? ["تواصل جيد", "عمل جماعي"] : ["Good communication", "Team player"]),
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 4) : (language === "ar" ? ["يحتاج إلى إضافة إنجازات"] : ["Need to add more achievements"]),
          recommendations: recommendations.length > 0 ? recommendations.slice(0, 6) : (language === "ar" ? 
            ["أضف إنجازات قابلة للقياس بأرقام", "احصل على شهادات مهنية", "خصص السيرة لكل وظيفة", "أضف روابط GitHub أو LinkedIn"] :
            ["Add quantifiable achievements with numbers", "Get relevant certifications", "Tailor your resume for each job application", "Add links to your GitHub or LinkedIn"]),
          ats_score: Math.min(100, Math.max(0, typeof parsed.ats_score === 'number' ? parsed.ats_score : (parseInt(parsed.ats_score) || 70))),
          field: parsed.field || (language === "ar" ? "تقني" : "Technology"),
        };
      } catch (e) {
        console.error("JSON parse error:", e);
        return getMockAnalysis(resumeText, language);
      }
    }
    
    console.error("No JSON found in response");
    return getMockAnalysis(resumeText, language);
  } catch (error) {
    console.error("Groq API error:", error);
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

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ error: "Could not extract text from PDF. Please ensure the PDF contains selectable text." }, { status: 400 });
    }

    const language = detectLanguage(extractedText);
    console.log(`Detected language: ${language === "ar" ? "Arabic" : "English"}`);
    console.log(`Extracted text length: ${extractedText.length} characters`);

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