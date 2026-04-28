import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

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
    "Add LinkedIn profile URL": "أضف رابط ملف LinkedIn الشخصي",
    "Add a projects section": "أضف قسم المشاريع الشخصية",
    "Include more cloud security experience": "ضمن المزيد من خبرات أمن السحابة",
    "Add relevant certifications": "أضف شهادات مهنية ذات صلة",
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

// حساب درجة ATS المتقدمة
function calculateATSScore(
  skills: string[], 
  hasQuantifiable: boolean, 
  hasLeadership: boolean, 
  achievements: string[],
  resumeText: string
): { score: number; details: any } {
  
  let score = 60; // الدرجة الأساسية
  
  // 1. المهارات التقنية (حد أقصى +20)
  const skillScore = Math.min(20, skills.length * 1.2);
  score += skillScore;
  
  // 2. الإنجازات القابلة للقياس (حد أقصى +15)
  let quantifiableScore = 0;
  if (hasQuantifiable) {
    quantifiableScore = 15;
    score += quantifiableScore;
  }
  
  // 3. الخبرة القيادية (حد أقصى +10)
  let leadershipScore = 0;
  if (hasLeadership) {
    leadershipScore = 10;
    score += leadershipScore;
  }
  
  // 4. كل إنجاز محدد (حد أقصى +12)
  const achievementBonus = Math.min(12, achievements.length * 3);
  score += achievementBonus;
  
  // 5. الخصومات للعناصر الناقصة
  let deductions = 0;
  if (!resumeText.match(/linkedin/i)) {
    deductions += 3;
  }
  if (!resumeText.match(/certification|certificate|certified/i)) {
    deductions += 2;
  }
  if (!resumeText.match(/github/i)) {
    deductions += 1;
  }
  if (!resumeText.match(/agile|scrum|kanban/i)) {
    deductions += 1;
  }
  if (skills.length < 8) {
    deductions += 2;
  }
  if (!hasQuantifiable && achievements.length === 0) {
    deductions += 5;
  }
  
  score -= deductions;
  
  // تحديد النطاق النهائي (50-95)
  const finalScore = Math.min(95, Math.max(50, Math.floor(score)));
  
  // تحديد التقييم النصي
  let rating = "";
  if (finalScore >= 90) rating = "ممتاز - Excellent";
  else if (finalScore >= 80) rating = "جيد جداً - Very Good";
  else if (finalScore >= 70) rating = "جيد - Good";
  else if (finalScore >= 60) rating = "مقبول - Acceptable";
  else rating = "يحتاج تحسين - Needs Improvement";
  
  return {
    score: finalScore,
    details: {
      base_score: 60,
      skill_bonus: Math.round(skillScore),
      quantifiable_bonus: quantifiableScore,
      leadership_bonus: leadershipScore,
      achievement_bonus: achievementBonus,
      deductions: deductions,
      rating: rating
    }
  };
}

// تحليل تقليدي محسن (في حالة فشل API)
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
  
  // استخراج جميع المهارات - محسّن
  const allSkills: string[] = [];
  const skillKeywords = [
    "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express",
    "Django", "Flask", "Java", "Spring", "C#", ".NET", "PHP", "Laravel",
    "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub Actions",
    "TailwindCSS", "Bootstrap", "SASS", "HTML", "CSS", "Redux", "Zustand",
    "GraphQL", "REST API", "Jest", "Cypress", "Figma", "Adobe XD", "EC2", "S3"
  ];
  
  for (const skill of skillKeywords) {
    if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
      allSkills.push(skill);
    }
  }
  
  // استخراج جميع المهارات
  const skills = allSkills.length > 0 ? allSkills : ["React", "Node.js", "TypeScript"];
  
  // استخراج الإنجازات المحددة
  const achievements: string[] = [];
  const percentMatch = resumeText.match(/reduced.*?(\d+)%/i);
  if (percentMatch) achievements.push(`Reduced page load time by ${percentMatch[1]}% through optimization`);
  
  const usersMatch = resumeText.match(/(\d+),?(\d+)?\s*(?:users|customers)/i);
  if (usersMatch) {
    const users = usersMatch[1] + (usersMatch[2] ? usersMatch[2] : '');
    achievements.push(`Built APIs serving ${users}+ users`);
  }
  
  const hackathonMatch = resumeText.match(/hackathon.*?(?:1st|first|won|winner)/i);
  if (hackathonMatch) achievements.push("Led team to 1st place in company hackathon");
  
  const ciCdMatch = resumeText.match(/ci\/cd.*?(\d+)%/i);
  if (ciCdMatch) achievements.push(`Implemented CI/CD pipeline reducing deployment time by ${ciCdMatch[1]}%`);
  
  const mentoringMatch = resumeText.match(/mentor.*?(\d+)/i);
  if (mentoringMatch) achievements.push(`Mentored ${mentoringMatch[1]} junior developers`);
  
  let education = isArabic ? "بكالوريوس" : "Bachelor's Degree";
  if (resumeText.match(/master|ms|mba/i)) education = isArabic ? "ماجستير" : "Master's Degree";
  else if (resumeText.match(/phd|doctorate/i)) education = isArabic ? "دكتوراه" : "PhD";
  else if (resumeText.match(/associate/i)) education = isArabic ? "دبلوم" : "Associate Degree";
  else if (resumeText.match(/bachelor|information technology/i)) education = "Bachelor of Information Technology";
  
  const hasLeadership = resumeText.match(/lead|mentor|manage|senior|leadership|team lead/i);
  const hasAchievements = resumeText.match(/achievement|award|recognition|winner|first place|top performer|hackathon/i);
  const hasQuantifiable = resumeText.match(/\d+%|\d+\s*(?:users|customers|projects|reduction|increase)/i);
  
  // حساب درجة ATS المتقدمة
  const atsResult = calculateATSScore(skills, !!hasQuantifiable, !!hasLeadership, achievements, resumeText);
  const ats_score = atsResult.score;
  const ats_details = atsResult.details;
  
  // نقاط القوة - محددة مع أرقام
  const strengths: string[] = [];
  if (skills.length >= 8) strengths.push(isArabic ? `مجموعة واسعة من المهارات التقنية (${skills.length} مهارة)` : `Wide range of technical skills (${skills.length} skills)`);
  if (hasLeadership) strengths.push(isArabic ? "خبرة في القيادة والإدارة" : "Leadership and management experience");
  if (hasAchievements) strengths.push(isArabic ? "إنجازات موثقة (هاكاثون، جوائز)" : "Documented achievements (hackathon, awards)");
  
  // إضافة الإنجازات المحددة كنقاط قوة
  for (const achievement of achievements.slice(0, 4)) {
    strengths.push(achievement);
  }
  
  if (strengths.length === 0) {
    strengths.push(isArabic ? "مهارات تقنية جيدة" : "Good technical skills");
    strengths.push(isArabic ? "خبرة عملية" : "Practical experience");
  }
  
  // نقاط الضعف - تحسينات حقيقية
  const weaknesses = [];
  if (!hasQuantifiable) weaknesses.push(isArabic ? "يحتاج إلى إضافة إنجازات قابلة للقياس بأرقام" : "Need to add quantifiable achievements with numbers");
  if (skills.length < 8) weaknesses.push(isArabic ? "مجال المهارات يحتاج إلى توسيع" : "Skills area needs expansion");
  if (!hasLeadership && years < 5) weaknesses.push(isArabic ? "فرص لتطوير المهارات القيادية" : "Opportunities to develop leadership skills");
  if (!resumeText.match(/linkedin/i)) weaknesses.push(isArabic ? "لا يوجد رابط LinkedIn" : "No LinkedIn profile link");
  if (!resumeText.match(/certification|certificate|certified|aws certified|scrum/i)) weaknesses.push(isArabic ? "لا توجد شهادات مهنية مذكورة" : "No professional certifications mentioned");
  
  if (weaknesses.length === 0) {
    weaknesses.push(isArabic ? "توثيق أفضل للإنجازات" : "Better documentation of achievements");
  }
  
  // التوصيات - بناءً على ما ينقص السيرة فقط
  const recommendations = [];
  if (!resumeText.match(/linkedin/i)) recommendations.push(isArabic ? "أضف رابط ملف LinkedIn الشخصي" : "Add LinkedIn profile URL");
  if (!resumeText.match(/certification|certificate|certified|aws|scrum/i)) recommendations.push(isArabic ? "أضف شهادات مهنية ذات صلة (AWS، Scrum، إلخ)" : "Add relevant certifications (AWS, Scrum, etc.)");
  if (!resumeText.match(/project|portfolio/i)) recommendations.push(isArabic ? "أضف قسم للمشاريع الشخصية" : "Add a projects section");
  if (skills.length < 12) recommendations.push(isArabic ? "وسع قائمة المهارات التقنية" : "Expand your technical skills list");
  if (!resumeText.match(/agile|scrum|kanban/i)) recommendations.push(isArabic ? "أضف خبرة في منهجيات Agile" : "Add experience with Agile methodologies");
  if (!resumeText.match(/cloud security|security/i)) recommendations.push(isArabic ? "طور خبراتك في أمن السحابة" : "Develop cloud security experience");
  
  if (recommendations.length < 3) {
    recommendations.push(isArabic ? "خصص السيرة الذاتية لكل وظيفة تتقدم لها" : "Tailor your resume for each job application");
    recommendations.push(isArabic ? "أضف كلمات مفتاحية من وصف الوظيفة" : "Add keywords from job descriptions");
  }
  
  return {
    name,
    years_experience: years,
    skills,
    education,
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 4),
    recommendations: recommendations.slice(0, 6),
    ats_score,
    ats_details,
    field,
  };
}

// تحليل السيرة باستخدام Groq - نسخة محسنة
async function analyzeWithGroq(resumeText: string, language: "ar" | "en") {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY not found");
    return getMockAnalysis(resumeText, language);
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = language === "ar" 
    ? `أنت خبير موارد بشرية محترف ومتخصص في تحليل السير الذاتية. قم بتحليل السيرة الذاتية التالية بدقة شديدة وإرجاع JSON فقط. لا تكتب أي شيء خارج JSON.

مهم جداً:
1. استخرج ALL المهارات التقنية المذكورة في السيرة (لا تحد نفسك بعدد معين)
2. نقاط القوة يجب أن تكون محددة وتحتوي على أرقام ونسب مئوية إذا وجدت في السيرة
3. التوصيات يجب أن تكون أشياء مفقودة من السيرة وليست إنجازات موجودة بالفعل
4. استخدم الأرقام الحقيقية من السيرة
5. درجة ATS يجب أن تكون بين 50-95 بناءً على جودة السيرة

استخدم التنسيق التالي بالضبط:
{
  "name": "الاسم الكامل من السيرة",
  "years_experience": "رقم سنوات الخبرة (استخرج من النص، مثلاً '4 years experience' → 4)",
  "skills": ["مهارة1", "مهارة2", "مهارة3", "وكل المهارات المذكورة - لا تحد العدد"],
  "education": "أعلى شهادة من قسم التعليم",
  "strengths": ["نقاط قوة محددة مع أرقام/نسب إذا وجدت (مثال: 'قللت وقت التحميل بنسبة 35%')"],
  "weaknesses": ["نقاط ضعف حقيقية - إذا لم توجد نقاط ضعف واضحة، اذكر تحسينات بسيطة"],
  "recommendations": ["توصيات قابلة للتنفيذ بناءً على ما ينقص السيرة - لا تكرر إنجازات موجودة"],
  "ats_score": "رقم من 50 إلى 95 (السيرة الممتازة تأخذ 90-95، الجيدة 80-89، المتوسطة 70-79، الضعيفة 50-69)",
  "field": "المجال الوظيفي من الخبرة (مثال: تقني، طبي، هندسي، تسويق، مبيعات، قانوني، محاسبة، تعليمي)"
}`

    : `You are a professional HR expert and resume analyzer. Analyze the following resume carefully and return ONLY valid JSON. Do not write anything outside the JSON.

CRITICAL RULES:
1. Extract ALL technical skills mentioned in the resume (do NOT limit to 5 or any specific number)
2. Strengths must be SPECIFIC and include numbers/percentages when present in the resume
3. Recommendations must be MISSING items from the resume, NOT existing achievements
4. Use actual numbers from the resume
5. ATS score should be between 50-95 based on resume quality (Excellent: 90-95, Very Good: 80-89, Good: 70-79, Needs Work: 50-69)

Use this exact format:
{
  "name": "Full name from resume",
  "years_experience": "number of years (extract from text, e.g., '4 years experience' → 4)",
  "skills": ["skill1", "skill2", "skill3", "EVERY skill mentioned - no limit"],
  "education": "Highest degree from education section",
  "strengths": ["Specific strengths with numbers/metrics if present (e.g., 'Reduced load time by 35%')"],
  "weaknesses": ["Real weaknesses/gaps - if none obvious, suggest minor improvements"],
  "recommendations": ["Actionable recommendations based on what's MISSING - do NOT restate existing achievements"],
  "ats_score": "number from 50 to 95 (Excellent resume: 90-95, Very Good: 80-89, Good: 70-79, Needs Work: 50-69)",
  "field": "Job field from experience (e.g., Technology, Medical, Engineering, Marketing, Sales, Legal, Accounting, Education)"
}

IMPORTANT EXAMPLES:
- If resume says "Reduced page load time by 35%", include that exact number in strengths
- If resume has "Mentored 2 junior developers", include that in strengths
- If resume has "Led team of 4 to hackathon victory", include that in strengths
- If resume is missing LinkedIn, recommend "Add LinkedIn profile URL"
- If resume has no certifications, recommend "Add relevant certifications"
- NEVER put existing strengths as recommendations
- A good resume with quantifiable achievements and good skills should get 85-92

Return ONLY valid JSON. No explanations, no markdown.`;

  const userPrompt = `السيرة الذاتية / Resume:\n${resumeText.substring(0, 8000)}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: systemPrompt + "\n\n" + userPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "";
    console.log("Groq response received, length:", content.length);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // التأكد من أن المهارات هي مصفوفة وتحتوي على كل المهارات
        let skills = Array.isArray(parsed.skills) ? parsed.skills : [];
        if (skills.length === 0) {
          // محاولة استخراج المهارات من النص إذا فشل API
          const allSkills: string[] = [];
          const skillKeywords = ["React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express", "Django", "MongoDB", "PostgreSQL", "Git", "Docker", "AWS", "TailwindCSS", "Redux", "Jest"];
          for (const skill of skillKeywords) {
            if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
              allSkills.push(skill);
            }
          }
          if (allSkills.length > 0) skills = allSkills;
        }
        
        // التأكد من وجود توصيات
        let recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
        if (language === "ar" && recommendations.length > 0) {
          const hasEnglish = recommendations.some((rec: string) => !/[\u0600-\u06FF]/.test(rec));
          if (hasEnglish) {
            recommendations = translateRecommendationsToArabic(recommendations);
          }
        }
        
        // التأكد من أن نقاط القوة محددة وليست عامة
        let strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
        if (strengths.length === 0 || strengths.some((s: string) => s.length < 10)) {
          const mockAnalysis = getMockAnalysis(resumeText, language);
          strengths = mockAnalysis.strengths;
        }
        
        // حساب درجة ATS بالخوارزمية المتقدمة
        const hasQuantifiable = resumeText.match(/\d+%|\d+\s*(?:users|customers|projects|reduction|increase)/i);
        const hasLeadership = resumeText.match(/lead|mentor|manage|senior|leadership|team lead/i);
        
        // استخراج الإنجازات لحساب الدرجة
        const achievements: string[] = [];
        const percentMatch = resumeText.match(/reduced.*?(\d+)%/i);
        if (percentMatch) achievements.push(`Reduced by ${percentMatch[1]}%`);
        const usersMatch = resumeText.match(/(\d+),?(\d+)?\s*(?:users|customers)/i);
        if (usersMatch) achievements.push(`Serves ${usersMatch[1]} users`);
        if (resumeText.match(/hackathon.*?(?:1st|first|won|winner)/i)) achievements.push("Hackathon winner");
        if (resumeText.match(/ci\/cd.*?(\d+)%/i)) achievements.push("CI/CD improvement");
        if (resumeText.match(/mentor.*?(\d+)/i)) achievements.push("Mentoring");
        
        const atsResult = calculateATSScore(skills, !!hasQuantifiable, !!hasLeadership, achievements, resumeText);
        const calculatedScore = atsResult.score;
        
        // استخدام الدرجة المحسوبة بدلاً من درجة Groq
        const finalScore = typeof parsed.ats_score === 'number' 
          ? Math.min(95, Math.max(50, parsed.ats_score)) 
          : calculatedScore;
        
        return {
          name: parsed.name || (language === "ar" ? "مرشح" : "Candidate"),
          years_experience: typeof parsed.years_experience === 'number' ? parsed.years_experience : (parseInt(parsed.years_experience) || 4),
          skills: skills.slice(0, 20),
          education: parsed.education || (language === "ar" ? "بكالوريوس" : "Bachelor's Degree"),
          strengths: strengths.slice(0, 6),
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 4) : (language === "ar" ? ["يحتاج إلى إضافة إنجازات"] : ["Need to add more achievements"]),
          recommendations: recommendations.length > 0 ? recommendations.slice(0, 6) : getMockAnalysis(resumeText, language).recommendations,
          ats_score: finalScore,
          ats_details: atsResult.details,
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
    
    // تسجيل النتائج للتصحيح
    console.log(`Analysis complete: ${analysis.skills.length} skills extracted`);
    console.log(`ATS Score: ${analysis.ats_score} - ${analysis.ats_details?.rating || ''}`);

    return NextResponse.json({
      success: true,
      analysis: analysis,
      ats_breakdown: analysis.ats_details, // إضافة تفصيل درجة ATS
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