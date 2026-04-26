import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const match = calculateJobMatch(resumeText, jobDescription);

    return NextResponse.json({
      success: true,
      match: match,
      message: "Job match analyzed successfully!"
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

function extractSkillsFromText(text: string): string[] {
  const skillKeywords = [
    "React", "React.js", "ReactJS", "Angular", "AngularJS", "Vue", "Vue.js",
    "Next.js", "NextJS", "Nuxt.js", "Node.js", "NodeJS", "Express", "Express.js",
    "Python", "Django", "Flask", "FastAPI", "Java", "Spring", "Spring Boot",
    "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Symfony",
    "TypeScript", "JavaScript", "HTML5", "CSS3", "SASS", "SCSS", "TailwindCSS",
    "Bootstrap", "Material UI", "Chakra UI",
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Firebase", "Supabase",
    "GraphQL", "REST API", "RESTful", "Redux", "Zustand", "Context API",
    "Git", "GitHub", "GitLab", "Bitbucket", "Docker", "Kubernetes", "K8s",
    "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP",
    "Jest", "Cypress", "Playwright", "Vitest", "Mocha", "Chai",
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
    "Leadership", "Team Management", "Mentoring", "Agile", "Scrum", "Kanban",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Terraform"
  ];
  
  const textLower = text.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of skillKeywords) {
    if (textLower.includes(skill.toLowerCase())) {
      // Get original casing for display
      const originalSkill = skillKeywords.find(s => s.toLowerCase() === skill.toLowerCase()) || skill;
      if (!foundSkills.includes(originalSkill)) {
        foundSkills.push(originalSkill);
      }
    }
  }
  
  return foundSkills;
}

function calculateJobMatch(resumeText: string, jobDescription: string): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  matchLevel: string;
} {
  // Extract skills from both texts
  const resumeSkills = extractSkillsFromText(resumeText);
  const jobSkills = extractSkillsFromText(jobDescription);
  
  // Remove duplicates
  const uniqueJobSkills = [...new Set(jobSkills)];
  const uniqueResumeSkills = [...new Set(resumeSkills)];
  
  // Find matched and missing skills
  const matchedSkills = uniqueResumeSkills.filter(skill => 
    uniqueJobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = uniqueJobSkills.filter(skill => 
    !uniqueResumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );
  
  // Calculate match score
  const score = uniqueJobSkills.length > 0 
    ? Math.round((matchedSkills.length / uniqueJobSkills.length) * 100)
    : 0;
  
  // Determine match level
  let matchLevel = "Low";
  if (score >= 80) matchLevel = "Excellent";
  else if (score >= 60) matchLevel = "Good";
  else if (score >= 40) matchLevel = "Moderate";
  
  // Generate recommendations based on missing skills
  const recommendations: string[] = [];
  
  if (missingSkills.length > 0) {
    recommendations.push(`Consider adding these skills to your resume: ${missingSkills.slice(0, 5).join(", ")}`);
  }
  
  if (score < 50) {
    recommendations.push("Your resume may need significant updates to match this role");
    recommendations.push("Highlight relevant projects and experience that align with the job requirements");
  }
  
  if (matchedSkills.length > 0) {
    recommendations.push(`Emphasize your experience with ${matchedSkills.slice(0, 3).join(", ")} in your interview`);
  }
  
  recommendations.push("Tailor your resume's summary section to include keywords from the job description");
  
  return {
    score,
    matchedSkills: matchedSkills.slice(0, 15),
    missingSkills: missingSkills.slice(0, 15),
    recommendations: recommendations.slice(0, 5),
    matchLevel
  };
}