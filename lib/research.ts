import { openai, MODELS } from './openai';
import type { ResearchSnapshot } from './schema';

/**
 * Generates a research snapshot by analyzing CV and job description using OpenAI.
 * This combines CV summary, job spec analysis, and company research into a structured format.
 */
export async function generateResearchSnapshot(params: {
  cvText: string;
  jobDescriptionText: string;
  jobTitle: string;
  company: string;
  location: string;
}): Promise<ResearchSnapshot> {
  const { cvText, jobDescriptionText, jobTitle, company, location } = params;

  // Construct the prompt for OpenAI
  const prompt = `You are an expert career counselor and interview coach. Analyze the following CV and job description to create a structured research snapshot for interview preparation.

# CV Content:
${cvText}

# Job Description:
Role: ${jobTitle}
Company: ${company}
Location: ${location}

${jobDescriptionText}

# Task:
Create a comprehensive research snapshot with the following structure. Return ONLY valid JSON with no additional text or markdown formatting.

{
  "cv_summary": {
    "name": "candidate's name if found, or null",
    "experience_years": estimated years of experience as a number,
    "key_skills": ["array", "of", "main", "technical", "skills"],
    "recent_roles": ["array of recent job titles"],
    "education": ["array of degrees/qualifications"],
    "summary": "2-3 sentence concise summary of the candidate's background"
  },
  "job_spec_summary": {
    "role": "${jobTitle}",
    "level": "junior|mid|senior|lead",
    "key_requirements": ["must-have skills or qualifications"],
    "nice_to_have": ["optional but beneficial skills"],
    "responsibilities": ["main job responsibilities"],
    "summary": "2-3 sentence summary of what the role entails"
  },
  "company_facts": {
    "name": "${company}",
    "industry": "industry sector based on job description",
    "size": "startup|mid-size|enterprise (make educated guess)",
    "mission": "inferred mission or purpose if mentioned",
    "values": ["inferred company values from job description"]
  },
  "competencies": {
    "technical": ["specific technical skills to assess in interview"],
    "behavioral": ["soft skills like communication, leadership, teamwork"],
    "domain": ["domain knowledge areas relevant to the role"]
  },
  "sources": {
    "company_website": null,
    "linkedin": null,
    "news_articles": [],
    "other": ["Based on job description and CV analysis"]
  },
  "created_at": "${new Date().toISOString()}",
  "version": "1.0"
}

Focus on:
1. Identifying the candidate's strongest skills and experience
2. Extracting key requirements and responsibilities from the job description
3. Suggesting relevant competencies to assess during the interview
4. Being concise and actionable

Return only the JSON object, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional career analyst. You always respond with valid JSON only, no markdown formatting, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual output
      response_format: { type: 'json_object' }, // Enforce JSON response
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response
    const snapshot = JSON.parse(content) as ResearchSnapshot;

    // Validate that we have the required structure
    if (
      !snapshot.cv_summary ||
      !snapshot.job_spec_summary ||
      !snapshot.company_facts
    ) {
      throw new Error('Invalid snapshot structure from OpenAI');
    }

    return snapshot;
  } catch (error) {
    console.error('Error generating research snapshot:', error);
    throw new Error(
      `Failed to generate research snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Creates a basic research snapshot without AI (fallback or testing)
 */
export function createBasicSnapshot(params: {
  cvText: string;
  jobDescriptionText: string;
  jobTitle: string;
  company: string;
  location: string;
}): ResearchSnapshot {
  const { jobTitle, company, cvText, jobDescriptionText } = params;

  return {
    cv_summary: {
      key_skills: [],
      recent_roles: [],
      summary: `CV contains ${cvText.length} characters of experience and qualifications.`,
    },
    job_spec_summary: {
      role: jobTitle,
      key_requirements: [],
      responsibilities: [],
      summary: `Role: ${jobTitle}. Job description contains ${jobDescriptionText.length} characters.`,
    },
    company_facts: {
      name: company,
    },
    competencies: {
      technical: [],
      behavioral: ['Communication', 'Problem Solving', 'Teamwork'],
      domain: [],
    },
    sources: {
      other: ['Basic analysis without AI'],
    },
    created_at: new Date().toISOString(),
    version: '1.0',
  };
}
