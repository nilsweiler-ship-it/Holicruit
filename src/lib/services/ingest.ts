/**
 * Ingestion / parsing service — the seam that "translates" unstructured text
 * (a job ad pasted/imported from another platform, or a candidate's CV) into
 * Holicruit's structured skill model. Both openings and candidate profiles use
 * the SAME skill vocabulary, so a parsed job ad and a parsed CV are directly
 * comparable by the matching engine.
 *
 * This implementation is a deterministic keyword extractor (no external calls),
 * behind a clean interface. Swap `KeywordJobAdParser` for an LLM-backed parser
 * later without touching the callers. URL/connector imports (LinkedIn, Indeed…)
 * would fetch the text first, then run through the same parse step.
 */

export interface ParsedJobAd {
  title: string;
  company?: string;
  location: string;
  industry: string;
  requiredHard: string[];
  requiredSoft: string[];
}

export interface ParsedCv {
  headline?: string;
  industry: string;
  hardSkills: string[];
}

export interface JobAdParser {
  parseJobAd(text: string): Promise<ParsedJobAd>;
  parseCv(text: string): Promise<ParsedCv>;
}

/** The shared hard-skill vocabulary (longest phrases first so the most specific
 *  variant wins). Extend freely — this is the taxonomy both sides map onto. */
const HARD_VOCAB = [
  "TypeScript at scale",
  "System design at scale",
  "Forecasting at scale",
  "Pediatric critical care",
  "Critical care transport",
  "Medication administration",
  "Ventilator management",
  "Patient education",
  "ACLS certification",
  "Contract negotiation",
  "Pipeline management",
  "Solution selling",
  "Salesforce CRM",
  "Curriculum design",
  "Classroom management",
  "IFRS 17 reporting",
  "Financial modeling",
  "Product sense",
  "System design",
  "Team leadership",
  "Team quota leadership",
  "Epic EHR",
  "Kubernetes",
  "GraphQL",
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Testing",
  "Docker",
  "AWS",
  "SQL",
  "Excel",
  "Triage",
  "Forecasting",
  "Discovery",
];

/** Soft dimension → trigger substrings (all lower-case). */
const SOFT_VOCAB: Record<string, string[]> = {
  Communication: ["communicat", "stakeholder", "presenting", "written"],
  Collaboration: ["collaborat", "teamwork", "cross-functional", "team player"],
  Ownership: ["ownership", "accountab", "self-starter", "autonom"],
  Adaptability: ["adaptab", "flexib", "fast-paced", "ambiguity"],
  "Problem-solving": ["problem-solving", "problem solving", "analytical", "critical thinking"],
};

/** Skill → industry signal. First hit wins. */
const INDUSTRY_SIGNALS: { skill: string; industry: string }[] = [
  { skill: "Epic EHR", industry: "Healthcare" },
  { skill: "Triage", industry: "Healthcare" },
  { skill: "Pediatric critical care", industry: "Healthcare" },
  { skill: "ACLS certification", industry: "Healthcare" },
  { skill: "Pipeline management", industry: "Sales" },
  { skill: "Solution selling", industry: "Sales" },
  { skill: "Forecasting", industry: "Sales" },
  { skill: "React", industry: "Software" },
  { skill: "TypeScript", industry: "Software" },
  { skill: "Kubernetes", industry: "Software" },
  { skill: "Curriculum design", industry: "Education" },
  { skill: "Classroom management", industry: "Education" },
  { skill: "IFRS 17 reporting", industry: "Finance" },
  { skill: "Financial modeling", industry: "Finance" },
];

function extractHard(text: string): string[] {
  const lower = text.toLowerCase();
  const found = HARD_VOCAB.filter((s) => lower.includes(s.toLowerCase()));
  // Drop any skill that is a substring of a more specific matched skill.
  return found.filter(
    (s) => !found.some((o) => o !== s && o.toLowerCase().includes(s.toLowerCase())),
  );
}

function extractSoft(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(SOFT_VOCAB)
    .filter(([, triggers]) => triggers.some((t) => lower.includes(t)))
    .map(([dim]) => dim);
}

function inferIndustry(hard: string[], text: string): string {
  for (const sig of INDUSTRY_SIGNALS) {
    if (hard.includes(sig.skill)) return sig.industry;
  }
  const lower = text.toLowerCase();
  if (/nurse|clinical|patient|hospital/.test(lower)) return "Healthcare";
  if (/sales|account executive|quota|pipeline/.test(lower)) return "Sales";
  if (/engineer|developer|software/.test(lower)) return "Software";
  return "General";
}

function extractTitle(text: string): string {
  const labelled = text.match(/(?:title|role|position)\s*[:\-]\s*([^\n]{2,80})/i);
  if (labelled?.[1]) return labelled[1].trim();
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean);
  return (firstLine ?? "Imported role").slice(0, 80);
}

function extractCompany(text: string): string | undefined {
  const labelled = text.match(/company\s*[:\-]\s*([^\n]{2,40})/i);
  if (labelled?.[1]) return labelled[1].trim();
  const atMatch = text.match(/\bat\s+([A-Z][\w&.\- ]{1,38})/);
  return atMatch?.[1]?.trim();
}

function extractLocation(text: string): string {
  const labelled = text.match(/location\s*[:\-]\s*([^\n]{2,40})/i);
  if (labelled?.[1]) return labelled[1].trim();
  if (/\bremote\b/i.test(text)) return "Remote";
  if (/\bhybrid\b/i.test(text)) return "Hybrid";
  return "Remote";
}

class KeywordJobAdParser implements JobAdParser {
  async parseJobAd(text: string): Promise<ParsedJobAd> {
    const requiredHard = extractHard(text);
    return {
      title: extractTitle(text),
      company: extractCompany(text),
      location: extractLocation(text),
      industry: inferIndustry(requiredHard, text),
      requiredHard,
      requiredSoft: extractSoft(text),
    };
  }

  async parseCv(text: string): Promise<ParsedCv> {
    const hardSkills = extractHard(text);
    const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean);
    return {
      headline: firstLine?.slice(0, 80),
      industry: inferIndustry(hardSkills, text),
      hardSkills,
    };
  }
}

export const jobAdParser: JobAdParser = new KeywordJobAdParser();
