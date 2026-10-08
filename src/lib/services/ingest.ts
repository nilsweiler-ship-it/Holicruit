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
  // Broader software / data
  "Next.js",
  "Vue.js",
  "Angular",
  "Svelte",
  "Redux",
  "Tailwind CSS",
  "REST APIs",
  "gRPC",
  "Microservices",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "Kafka",
  "Terraform",
  "CI/CD",
  "Git",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "Swift",
  "C++",
  "C#",
  "Ruby on Rails",
  "PHP",
  "Scala",
  "GCP",
  "Azure",
  "Machine learning",
  "Deep learning",
  "Data engineering",
  "Data analysis",
  "Data visualization",
  "Tableau",
  "Power BI",
  "dbt",
  "Snowflake",
  "Spark",
  // Product / design / ops
  "Product management",
  "Product strategy",
  "Roadmapping",
  "User research",
  "UX design",
  "UI design",
  "Figma",
  "Prototyping",
  "Design systems",
  "Project management",
  "Program management",
  "Agile",
  "Scrum",
  "Stakeholder management",
  // Marketing / sales / finance / ops
  "SEO",
  "SEM",
  "Content marketing",
  "Copywriting",
  "Growth marketing",
  "Demand generation",
  "Account management",
  "Customer success",
  "Negotiation",
  "Accounting",
  "FP&A",
  "Bookkeeping",
  "Payroll",
  "Recruiting",
  "People operations",
  "Supply chain",
  "Operations management",
  // Regulated industries (pharma / quality / life sciences / clinical)
  "Quality Assurance",
  "Quality Management",
  "Quality Control",
  "GMP",
  "cGMP",
  "GxP",
  "CAPA",
  "Aseptic processing",
  "Validation",
  "Auditing",
  "Regulatory affairs",
  "Pharmacovigilance",
  "Clinical research",
  "Batch record review",
  "Deviation management",
  "Root cause analysis",
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
  { skill: "cGMP", industry: "Pharma / Life Sciences" },
  { skill: "GMP", industry: "Pharma / Life Sciences" },
  { skill: "Quality Assurance", industry: "Pharma / Life Sciences" },
  { skill: "Aseptic processing", industry: "Pharma / Life Sciences" },
  { skill: "Pharmacovigilance", industry: "Pharma / Life Sciences" },
];

/**
 * Whole-term match so "Excel" doesn't match inside "Excellent". Treats letters,
 * digits, and `+`/`#` as term characters (so C++, C#, Node.js still match).
 */
function hasTerm(text: string, term: string): boolean {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9+#])${esc}(?![A-Za-z0-9+#])`, "i").test(text);
}

function extractHard(text: string): string[] {
  const found = HARD_VOCAB.filter((s) => hasTerm(text, s));
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
  if (/\bgmp\b|pharmaceutical|aseptic|life sciences|biotech|drug substance/.test(lower)) {
    return "Pharma / Life Sciences";
  }
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

/**
 * General skill extraction for CVs — picks up skills the fixed vocabulary
 * doesn't know, by reading the document's structure rather than only its
 * words. Three signals, in order of reliability:
 *  1. An explicit "Skills"/"Kenntnisse"/"Competencies" section (comma- or
 *     bullet-separated items until the next section heading).
 *  2. Lines that are themselves short delimited lists (e.g. "SAP · Excel · Jira").
 *  3. Recognisable capitalised tool/certification tokens (ISO 13485, PMP, SAP,
 *     Six Sigma, …) anywhere in the text.
 * Results are deduped and merged with the vocabulary matches; the candidate
 * reviews everything before it's saved.
 */
const SECTION_HEADS =
  /^(?:(?:key |core |technical |it[- ])?skills?|competenc(?:y|ies)|expertise|tools?|technolog(?:y|ies)|kenntnisse|fähigkeiten|kompetenzen|qualifikationen|certifications?|zertifi(?:kate|zierungen))\s*[:\-–]?\s*$/i;
const NEXT_HEAD =
  /^(?:experience|work experience|employment|education|ausbildung|berufserfahrung|projects?|languages?|sprachen|interests?|references?|profile|summary|about|contact)\b/i;
const CERT_TOKEN =
  /\b(?:ISO\s?\d{4,5}|IEC\s?\d{4,5}|GMP|cGMP|GxP|GLP|GCP|HACCP|PMP|PRINCE2|ITIL|CISSP|CISA|CPA|CFA|ACCA|SAP(?:\s[A-Z]{2,4})?|Six Sigma|Lean(?:\sSix Sigma)?|Scrum(?:\sMaster)?|Kanban|Agile|OKR|CRM|ERP|BI|ETL|REST|SQL|NoSQL|AWS|GCP|Azure|MATLAB|AutoCAD|SolidWorks|CATIA|Revit|LabVIEW|SPSS|Stata|Tableau|Power BI|Salesforce|HubSpot|Jira|Confluence|Figma|Excel|VBA|R|Python|Java|C\+\+|C#|Go|Rust|Kotlin|Swift|TypeScript|JavaScript|React|Angular|Vue|Node\.js|Docker|Kubernetes|Terraform|Linux)\b/g;

function splitList(line: string): string[] {
  return line
    .split(/[,;•·|]|\s{2,}|\t/)
    .map((s) => s.replace(/^[-–*•\s]+|[.\s]+$/g, "").trim())
    .filter((s) => s.length >= 2 && s.length <= 40 && !/^\d+$/.test(s));
}

function extractCvSkills(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const found = new Map<string, string>(); // lower → display
  const add = (s: string) => {
    const k = s.toLowerCase();
    if (!found.has(k)) found.set(k, s);
  };

  // 1) Skills section
  for (let i = 0; i < lines.length; i++) {
    if (!SECTION_HEADS.test(lines[i]!)) continue;
    for (let j = i + 1; j < lines.length && j < i + 25; j++) {
      const l = lines[j]!;
      if (!l) continue;
      if (NEXT_HEAD.test(l) || SECTION_HEADS.test(l)) break;
      if (/^(?:languages?|sprachen|contact|kontakt)\b/i.test(l)) continue;
      const items = splitList(l);
      // a line with several items is a list; a single short line is one skill
      if (items.length > 1 || (items.length === 1 && l.length <= 40)) items.forEach(add);
    }
  }
  // 2) Delimited list lines anywhere
  for (const l of lines) {
    if (/^(?:languages?|sprachen|contact|kontakt|e-?mail|tel|phone)\b/i.test(l)) continue;
    if (/[,;•·|]/.test(l) && l.length <= 160) {
      const items = splitList(l);
      if (items.length >= 3 && items.every((it) => it.split(/\s+/).length <= 4)) items.forEach(add);
    }
  }
  // 3) Certification / tool tokens
  for (const m of text.matchAll(CERT_TOKEN)) add(m[0].replace(/\s+/g, " "));

  // drop obvious non-skills
  const NOISE =
    /@|\d{4}\s*[-–]\s*\d{4}|^(?:and|und|or|oder|the|with|mit)$|\b(?:analyst|manager|lead|engineer|specialist|director|head|senior|junior|intern|consultant)\b|^(?:deutsch|englisch|französisch|german|english|french|italian|italienisch|spanish|spanisch)$/i;
  return [...found.values()].filter((s) => !NOISE.test(s));
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
    // Vocabulary matches first (canonical names), then general extraction for
    // everything the vocabulary doesn't know — merged, deduped, vocab wins.
    const vocab = extractHard(text);
    const seen = new Set(vocab.map((s) => s.toLowerCase()));
    const extra = extractCvSkills(text).filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const hardSkills = [...vocab, ...extra].slice(0, 40);
    const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean);
    return {
      headline: firstLine?.slice(0, 80),
      industry: inferIndustry(hardSkills, text),
      hardSkills,
    };
  }
}

export const jobAdParser: JobAdParser = new KeywordJobAdParser();
