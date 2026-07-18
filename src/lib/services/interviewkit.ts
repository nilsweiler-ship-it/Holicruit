/**
 * Interview-guide generator (Team+). Produces a structured, role- and
 * candidate-specific interview kit: targeted questions, what to listen for, and
 * the scorecard criterion each maps to — so a hiring manager doesn't spend an
 * afternoon writing one. Rule-based today; designed to be swapped for an LLM
 * behind the same interface without changing the UI.
 */
import type { Match } from "../types";
import type { PersonalityProfile } from "./scenario";

export interface GuideItem {
  question: string;
  listenFor: string;
  criterion: string;
}
export interface GuideSection {
  title: string;
  purpose: string;
  items: GuideItem[];
}
export interface InterviewGuide {
  candidateName: string;
  roleTitle: string;
  minutes: number;
  sections: GuideSection[];
}

const firstName = (name: string) => name.split(" ")[0] ?? name;

export function generateInterviewGuide(
  match: Match,
  personality: PersonalityProfile | null,
): InterviewGuide {
  const name = firstName(match.candidate.name);
  const hard = match.opening.requiredHard.slice(0, 4);
  const soft = match.opening.requiredSoft.slice(0, 3);
  const gaps = match.fit.gaps.slice(0, 3);

  const sections: GuideSection[] = [];

  sections.push({
    title: "Warm-up (5 min)",
    purpose: "Put the candidate at ease and get a self-narrated overview.",
    items: [
      {
        question: `Walk me through the work you're proudest of in the last year, and your specific role in it.`,
        listenFor: "Ownership vs. team credit; scope and impact; clarity of explanation.",
        criterion: "Communication",
      },
    ],
  });

  if (hard.length) {
    sections.push({
      title: "Role skills (15 min)",
      purpose: "Probe depth on the skills this role actually requires.",
      items: hard.map((skill) => ({
        question: `Tell me about a time ${skill} was central to a project. What was hard about it, and what would you do differently now?`,
        listenFor: `Concrete, first-hand detail on ${skill}; trade-offs considered; evidence of real depth vs. surface familiarity.`,
        criterion: "Technical / role skills",
      })),
    });
  }

  if (gaps.length) {
    sections.push({
      title: "Targeted gap probes (10 min)",
      purpose: "Verify or close the specific gaps flagged in the fit model — don't assume.",
      items: gaps.map((g) => ({
        question:
          g.type === "hard"
            ? `Our model flagged limited signal on ${g.skill}. Can you show or describe hands-on experience with it?`
            : `Describe a recent situation that tested your ${g.skill.toLowerCase()}. How did you handle it, and what was the outcome?`,
        listenFor: `Whether the ${g.type} gap is real or just unmeasured; specific evidence; self-awareness about growth areas.`,
        criterion: g.type === "hard" ? "Technical / role skills" : "Culture & values",
      })),
    });
  }

  if (soft.length) {
    sections.push({
      title: "Behavioral (10 min)",
      purpose: "Structured behavioral questions on the soft skills this role needs.",
      items: soft.map((s) => ({
        question: `Give me a specific example where ${s.toLowerCase()} made the difference. Situation, what you did, and the result.`,
        listenFor: `A real STAR-format story; the candidate's own actions (not "we"); a measurable or observable result.`,
        criterion: s.toLowerCase().includes("commun") ? "Communication" : "Ownership & drive",
      })),
    });
  }

  // Personality-informed: probe the two lowest measured traits.
  if (personality && personality.length) {
    const lowest = [...personality].sort((a, b) => a.level - b.level).slice(0, 2);
    sections.push({
      title: "Trait check (5 min)",
      purpose: `Explore the areas ${name}'s assessment scored lowest — confirm or challenge the read.`,
      items: lowest.map((t) => ({
        question: traitQuestion(t.name),
        listenFor: `Behavioral evidence for ${t.name.toLowerCase()}; whether it aligns with or contradicts the measured score (${t.level}/100).`,
        criterion: "Culture & values",
      })),
    });
  }

  sections.push({
    title: "Candidate's questions (5 min)",
    purpose: "What they ask reveals what they care about — and closes strong.",
    items: [
      {
        question: `What would make this role a clear yes for you — and what's your biggest hesitation?`,
        listenFor: "Genuine motivation and honest reservations; signals for the offer conversation.",
        criterion: "Culture & values",
      },
    ],
  });

  return {
    candidateName: match.candidate.name,
    roleTitle: match.opening.title,
    minutes: sections.reduce((n, s) => n + s.items.length, 0) * 4 + 10,
    sections,
  };
}

function traitQuestion(trait: string): string {
  switch (trait) {
    case "Conscientiousness":
      return "Tell me about a time you had to juggle competing deadlines. How did you decide what to drop?";
    case "Emotional stability":
      return "Describe the most stressful stretch you've had at work. How did you stay effective?";
    case "Agreeableness":
      return "Tell me about a disagreement with a colleague. How did you resolve it?";
    case "Extraversion":
      return "How do you prefer to work with a team — and when has that style not worked?";
    case "Openness":
      return "Tell me about a time you had to unlearn something or change your approach.";
    case "Integrity":
      return "Describe a situation where doing the right thing was costly or inconvenient.";
    default:
      return "Tell me about a time this quality was tested at work.";
  }
}
