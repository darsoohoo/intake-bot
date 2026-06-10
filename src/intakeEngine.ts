import type {
  IntakeDraft,
  IntakeMessage,
  Readiness,
  RequestCategory,
  RequestSize,
  RequestStatus,
  Urgency
} from "./types";

export const categoryOptions: RequestCategory[] = [
  "Bug",
  "Enhancement",
  "Automation",
  "Reporting",
  "Access",
  "Integration",
  "Data",
  "Process",
  "Uncategorized"
];

export const urgencyOptions: Urgency[] = ["Low", "Medium", "High", "Critical"];

export const sizeOptions: RequestSize[] = [
  "Small",
  "Medium",
  "Large",
  "Extra Large"
];

export const emptyDraft: IntakeDraft = {
  title: "",
  description: "",
  category: "Uncategorized",
  affectedArea: "",
  usersAffected: "",
  businessImpact: "",
  urgency: "Medium",
  desiredOutcome: "",
  constraints: "",
  dependencies: "",
  acceptanceCriteria: "",
  size: "Small",
  estimatedEffort: "4-8 hours",
  estimatedDuration: "1-2 business days",
  confidence: 0,
  missingRequirements: [],
  additionalInformation: ""
};

const requiredFieldLabels: Array<[keyof IntakeDraft, string]> = [
  ["title", "short title"],
  ["description", "problem or request description"],
  ["category", "request category"],
  ["affectedArea", "affected app, process, or data source"],
  ["businessImpact", "business impact"],
  ["urgency", "urgency"],
  ["desiredOutcome", "expected outcome"]
];

const categorySignals: Record<RequestCategory, string[]> = {
  Bug: [
    "bug",
    "broken",
    "error",
    "fail",
    "failure",
    "fix",
    "issue",
    "not working",
    "crash",
    "wrong"
  ],
  Enhancement: [
    "add",
    "change",
    "enhance",
    "improve",
    "new field",
    "new feature",
    "update",
    "would like"
  ],
  Automation: [
    "automate",
    "automatically",
    "bulk",
    "combine",
    "document",
    "download each",
    "generate",
    "merge",
    "manual",
    "one click",
    "pdf",
    "workflow",
    "approval",
    "route",
    "notification",
    "email",
    "reminder"
  ],
  Reporting: [
    "dashboard",
    "report",
    "export",
    "kpi",
    "metric",
    "chart",
    "power bi",
    "summary"
  ],
  Access: [
    "access",
    "permission",
    "login",
    "role",
    "security",
    "cannot see",
    "blocked from"
  ],
  Integration: [
    "api",
    "connector",
    "integration",
    "sync",
    "sharepoint",
    "dataverse",
    "sql",
    "teams",
    "outlook"
  ],
  Data: [
    "data",
    "duplicate",
    "migration",
    "record",
    "table",
    "column",
    "mapping",
    "import"
  ],
  Process: [
    "process",
    "handoff",
    "intake",
    "triage",
    "policy",
    "procedure",
    "operation"
  ],
  Uncategorized: []
};

const affectedAreaSignals = [
  "Power Apps",
  "Canvas app",
  "Model-driven app",
  "Dataverse",
  "SharePoint",
  "Power Automate",
  "Power BI",
  "Teams",
  "Outlook",
  "Excel",
  "SQL",
  "Dynamics",
  "Salesforce",
  "ServiceNow"
];

export function createMessage(
  role: IntakeMessage["role"],
  content: string
): IntakeMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function analyzeMessages(messages: IntakeMessage[]): IntakeDraft {
  const userTexts = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);

  if (userTexts.length === 0) {
    return finalizeDraft(emptyDraft);
  }

  const combined = userTexts.join("\n");
  const first = userTexts[0] ?? "";
  const category = inferCategory(combined);
  const urgency = inferUrgency(combined);
  const derived: IntakeDraft = applyContextualAnswers(messages, {
    ...emptyDraft,
    title: makeTitle(first),
    description: summarizeDescription(userTexts),
    category,
    affectedArea: inferAffectedArea(combined),
    usersAffected: inferUsersAffected(combined),
    businessImpact: pickSentence(combined, [
      "impact",
      "blocks",
      "blocked",
      "delay",
      "manual",
      "customers",
      "revenue",
      "risk",
      "compliance",
      "cannot",
      "can't",
      "separate",
      "separately",
      "slow",
      "tedious",
      "time"
    ]),
    urgency,
    desiredOutcome: inferDesiredOutcome(combined, category),
    constraints: pickSentence(combined, [
      "deadline",
      "by ",
      "before",
      "must",
      "compliance",
      "audit",
      "security",
      "legal"
    ]),
    dependencies: pickSentence(combined, [
      "depends",
      "dependency",
      "approval flow",
      "connector",
      "api",
      "vendor",
      "integration",
      "dataverse",
      "role",
      "flow"
    ]),
    acceptanceCriteria: buildAcceptanceCriteria(combined, category)
  });

  return finalizeDraft(derived);
}

export function finalizeDraft(
  draft: IntakeDraft,
  options: { preserveEstimate?: boolean } = {}
): IntakeDraft {
  const estimate = options.preserveEstimate
    ? {
        size: draft.size,
        estimatedEffort: draft.estimatedEffort,
        estimatedDuration: draft.estimatedDuration
      }
    : estimateRequest(draft);
  const missingRequirements = getMissingRequirements({
    ...draft,
    ...estimate
  });
  const confidence = calculateConfidence(missingRequirements, draft);
  const completed = {
    ...draft,
    ...estimate,
    missingRequirements,
    confidence
  };

  return {
    ...completed,
    additionalInformation: buildDeveloperNotes(completed)
  };
}

export function estimateForSize(
  size: RequestSize
): Pick<IntakeDraft, "size" | "estimatedEffort" | "estimatedDuration"> {
  if (size === "Small") {
    return {
      size,
      estimatedEffort: "4-8 hours",
      estimatedDuration: "1-2 business days"
    };
  }

  if (size === "Medium") {
    return {
      size,
      estimatedEffort: "2-5 days",
      estimatedDuration: "1-2 weeks"
    };
  }

  if (size === "Large") {
    return {
      size,
      estimatedEffort: "1-3 weeks",
      estimatedDuration: "2-4 weeks"
    };
  }

  return {
    size,
    estimatedEffort: "3+ weeks",
    estimatedDuration: "4+ weeks"
  };
}

export function getReadiness(draft: IntakeDraft): Readiness {
  if (draft.missingRequirements.length === 0 && draft.confidence >= 75) {
    return {
      score: draft.confidence,
      label: "Ready to submit",
      tone: "ready"
    };
  }

  if (draft.confidence >= 50) {
    return {
      score: draft.confidence,
      label: "Needs review",
      tone: "draft"
    };
  }

  return {
    score: draft.confidence,
    label: "Needs intake",
    tone: "blocked"
  };
}

export function getNextQuestion(draft: IntakeDraft): string {
  if (!draft.description) {
    return "Tell me what the user is trying to change, fix, or request in a sentence or two.";
  }

  if (!draft.affectedArea) {
    return "Which app, process, table, report, or data source is affected?";
  }

  if (draft.category === "Uncategorized") {
    return "What type of request is this: bug, enhancement, automation, reporting, access, integration, data, or process?";
  }

  if (!draft.businessImpact) {
    return "What business problem does this create, and who is affected by it?";
  }

  if (!draft.desiredOutcome) {
    return "What should be true when this request is finished?";
  }

  if (!draft.usersAffected) {
    return "Which users or teams are affected, and is this one person or a broader group?";
  }

  if (!draft.acceptanceCriteria) {
    return "What would you check to confirm the work is done correctly?";
  }

  if ((draft.size === "Large" || draft.size === "Extra Large") && !draft.dependencies) {
    return "Are there dependencies, approvals, integrations, data migrations, or teams that developers should know about?";
  }

  if (!draft.constraints && draft.urgency !== "Low") {
    return "Is there a deadline, compliance concern, outage, or release window driving the timing?";
  }

  return "I have enough to draft the request. Review the fields, adjust anything that looks off, and submit when ready.";
}

export function selectNextQuestion(
  draft: IntakeDraft,
  preferredQuestion?: string,
  messages: IntakeMessage[] = []
): string {
  const localQuestion = getNextQuestion(draft);
  const trimmedPreferred = preferredQuestion?.trim();

  if (!trimmedPreferred) {
    return localQuestion;
  }

  if (isStaleQuestion(trimmedPreferred, draft)) {
    return localQuestion;
  }

  const previousAssistantQuestion = findPreviousAssistantPrompt(messages, messages.length);
  const normalizedPreferred = normalizeQuestion(trimmedPreferred);

  if (
    previousAssistantQuestion &&
    normalizedPreferred === normalizeQuestion(previousAssistantQuestion) &&
    normalizedPreferred !== normalizeQuestion(localQuestion)
  ) {
    return localQuestion;
  }

  return trimmedPreferred;
}

export function toPowerPlatformPayload(
  draft: IntakeDraft,
  options: {
    messages?: IntakeMessage[];
    status?: RequestStatus;
  } = {}
) {
  return {
    crb_title: draft.title,
    crb_description: draft.description,
    crb_category: draft.category,
    crb_affectedarea: draft.affectedArea,
    crb_usersaffected: draft.usersAffected,
    crb_businessimpact: draft.businessImpact,
    crb_urgency: draft.urgency,
    crb_desiredoutcome: draft.desiredOutcome,
    crb_constraints: draft.constraints,
    crb_dependencies: draft.dependencies,
    crb_acceptancecriteria: draft.acceptanceCriteria,
    crb_size: draft.size,
    crb_estimatedeffort: draft.estimatedEffort,
    crb_estimatedduration: draft.estimatedDuration,
    crb_confidence: draft.confidence,
    crb_missingrequirements: draft.missingRequirements.join("; "),
    crb_additionalinformation: draft.additionalInformation,
    crb_conversationjson: JSON.stringify(options.messages ?? []),
    crb_status: options.status ?? "Draft"
  };
}

function inferCategory(text: string): RequestCategory {
  const normalized = text.toLowerCase();
  let best: RequestCategory = "Uncategorized";
  let bestScore = 0;

  for (const [category, signals] of Object.entries(categorySignals) as Array<
    [RequestCategory, string[]]
  >) {
    const score = signals.reduce(
      (total, signal) => total + (normalized.includes(signal) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return best;
}

function inferUrgency(text: string): Urgency {
  const normalized = text.toLowerCase();

  if (containsAny(normalized, ["outage", "production down", "critical", "cannot work", "security incident"])) {
    return "Critical";
  }

  if (
    containsAny(normalized, [
      "urgent",
      "today",
      "tomorrow",
      "this week",
      "asap",
      "high priority",
      "blocked",
      "blocks",
      "before friday",
      "by friday"
    ])
  ) {
    return "High";
  }

  if (
    containsAny(normalized, ["no rush", "nice to have", "when possible", "low priority"])
  ) {
    return "Low";
  }

  return "Medium";
}

function estimateRequest(draft: IntakeDraft): Pick<
  IntakeDraft,
  "size" | "estimatedEffort" | "estimatedDuration"
> {
  const text = `${draft.description} ${draft.businessImpact} ${draft.desiredOutcome} ${draft.constraints} ${draft.dependencies}`.toLowerCase();
  let score = 1;

  if (draft.category === "Integration" || draft.category === "Data") {
    score += 2;
  }

  if (draft.category === "Bug" && draft.urgency === "Critical") {
    score += 1;
  }

  if (
    containsAny(text, [
      "multiple teams",
      "many users",
      "migration",
      "security",
      "compliance",
      "audit",
      "approval",
      "api",
      "custom connector",
      "external vendor"
    ])
  ) {
    score += 2;
  }

  if (
    containsAny(text, [
      "new app",
      "new workflow",
      "end-to-end",
      "integration",
      "dataverse table",
      "reporting model",
      "roles"
    ])
  ) {
    score += 1;
  }

  if (draft.description.length > 450 || draft.missingRequirements.length > 3) {
    score += 1;
  }

  if (score <= 2) {
    return estimateForSize("Small");
  }

  if (score <= 4) {
    return estimateForSize("Medium");
  }

  if (score <= 6) {
    return estimateForSize("Large");
  }

  return estimateForSize("Extra Large");
}

function getMissingRequirements(draft: IntakeDraft): string[] {
  return requiredFieldLabels.flatMap(([field, label]) => {
    if (field === "category") {
      return draft.category === "Uncategorized" ? [label] : [];
    }

    const value = draft[field];
    return typeof value === "string" && value.trim().length === 0 ? [label] : [];
  });
}

function calculateConfidence(missing: string[], draft: IntakeDraft): number {
  const totalRequired = requiredFieldLabels.length;
  const presentScore = ((totalRequired - missing.length) / totalRequired) * 78;
  const detailBonus =
    (draft.acceptanceCriteria ? 7 : 0) +
    (draft.usersAffected ? 5 : 0) +
    (draft.constraints ? 5 : 0) +
    (draft.dependencies ? 5 : 0);

  return Math.min(96, Math.round(presentScore + detailBonus));
}

function buildDeveloperNotes(draft: IntakeDraft): string {
  const lines = [
    `Likely category: ${draft.category}.`,
    `Sizing signal: ${draft.size}, estimated at ${draft.estimatedEffort} over ${draft.estimatedDuration}.`,
    draft.dependencies
      ? `Dependencies called out: ${draft.dependencies}`
      : "No explicit dependencies were provided yet.",
    draft.constraints
      ? `Timing or constraint signal: ${draft.constraints}`
      : "No deadline, compliance, or release-window constraint was provided yet.",
    draft.missingRequirements.length > 0
      ? `Still missing: ${draft.missingRequirements.join(", ")}.`
      : "Required intake fields appear complete."
  ];

  if (draft.category === "Integration" || draft.category === "Data") {
    lines.push("Developer attention: confirm source systems, record ownership, data mapping, and error handling.");
  }

  if (draft.category === "Access") {
    lines.push("Developer attention: confirm role, environment, app sharing, and least-privilege expectations.");
  }

  if (draft.category === "Bug") {
    lines.push("Developer attention: ask for reproduction steps, screenshots, affected records, and last known good behavior.");
  }

  return lines.join("\n");
}

function makeTitle(text: string): string {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/^(i need|we need|can you|please|request to)\s+/i, "")
    .trim();

  if (!clean) {
    return "";
  }

  const sentence = clean.split(/[.!?]/)[0] ?? clean;
  const title = sentence.length > 72 ? `${sentence.slice(0, 69).trim()}...` : sentence;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function summarizeDescription(userTexts: string[]): string {
  const joined = userTexts.join("\n\n").trim();
  return joined.length > 1100 ? `${joined.slice(0, 1097).trim()}...` : joined;
}

function inferAffectedArea(text: string): string {
  const appBeforeUrl = text.match(
    /(?:for|in|on)\s+(?:the\s+)?([a-z0-9][a-z0-9\s/&-]{2,64}?)(?:\s+app)?\s+https?:\/\//i
  );

  if (appBeforeUrl?.[1]) {
    return normalizeAffectedArea(appBeforeUrl[1]);
  }

  const namedApp = text.match(
    /(?:for|in|on|the)\s+(?:the\s+)?([a-z0-9][a-z0-9\s/&-]{2,64}\s+app)\b/i
  );

  if (namedApp?.[1]) {
    return normalizeAffectedArea(namedApp[1]);
  }

  const namedCanvasApp = text.match(/([a-z0-9][a-z0-9\s/&-]{2,64}\s+canvas app)/i);

  if (namedCanvasApp?.[1]) {
    return normalizeAffectedArea(namedCanvasApp[1]);
  }

  const found = affectedAreaSignals.find((signal) =>
    text.toLowerCase().includes(signal.toLowerCase())
  );

  if (found) {
    return found;
  }

  const match = text.match(
    /(?:app|application|process|workflow|system|form|report|table)\s+(?:called|named|for)?\s*([a-z0-9][a-z0-9\s/&-]{2,48})/i
  );

  if (match?.[1]) {
    return normalizeAffectedArea(match[1]);
  }

  if (text.toLowerCase().includes("apps.powerapps.com")) {
    return "Power Apps app";
  }

  return "";
}

function inferUsersAffected(text: string): string {
  const sentence = pickSentence(text, [
    "users",
    "team",
    "department",
    "everyone",
    "customers",
    "approvers",
    "requesters",
    "admins"
  ]);

  if (sentence) {
    return sentence;
  }

  return "";
}

function inferDesiredOutcome(text: string, category: RequestCategory): string {
  const outcome = pickSentence(text, [
    "should",
    "want",
    "need",
    "expected",
    "outcome",
    "so that",
    "able to",
    "success"
  ]);

  if (outcome) {
    return outcome;
  }

  if (category === "Bug") {
    return "The affected behavior works consistently without the reported error.";
  }

  return "";
}

function buildAcceptanceCriteria(text: string, category: RequestCategory): string {
  const explicit = pickSentence(text, [
    "done",
    "accepted",
    "acceptance",
    "verify",
    "confirm",
    "success",
    "test"
  ]);

  if (explicit) {
    return explicit;
  }

  if (category === "Bug") {
    return "User can reproduce the original scenario without seeing the reported failure.";
  }

  if (category === "Access") {
    return "The correct user group can access only the intended app, screen, records, or action.";
  }

  if (category === "Reporting") {
    return "Report output matches the requested filters, metrics, and expected refresh timing.";
  }

  return "";
}

function pickSentence(text: string, keywords: string[]): string {
  const sentences = text
    .replace(/\n/g, ". ")
    .split(/(?<=[.!?])\s+|\.\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const found = sentences.find((sentence) => {
    const normalized = sentence.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  });

  return found ?? "";
}

function containsAny(text: string, values: string[]): boolean {
  return values.some((value) => text.includes(value));
}

function applyContextualAnswers(
  messages: IntakeMessage[],
  draft: IntakeDraft
): IntakeDraft {
  const updated = { ...draft };

  messages.forEach((message, index) => {
    if (message.role !== "user") {
      return;
    }

    const answer = message.content.trim();
    const prompt = findPreviousAssistantPrompt(messages, index);

    if (!answer || !prompt) {
      return;
    }

    if (asksForAffectedArea(prompt)) {
      const affectedArea = extractAffectedAreaAnswer(answer);
      if (affectedArea) {
        updated.affectedArea = affectedArea;
      }
    }

    if (asksForCategory(prompt)) {
      const category = inferCategory(answer);
      if (category !== "Uncategorized") {
        updated.category = category;
      }
    }

    if (asksForBusinessImpact(prompt)) {
      updated.businessImpact = normalizeFreeTextAnswer(answer);
    }

    if (asksForDesiredOutcome(prompt)) {
      updated.desiredOutcome = normalizeFreeTextAnswer(answer);
    }

    if (asksForUsersAffected(prompt)) {
      updated.usersAffected = normalizeFreeTextAnswer(answer);
    }

    if (asksForAcceptanceCriteria(prompt)) {
      updated.acceptanceCriteria = normalizeFreeTextAnswer(answer);
    }

    if (asksForDependencies(prompt)) {
      updated.dependencies = normalizeFreeTextAnswer(answer);
    }

    if (asksForConstraints(prompt)) {
      updated.constraints = normalizeFreeTextAnswer(answer);
    }
  });

  return updated;
}

function findPreviousAssistantPrompt(
  messages: IntakeMessage[],
  userMessageIndex: number
): string {
  for (let index = userMessageIndex - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "assistant") {
      return message.content.toLowerCase();
    }
  }

  return "";
}

function asksForAffectedArea(prompt: string): boolean {
  return containsAny(prompt, [
    "which app, process, table, report, or data source is affected",
    "affected app",
    "affected process",
    "affected data source",
    "which app"
  ]);
}

function asksForCategory(prompt: string): boolean {
  return containsAny(prompt, ["what type of request", "bug, enhancement"]);
}

function asksForBusinessImpact(prompt: string): boolean {
  return containsAny(prompt, ["business problem", "business impact"]);
}

function asksForDesiredOutcome(prompt: string): boolean {
  return containsAny(prompt, ["what should be true", "expected outcome"]);
}

function asksForUsersAffected(prompt: string): boolean {
  return containsAny(prompt, ["which users or teams", "who is affected"]);
}

function asksForAcceptanceCriteria(prompt: string): boolean {
  return containsAny(prompt, ["what would you check", "confirm the work is done"]);
}

function asksForDependencies(prompt: string): boolean {
  return containsAny(prompt, [
    "are there dependencies",
    "approvals, integrations",
    "data migrations"
  ]);
}

function asksForConstraints(prompt: string): boolean {
  return containsAny(prompt, ["is there a deadline", "compliance concern", "release window"]);
}

function isStaleQuestion(question: string, draft: IntakeDraft): boolean {
  const normalized = question.toLowerCase();

  if (asksForAffectedArea(normalized) && draft.affectedArea) {
    return true;
  }

  if (asksForCategory(normalized) && draft.category !== "Uncategorized") {
    return true;
  }

  if (asksForBusinessImpact(normalized) && draft.businessImpact) {
    return true;
  }

  if (asksForDesiredOutcome(normalized) && draft.desiredOutcome) {
    return true;
  }

  if (asksForUsersAffected(normalized) && draft.usersAffected) {
    return true;
  }

  if (asksForAcceptanceCriteria(normalized) && draft.acceptanceCriteria) {
    return true;
  }

  if (asksForDependencies(normalized) && draft.dependencies) {
    return true;
  }

  if (asksForConstraints(normalized) && draft.constraints) {
    return true;
  }

  return false;
}

function normalizeQuestion(question: string): string {
  return question.replace(/\s+/g, " ").replace(/[?.!]+$/g, "").trim().toLowerCase();
}

function extractAffectedAreaAnswer(answer: string): string {
  const beforeUrl = answer.split(/https?:\/\//i)[0] ?? answer;
  const appPhrase =
    beforeUrl.match(/(?:this is for|for|in|on)\s+(?:the\s+)?(.+)/i)?.[1] ??
    beforeUrl.match(/(?:the\s+)?([a-z0-9][a-z0-9\s/&-]{2,64}\s+app)\b/i)?.[1] ??
    beforeUrl;

  const normalized = normalizeAffectedArea(appPhrase);

  if (normalized) {
    return normalized;
  }

  if (answer.toLowerCase().includes("apps.powerapps.com")) {
    return "Power Apps app";
  }

  return "";
}

function normalizeAffectedArea(value: string): string {
  const cleaned = value
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/g, "")
    .replace(/^(this is for|for|in|on|the)\s+/i, "")
    .trim();

  if (!cleaned) {
    return "";
  }

  const withoutTrailingNoise = cleaned.replace(
    /\s+(is affected|is the affected app|is the app)$/i,
    ""
  );

  return withoutTrailingNoise.length > 90
    ? `${withoutTrailingNoise.slice(0, 87).trim()}...`
    : withoutTrailingNoise;
}

function normalizeFreeTextAnswer(answer: string): string {
  const cleaned = answer.replace(/\s+/g, " ").trim();
  return cleaned.length > 800 ? `${cleaned.slice(0, 797).trim()}...` : cleaned;
}
