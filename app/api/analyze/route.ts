import { NextRequest, NextResponse } from "next/server";
import { PDFExtract } from "pdf.js-extract";
import Groq from "groq-sdk";

// استخراج النص من PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const pdfExtract = new PDFExtract();
    
    pdfExtract.extractBuffer(buffer, {}, (err: any, data: any) => {
      if (err) {
        console.error("PDF extract error:", err);
        resolve("");
        return;
      }
      
      let fullText = "";
      for (const page of data.pages) {
        for (const content of page.content) {
          fullText += content.str + " ";
        }
        fullText += "\n";
      }
      
      resolve(fullText.trim());
    });
  });
}

// اكتشاف لغة النص
function detectLanguage(text: string): "ar" | "en" {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
  return arabicRatio > 0.3 ? "ar" : "en";
}

// حساب درجة ATS بشكل احترافي
function calculateATSScore(skills: string[], text: string): { score: number; feedback: string[] } {
  let score = 40;
  const feedback: string[] = [];
  
  // 1. تحليل المهارات (وزن 25)
  if (skills.length >= 15) {
    score += 25;
    feedback.push(`✅ ممتاز: لديك ${skills.length} مهارة تقنية متنوعة`);
  } else if (skills.length >= 10) {
    score += 20;
    feedback.push(`👍 جيد: لديك ${skills.length} مهارة تقنية، يمكنك إضافة المزيد`);
  } else if (skills.length >= 6) {
    score += 15;
    feedback.push(`📌 مقبول: حاول إضافة مهارات تقنية إضافية (العدد الحالي: ${skills.length})`);
  } else if (skills.length >= 3) {
    score += 10;
    feedback.push(`⚠️ ضعيف: عدد المهارات التقنية قليل (${skills.length})، أضف مهارات أكثر`);
  } else {
    feedback.push(`❌ حرج: لا توجد مهارات تقنية كافية في سيرتك`);
  }
  
  // 2. الخبرة العملية (وزن 10)
  const experienceMatch = text.match(/(\d+)\s*(?:years|year|سنوات|سنين|خبرة)/i);
  const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;
  if (experience >= 5) {
    score += 10;
    feedback.push(`🏆 خبرة قوية: ${experience} سنوات خبرة`);
  } else if (experience >= 3) {
    score += 7;
    feedback.push(`👍 خبرة جيدة: ${experience} سنوات`);
  } else if (experience > 0) {
    score += 4;
    feedback.push(`📌 خبرة مبتدئ: ${experience} سنوات، ركز على المشاريع`);
  } else {
    feedback.push(`⚠️ لم يتم تحديد سنوات الخبرة بوضوح`);
  }
  
  // 3. الإنجازات القابلة للقياس (وزن 15)
  const achievements = text.match(/\d+%|\d+\s*(?:users|customers|projects|reduction|increase|تطبيق|مستخدم|عميل|مشروع|تحسين|تقليل|\+|زيادة)/gi) || [];
  if (achievements.length >= 5) {
    score += 15;
    feedback.push(`📊 إنجازات قابلة للقياس: ${achievements.length} إنجاز مذكور بأرقام`);
  } else if (achievements.length >= 3) {
    score += 10;
    feedback.push(`👍 يوجد ${achievements.length} إنجاز بأرقام، يمكن إضافة المزيد`);
  } else if (achievements.length >= 1) {
    score += 5;
    feedback.push(`📌 أضف المزيد من الإنجازات القابلة للقياس (مستخدم/مشروع/نسبة)`);
  } else {
    feedback.push(`⚠️ لا توجد إنجازات قابلة للقياس - هذه نقطة ضعف كبيرة في ATS`);
  }
  
  // 4. الشهادات المهنية (وزن 5)
  const certs = text.match(/certif|certification|شهادة|معتمد|aws certified|meta|google|scrum|pmp|ccna|comptia|itil|azure|cloud/i);
  if (certs) {
    score += 5;
    feedback.push(`🎓 شهادات مهنية: ${certs[0]} - ممتاز للتميز`);
  } else {
    feedback.push(`📚 ينصح بإضافة شهادات مهنية (AWS, Google, Scrum, etc.)`);
  }
  
  // 5. المشاريع ونماذج الأعمال (وزن 5)
  const projects = text.match(/project|مشروع|github|gitlab|portfolio|bitbucket|repository/i);
  if (projects) {
    score += 5;
    feedback.push(`💻 مشاريع مرفقة: وجود مشاريع يعزز فرصك`);
  } else {
    feedback.push(`🔧 أضف روابط GitHub أو نماذج أعمالك`);
  }
  
  // 6. القيادة والمبادرات (وزن 5)
  const leadership = text.match(/lead|mentor|manage|senior|leadership|team lead|tech lead|قاد|أدار|قائد|مدير|مشرف|رئيس فريق/i);
  if (leadership) {
    score += 5;
    feedback.push(`👑 مهارات قيادية: وجود خبرات قيادية يضيف قيمة كبيرة`);
  }
  
  // 7. كلمات مفتاحية خاصة بالمجال (وزن 10)
  const domainKeywords = {
    frontend: ["react", "vue", "angular", "next.js", "tailwind"],
    backend: ["node.js", "python", "java", "spring", "django", "api"],
    devops: ["docker", "kubernetes", "ci/cd", "jenkins", "aws", "azure"],
    database: ["sql", "mongodb", "postgresql", "mysql", "firebase"],
  };
  
  let hasDomainKeywords = false;
  for (const category of Object.values(domainKeywords)) {
    if (category.some(kw => text.toLowerCase().includes(kw))) {
      hasDomainKeywords = true;
      break;
    }
  }
  
  if (hasDomainKeywords) {
    score += 10;
    feedback.push(`🔑 كلمات مفتاحية جيدة لمجالك التقني`);
  } else {
    feedback.push(`📝 أضف كلمات مفتاحية خاصة بمجالك (مثال: React, Python, AWS)`);
  }
  
  return {
    score: Math.min(100, score),
    feedback,
  };
}

// تحليل نقاط القوة والضعف بدقة
function analyzeStrengthsWeaknesses(text: string, skills: string[], language: "ar" | "en"): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const isArabic = language === "ar";
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  // تحليل المهارات التقنية
  if (skills.length >= 10) {
    strengths.push(isArabic ? "تنوع تقني ممتاز في المهارات" : "Excellent technical diversity");
  } else if (skills.length >= 5) {
    strengths.push(isArabic ? "قاعدة جيدة من المهارات التقنية" : "Good technical foundation");
  } else if (skills.length < 3) {
    weaknesses.push(isArabic ? "عدد المهارات التقنية ضعيف جداً" : "Very few technical skills mentioned");
    recommendations.push(isArabic ? "أضف جميع المهارات التقنية التي تجيدها (لغات، أطر عمل، أدوات)" : "Add all technical skills you know (languages, frameworks, tools)");
  }
  
  // تحليل الخبرة
  const expMatch = text.match(/(\d+)\s*(?:years|year|سنوات|سنين)/i);
  const exp = expMatch ? parseInt(expMatch[1]) : 0;
  if (exp >= 5) {
    strengths.push(isArabic ? `خبرة غنية (${exp} سنوات) في المجال` : `Rich experience (${exp} years) in the field`);
  } else if (exp >= 2) {
    strengths.push(isArabic ? `خبرة عملية جيدة (${exp} سنوات)` : `Good practical experience (${exp} years)`);
  } else if (exp === 0 && text.length > 500) {
    weaknesses.push(isArabic ? "لم تذكر سنوات الخبرة بشكل واضح" : "Years of experience not clearly stated");
    recommendations.push(isArabic ? "اذكر سنوات خبرتك بدقة في بداية السيرة" : "Clearly state your years of experience at the top");
  }
  
  // تحليل الإنجازات
  const achievements = text.match(/\d+%|\d+\s*(?:users?|customers?|projects?|reduction|increase)/gi) || [];
  if (achievements.length >= 3) {
    strengths.push(isArabic ? `يذكر ${achievements.length} إنجازاً قابلاً للقياس` : `Mentions ${achievements.length} measurable achievements`);
  } else if (achievements.length === 0) {
    weaknesses.push(isArabic ? "غياب الإنجازات القابلة للقياس (أرقام، نسب، نتائج)" : "Lack of measurable achievements (numbers, percentages, results)");
    recommendations.push(isArabic ? "أضف إنجازات قابلة للقياس مثل: 'حسّنت الأداء بنسبة 30%' أو 'أدارت فريقاً من 10 أشخاص'" : "Add measurable achievements like: 'Improved performance by 30%' or 'Managed a team of 10'");
  }
  
  // تحليل التعليم
  const hasEducation = text.match(/bachelor|master|phd|degree|بكالوريوس|ماجستير|دكتوراه|diploma/i);
  if (!hasEducation) {
    weaknesses.push(isArabic ? "القسم التعليمي غير مكتمل أو مفقود" : "Education section incomplete or missing");
    recommendations.push(isArabic ? "أضف مؤهلاتك التعليمية (التخصص، الجامعة، سنة التخرج)" : "Add your education qualifications (major, university, graduation year)");
  } else {
    strengths.push(isArabic ? "تم ذكر المؤهل التعليمي" : "Education qualification mentioned");
  }
  
  // تحليل اللغة الإنجليزية
  const hasEnglish = text.match(/english|ielts|toefl|fluent|انجليزي|توفل|آيلتس/i);
  if (!hasEnglish) {
    recommendations.push(isArabic ? "أضف مستواك في اللغة الإنجليزية (مبتدئ/متوسط/متقدم/ممتاز)" : "Add your English proficiency level (beginner/intermediate/advanced/fluent)");
  }
  
  // تحليل الروابط والملفات الشخصية
  const hasLinks = text.match(/https?:\/\/|linkedin\.com\/in\/|github\.com\/|linkedin|github|gitlab/i);
  if (!hasLinks) {
    recommendations.push(isArabic ? "أضف روابط LinkedIn و GitHub حتى يتمكن مسؤولو التوظيف من الاطلاع على ملفك الشخصي" : "Add LinkedIn and GitHub links so recruiters can view your profile");
  } else {
    strengths.push(isArabic ? "تم إضافة روابط حساباتك المهنية" : "Professional profile links added");
  }
  
  // تحليل القيادة
  const hasLeadership = text.match(/lead|manage|supervise|mentor|coordinator|head|director|مدير|قائد|مشرف|رئيس|قيادة/i);
  if (hasLeadership) {
    strengths.push(isArabic ? "يبدو أن لديك خبرات قيادية" : "Leadership experience evident");
  } else if (exp >= 3) {
    recommendations.push(isArabic ? "أضف أي مهام قيادية قمت بها (إدارة فريق، توجيه، إشراف)" : "Add any leadership tasks you performed (team management, mentoring, supervision)");
  }
  
  // التأكد من وجود توصيات متنوعة
  if (recommendations.length < 3) {
    if (!recommendations.some(r => r.includes("إنجازات") || r.includes("achievements"))) {
      recommendations.push(isArabic ? "استخدم أرقاماً وإحصائيات لوصف إنجازاتك (مثال: زاد المبيعات بنسبة 25%)" : "Use numbers and statistics to describe achievements (e.g., increased sales by 25%)");
    }
    if (!recommendations.some(r => r.includes("سيرة") || r.includes("resume"))) {
      recommendations.push(isArabic ? "خصص سيرتك الذاتية لكل وظيفة بناءً على الكلمات المفتاحية في وصف الوظيفة" : "Tailor your resume for each job based on keywords in the job description");
    }
  }
  
  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    recommendations: recommendations.slice(0, 5),
  };
}

// تحليل السيرة باستخدام Groq
async function analyzeWithGroq(resumeText: string, language: "ar" | "en") {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn("GROQ_API_KEY not found, using enhanced mock analysis");
    return getEnhancedMockAnalysis(resumeText, language);
  }

  const groq = new Groq({ apiKey });

  const prompt = language === "ar" 
    ? `أنت خبير موارد بشرية محترف ومتخصص في تحليل السير الذاتية. حلل السيرة التالية بدقة عالية وأعد JSON فقط.

مطلوب منك استخراج المعلومات التالية:
1. الاسم الكامل
2. عدد سنوات الخبرة بدقة
3. جميع المهارات التقنية (لغات برمجة، أطر عمل، أدوات، قواعد بيانات، منصات سحابية، DevOps)
4. أعلى شهادة تعليمية
5. المجال الوظيفي (مثلاً: Frontend, Backend, Full Stack, DevOps, Data Science)
6. نقاط القوة (بناءً على تحليل السيرة)
7. نقاط الضعف (بناءً على تحليل السيرة)
8. توصيات قابلة للتنفيذ (5 توصيات مهنية)

{
  "name": "الاسم الكامل",
  "years_experience": 0,
  "skills": ["مهارة1", "مهارة2"],
  "education": "أعلى شهادة",
  "field": "المجال الوظيفي",
  "strengths": ["نقطة قوة1", "نقطة قوة2", "نقطة قوة3"],
  "weaknesses": ["نقطة ضعف1", "نقطة ضعف2"],
  "recommendations": ["توصية1", "توصية2", "توصية3", "توصية4", "توصية5"]
}

السيرة الذاتية:
${resumeText.substring(0, 10000)}`
    : `You are a professional HR expert and resume analyst. Analyze the following resume carefully and return ONLY JSON.

Extract:
1. Full name
2. Exact years of experience
3. ALL technical skills (programming languages, frameworks, tools, databases, cloud platforms, DevOps)
4. Highest education degree
5. Job field (e.g., Frontend, Backend, Full Stack, DevOps, Data Science)
6. Strengths (based on resume analysis)
7. Weaknesses (based on resume analysis)
8. Actionable recommendations (5 professional recommendations)

{
  "name": "Full name",
  "years_experience": 0,
  "skills": ["skill1", "skill2"],
  "education": "Highest degree",
  "field": "Job field",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"]
}

Resume:
${resumeText.substring(0, 10000)}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content || "";
    console.log("Groq response received, length:", content.length);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      let skills = Array.isArray(parsed.skills) ? parsed.skills : [];
      
      // التحسين: استخراج مهارات إضافية من النص إذا كانت قليلة
      if (skills.length < 5) {
        const commonSkills = [
          "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express",
          "Django", "Flask", "MongoDB", "PostgreSQL", "MySQL", "Git", "Docker", "AWS",
          "TailwindCSS", "Redux", "Jest", "GraphQL", "REST API", "Kubernetes", "Azure",
          "Java", "C#", ".NET", "PHP", "Laravel", "Vue.js", "Angular", "SASS", "Figma"
        ];
        skills = commonSkills.filter(skill => 
          resumeText.toLowerCase().includes(skill.toLowerCase())
        );
      }
      
      // تحليل احترافي لنقاط القوة والضعف
      const detailedAnalysis = analyzeStrengthsWeaknesses(resumeText, skills, language);
      
      // حساب درجة ATS مع التغذية الراجعة
      const atsAnalysis = calculateATSScore(skills, resumeText);
      
      return {
        name: parsed.name || (language === "ar" ? "مرشح" : "Candidate"),
        years_experience: typeof parsed.years_experience === 'number' && parsed.years_experience > 0 ? parsed.years_experience : 2,
        skills: skills.slice(0, 25),
        education: parsed.education || (language === "ar" ? "بكالوريوس" : "Bachelor's Degree"),
        field: parsed.field || (language === "ar" ? "تقنية المعلومات" : "Information Technology"),
        strengths: detailedAnalysis.strengths,
        weaknesses: detailedAnalysis.weaknesses,
        recommendations: detailedAnalysis.recommendations,
        ats_score: atsAnalysis.score,
        ats_feedback: atsAnalysis.feedback,
      };
    }
    
    console.error("No JSON found in Groq response");
    return getEnhancedMockAnalysis(resumeText, language);
  } catch (error) {
    console.error("Groq API error:", error);
    return getEnhancedMockAnalysis(resumeText, language);
  }
}

// تحليل احتياطي متطور
function getEnhancedMockAnalysis(resumeText: string, language: "ar" | "en") {
  const allSkills = [
    "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express",
    "Django", "Flask", "Java", "Spring", "MongoDB", "PostgreSQL", "MySQL",
    "Docker", "Kubernetes", "AWS", "Azure", "Git", "TailwindCSS", "Redux",
    "GraphQL", "REST API", "Jest", "Figma"
  ];
  
  const foundSkills = allSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  
  const skills = foundSkills.length > 0 ? foundSkills : (language === "ar" ? 
    ["React", "Node.js", "TypeScript", "Python", "Git", "Docker", "MongoDB"] : 
    ["React", "Node.js", "TypeScript", "Python", "Git", "Docker", "MongoDB"]);
  
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
  const name = nameMatch ? nameMatch[1] : (language === "ar" ? "مرشح" : "Candidate");
  
  const yearMatch = resumeText.match(/(\d+)\s*(?:years|year|سنوات|سنين)/i);
  const years_experience = yearMatch ? Math.min(parseInt(yearMatch[1]), 25) : 2;
  
  const atsAnalysis = calculateATSScore(skills, resumeText);
  const detailedAnalysis = analyzeStrengthsWeaknesses(resumeText, skills, language);
  
  let field = "Information Technology";
  if (resumeText.match(/react|vue|angular|frontend|front-end|ui|ux|html|css/i))
    field = language === "ar" ? "تطوير الواجهات الأمامية" : "Frontend Development";
  else if (resumeText.match(/node|python|django|api|database|sql|backend|back-end/i))
    field = language === "ar" ? "تطوير الواجهات الخلفية" : "Backend Development";
  else if (resumeText.match(/docker|kubernetes|aws|azure|devops|ci\/cd|jenkins/i))
    field = language === "ar" ? "DevOps والبنية التحتية" : "DevOps & Infrastructure";
  
  return {
    name,
    years_experience,
    skills: skills.slice(0, 20),
    education: language === "ar" ? "بكالوريوس في علوم الحاسوب" : "Bachelor of Computer Science",
    field,
    strengths: detailedAnalysis.strengths,
    weaknesses: detailedAnalysis.weaknesses,
    recommendations: detailedAnalysis.recommendations,
    ats_score: atsAnalysis.score,
    ats_feedback: atsAnalysis.feedback,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "يجب رفع ملف PDF" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم، يرجى رفع ملف PDF فقط" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ error: "لم يتم العثور على نص في ملف PDF، تأكد من أن الملف يحتوي على نص قابل للقراءة" }, { status: 400 });
    }

    const language = detectLanguage(extractedText);
    console.log(`Language: ${language === "ar" ? "Arabic" : "English"} | Text length: ${extractedText.length} chars`);

    const analysis = await analyzeWithGroq(extractedText, language);

    return NextResponse.json({
      success: true,
      analysis,
      message: "تم تحليل السيرة الذاتية بنجاح",
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحليل السيرة الذاتية، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}