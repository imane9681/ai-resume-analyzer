import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { analysis, resumeText } = await request.json();

    if (!analysis || !resumeText) {
      return NextResponse.json(
        { error: "Analysis and resume text are required" },
        { status: 400 }
      );
    }

    // تحديد اللغة من التحليل أو النص
    const isArabic = /[\u0600-\u06FF]/.test(analysis.name || resumeText || "");
    
    const improvements = generateImprovements(analysis, resumeText, isArabic);

    return NextResponse.json({
      success: true,
      improvements: improvements,
    });
  } catch (error) {
    console.error("Improve resume error:", error);
    return NextResponse.json(
      { error: "Failed to generate improvements" },
      { status: 500 }
    );
  }
}

function generateImprovements(analysis: any, resumeText: string, isArabic: boolean) {
  const improvements = [];
  const atsScore = analysis.ats_score || 0;
  const skillsCount = analysis.skills?.length || 0;
  const weaknesses = analysis.weaknesses || [];
  const yearsExp = analysis.years_experience || 0;
  
  // تحويل نقاط الضعف إلى نصوص للإنجليزية والعربية
  const weaknessText = weaknesses.join(" ").toLowerCase();
  const hasLeadershipWeakness = weaknessText.includes("leadership") || weaknessText.includes("قيادة");
  const hasAchievementsWeakness = weaknessText.includes("achievement") || weaknessText.includes("إنجاز") || weaknessText.includes("قياس");
  const hasSkillsWeakness = weaknessText.includes("technical") || weaknessText.includes("skills") || weaknessText.includes("مهارات") || weaknessText.includes("تقني");
  const hasCertificationsWeakness = weaknessText.includes("certification") || weaknessText.includes("شهادة");
  
  // 1. اقتراحات المهارات
  if (skillsCount < 6 || hasSkillsWeakness) {
    improvements.push({
      category: "skills",
      title: isArabic ? "توسيع قسم المهارات" : "Expand Your Skills Section",
      description: isArabic 
        ? `سيرتك الذاتية تظهر ${skillsCount} مهارة فقط.` 
        : `Your resume shows only ${skillsCount} skills.`,
      suggestions: isArabic ? [
        "أضف أطر العمل المرتبطة بتقنياتك",
        "أضف أدوات التطوير (Git, Docker, CI/CD)",
        "أضف المهارات الشخصية (التواصل، العمل الجماعي، حل المشكلات)",
        "أضف اللغات والتقنيات المذكورة في أوصاف الوظائف",
      ] : [
        "Frameworks related to your stack",
        "Development tools (Git, Docker, CI/CD)",
        "Soft skills (Communication, Teamwork, Problem-solving)",
        "Languages and technologies mentioned in job descriptions",
      ],
      action: isArabic 
        ? "أدرج المهارات التقنية والشخصية، بهدف الوصول إلى 10-15 مهارة"
        : "List both technical and soft skills, aiming for 10-15 total",
    });
  }
  
  // 2. اقتراحات الإنجازات القابلة للقياس
  if (hasAchievementsWeakness) {
    improvements.push({
      category: "achievements",
      title: isArabic ? "أضف إنجازات قابلة للقياس" : "Add Quantifiable Achievements",
      description: isArabic 
        ? "أصحاب العمل يحبون الأرقام! أضف مقاييس لإنجازاتك." 
        : "Employers love numbers! Add metrics to your experience:",
      suggestions: isArabic ? [
        "حسّنت الأداء بنسبة X%",
        "خفضت التكاليف بمقدار X دولار",
        "أدرت فريقاً من X أشخاص",
        "زدت المبيعات بنسبة X%",
        "خفضت وقت التحميل بمقدار X ثانية",
      ] : [
        "Improved performance by X%",
        "Reduced costs by $X",
        "Managed team of X people",
        "Increased sales by X%",
        "Reduced loading time by X seconds",
      ],
      action: isArabic 
        ? "أعد صياغة نقاط خبراتك باستخدام: 'حققت X عن طريق Y مما أدى إلى Z'"
        : "Rewrite bullet points using: 'Achieved X by doing Y resulting in Z'",
    });
  }
  
  // 3. اقتراحات القيادة
  if (hasLeadershipWeakness || (yearsExp >= 3 && !hasLeadershipWeakness)) {
    improvements.push({
      category: "leadership",
      title: isArabic ? "أبرز خبراتك القيادية" : "Highlight Leadership Experience",
      description: isArabic 
        ? "حتى بدون منصب رسمي، يمكنك إظهار القيادة من خلال:" 
        : "Even without a formal title, you can demonstrate leadership:",
      suggestions: isArabic ? [
        "اذكر المرات التي دربت فيها زملاءك الجدد",
        "صف المشاريع التي قُدتها أو بدأتها",
        "أضف أمثلة على التعاون بين الفرق",
        "أضف أدوار قيادية تطوعية أو مجتمعية",
      ] : [
        "Mention times you mentored junior colleagues",
        "Describe projects you led or initiated",
        "Include cross-functional collaboration examples",
        "Add volunteer or community leadership roles",
      ],
      action: isArabic 
        ? "أضف قسم 'القيادة' أو استخدم أفعال القيادة في خبراتك"
        : "Add a 'Leadership' section or highlight leadership verbs in your experience",
    });
  }
  
  // 4. اقتراحات الشهادات
  if (hasCertificationsWeakness) {
    improvements.push({
      category: "certifications",
      title: isArabic ? "أضف شهادات مهنية ذات صلة" : "Add Relevant Certifications",
      description: isArabic 
        ? "الشهادات تثبت مهاراتك وتظهر التزامك:" 
        : "Certifications validate your skills and show commitment:",
      suggestions: isArabic ? [
        "AWS Certified Developer",
        "Google Professional Cloud Architect",
        "Meta Frontend Developer",
        "Scrum Master Certification",
        "Microsoft Azure Fundamentals",
      ] : [
        "AWS Certified Developer",
        "Google Professional Cloud Architect",
        "Meta Frontend Developer",
        "Scrum Master Certification",
        "Microsoft Azure Fundamentals",
      ],
      action: isArabic 
        ? "أدرج أي شهادات لديك، أو فكر في الحصول على واحدة"
        : "List any certifications you have, or consider earning one",
    });
  }
  
  // 5. اقتراحات تحسين ATS
  if (atsScore < 70) {
    improvements.push({
      category: "ats",
      title: isArabic ? "تحسين التوافق مع أنظمة ATS" : "Improve ATS Compatibility",
      description: isArabic 
        ? "سيرتك الذاتية قد لا تجتاز أنظمة الفحص الآلي:" 
        : "Your resume may not be passing automated screening systems:",
      suggestions: isArabic ? [
        "استخدم عناوين أقسام قياسية (الخبرات، التعليم، المهارات)",
        "تجنب الجداول والأعمدة والرسومات",
        "ضمن كلمات مفتاحية من الوصف الوظيفي",
        "احفظ الملف بصيغة PDF نصية (وليست ممسوحة ضوئياً)",
        "استخدم تنسيقاً بسيطاً ونظيفاً بدون رموز خاصة",
      ] : [
        "Use standard section headings (Experience, Education, Skills)",
        "Avoid tables, columns, and graphics",
        "Include keywords from the job description",
        "Save as .docx or plain PDF (not scanned images)",
        "Use a simple, clean format without special characters",
      ],
      action: isArabic 
        ? "راجع تنسيق سيرتك الذاتية وعناوين الأقسام"
        : "Review your resume format and section headings",
    });
  }
  
  // 6. اقتراح عام (إذا لم تكن هناك اقتراحات محددة)
  if (improvements.length === 0) {
    improvements.push({
      category: "general",
      title: isArabic ? "نصائح عامة لتحسين السيرة الذاتية" : "General Resume Tips",
      description: isArabic 
        ? "اقتراحات إضافية لتحسين سيرتك الذاتية:" 
        : "Additional suggestions to improve your resume:",
      suggestions: isArabic ? [
        "أضف ملخصاً مهنياً قوياً في أعلى السيرة",
        "استخدم أفعال عمل قوية (طورت، قُدت، أنشأت، حسّنت)",
        "خصص السيرة لكل وظيفة تتقدم لها",
        "أضف مشاريع شخصية أو مفتوحة المصدر",
        "تأكد من عدم وجود أخطاء إملائية أو نحوية",
      ] : [
        "Add a strong professional summary at the top",
        "Use strong action verbs (Developed, Led, Created, Improved)",
        "Tailor your resume for each job application",
        "Add personal or open-source projects",
        "Proofread for spelling and grammar errors",
      ],
      action: isArabic 
        ? "طبق هذه النصائح لتحسين فرصك في الحصول على مقابلة"
        : "Apply these tips to improve your chances of getting an interview",
    });
  }
  
  return improvements.slice(0, 5);
}