import { anthropic } from "./client";
import type { ParsedCandidate, ParsedRole, MatchResult } from "@/lib/matching/types";

interface FitNarrativeInput {
  candidate: ParsedCandidate & { bio?: string };
  role: { title: string; description: string } & ParsedRole;
  matchResult: MatchResult;
}

export async function generateFitNarrative({
  candidate,
  role,
  matchResult,
}: FitNarrativeInput): Promise<string> {
  // Mock mode for testing without API credits
  if (process.env.AI_MOCK_MODE === "true") {
    const gaps = matchResult.skillGaps.filter((g) => g.status !== "MET");
    return `This candidate presents a ${matchResult.overallScore >= 70 ? "strong" : "moderate"} overall fit for the ${role.title} position, scoring ${matchResult.overallScore}/100 across all dimensions. Their hard skills score of ${matchResult.dimensions.hardSkills}/100 and soft skills score of ${matchResult.dimensions.softSkills}/100 indicate ${matchResult.dimensions.hardSkills >= 70 ? "solid technical alignment" : "some technical gaps that warrant discussion"}.

With ${candidate.experience.reduce((sum, e) => sum + e.years, 0)} years of total experience across ${candidate.experience.length} positions, the candidate brings practical depth. Their most recent role as ${candidate.experience[0]?.title || "N/A"} at ${candidate.experience[0]?.company || "N/A"} is particularly relevant, demonstrating hands-on leadership and delivery capability.

${gaps.length > 0 ? `There are ${gaps.length} skill gap(s) to consider: ${gaps.map((g) => `${g.skill} (current: ${g.currentLevel}, required: ${g.requiredLevel})`).join(", ")}. These gaps appear trainable rather than fundamental blockers, especially given the candidate's demonstrated learning trajectory.` : "No significant skill gaps were identified — the candidate meets or exceeds all stated requirements."}

Overall, this candidate merits advancement to the interview stage. Their combination of technical skills, relevant experience, and strong soft skills profile suggests they would integrate well with the team and contribute meaningfully from day one.`;
  }

  const prompt = `You are a senior recruiting analyst. Write a 3-5 paragraph qualitative fit assessment for a hiring manager reviewing this candidate.

## Role
- Title: ${role.title}
- Description: ${role.description}
- Required Hard Skills: ${role.hardSkills.map((s) => `${s.name} (level ${s.level})`).join(", ")}
- Required Soft Skills: ${role.softSkills.map((s) => `${s.name} (level ${s.level})`).join(", ")}

## Candidate
- Bio: ${candidate.bio || "Not provided"}
- Skills: ${candidate.skills.map((s) => `${s.name} (level ${s.level}, ${s.category || "hard"})`).join(", ")}
- Experience: ${candidate.experience.map((e) => `${e.title} at ${e.company} (${e.years}yr)`).join("; ")}
- Education: ${candidate.education.map((e) => `${e.degree} from ${e.institution} (${e.year})`).join("; ")}

## Match Scores
- Overall: ${matchResult.overallScore}/100
- Hard Skills: ${matchResult.dimensions.hardSkills}/100
- Soft Skills: ${matchResult.dimensions.softSkills}/100
- Experience: ${matchResult.dimensions.experience}/100
- Education: ${matchResult.dimensions.education}/100

## Skill Gaps
${matchResult.skillGaps
  .filter((g) => g.status !== "MET")
  .map((g) => `- ${g.skill}: ${g.status} (has ${g.currentLevel}, needs ${g.requiredLevel})`)
  .join("\n") || "No significant gaps"}

Write a professional narrative that:
1. Summarizes overall fit and standout strengths
2. Discusses relevant experience and how it maps to the role
3. Highlights any skill gaps and their significance (are they dealbreakers or trainable?)
4. Provides a balanced recommendation

Be specific and reference actual data points. Do not use generic filler. Write in a professional but readable tone.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI model for fit narrative");
  }

  return textBlock.text.trim();
}
