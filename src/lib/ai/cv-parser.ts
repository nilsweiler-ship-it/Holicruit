import { z } from "zod";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { anthropic } from "./client";
import {
  candidateSkillSchema,
  experienceSchema,
  educationSchema,
} from "@/lib/validations/candidate";

export class CVParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "CVParseError";
  }
}

const parsedCVSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(candidateSkillSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
});

export type ParsedCV = z.infer<typeof parsedCVSchema>;

interface ParseCVInput {
  pdf?: Buffer;
  text?: string;
  fileName: string;
}

const EXTRACTION_PROMPT = `You are a CV/resume parser. Extract structured data from this CV.

Return ONLY valid JSON with this exact shape (no markdown, no code fences):
{
  "bio": "A concise 2-3 sentence professional summary of the candidate",
  "skills": [
    { "name": "Skill Name", "level": 3, "category": "hard" }
  ],
  "experience": [
    { "title": "Job Title", "company": "Company Name", "years": 2, "description": "Brief description" }
  ],
  "education": [
    { "degree": "Degree Name", "institution": "Institution Name", "year": 2020 }
  ]
}

Rules:
- "level" is 1-5: 1=beginner, 2=some experience, 3=proficient, 4=advanced, 5=expert. Infer from context (years of use, seniority, certifications).
- "category" is "hard" for technical/tool skills, "soft" for interpersonal/leadership skills.
- "years" is approximate duration at that position. If only dates are given, calculate the difference.
- "year" for education is the graduation/completion year. If still in progress, use the expected completion year.
- If something cannot be determined, make a reasonable inference or omit it.
- Do NOT invent data that is not present or strongly implied in the CV.`;

function getMockParsedCV(fileName: string): ParsedCV {
  return {
    bio: `Experienced software professional with a strong background in full-stack development and cloud technologies. Extracted from ${fileName}.`,
    skills: [
      { name: "JavaScript", level: 4, category: "hard" },
      { name: "TypeScript", level: 4, category: "hard" },
      { name: "React", level: 4, category: "hard" },
      { name: "Node.js", level: 3, category: "hard" },
      { name: "PostgreSQL", level: 3, category: "hard" },
      { name: "AWS", level: 3, category: "hard" },
      { name: "Python", level: 2, category: "hard" },
      { name: "Communication", level: 4, category: "soft" },
      { name: "Teamwork", level: 4, category: "soft" },
      { name: "Problem Solving", level: 5, category: "soft" },
    ],
    experience: [
      { title: "Senior Software Engineer", company: "TechCorp AG", years: 4, description: "Led frontend architecture migration to React/TypeScript. Managed team of 5 engineers." },
      { title: "Software Developer", company: "StartupHub GmbH", years: 3, description: "Full-stack development with Node.js and React. Built RESTful APIs and microservices." },
      { title: "Junior Developer", company: "WebAgency", years: 2, description: "Frontend development, client projects, WordPress and custom JS solutions." },
    ],
    education: [
      { degree: "Master of Computer Science", institution: "ETH Zurich", year: 2017 },
      { degree: "Bachelor of Computer Science", institution: "University of Bern", year: 2015 },
    ],
  };
}

export async function parseCV({ pdf, text, fileName }: ParseCVInput): Promise<ParsedCV> {
  if (!pdf && !text) {
    throw new CVParseError("Either pdf buffer or text content is required");
  }

  // Mock mode for testing without API credits
  if (process.env.AI_MOCK_MODE === "true") {
    return getMockParsedCV(fileName);
  }

  try {
    const content: ContentBlockParam[] = [
      { type: "text", text: EXTRACTION_PROMPT },
    ];

    if (pdf) {
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdf.toString("base64"),
        },
      });
    } else if (text) {
      content.push({
        type: "text",
        text: `\n\n--- CV CONTENT (${fileName}) ---\n${text}\n--- END CV CONTENT ---`,
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new CVParseError("No text response from AI model");
    }

    // Strip potential markdown code fences
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const raw = JSON.parse(jsonStr);
    const validated = parsedCVSchema.parse(raw);
    return validated;
  } catch (error) {
    if (error instanceof CVParseError) throw error;
    if (error instanceof z.ZodError) {
      throw new CVParseError(
        `CV data validation failed: ${error.issues.map((e) => e.message).join(", ")}`,
        error
      );
    }
    if (error instanceof SyntaxError) {
      throw new CVParseError("Failed to parse AI response as JSON", error);
    }
    throw new CVParseError(
      `CV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
