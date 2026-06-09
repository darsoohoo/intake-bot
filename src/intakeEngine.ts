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
    "manual",
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
  const derived: IntakeDraft = {
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
      "can't"
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
  };

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
  const namedCanvasApp = text.match(/([a-z0-9][a-z0-9\s/&-]{2,64}\s+canvas app)/i);

  if (namedCanvasApp?.[1]) {
    return namedCanvasApp[1].trim();
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

  return match?.[1]?.trim() ?? "";
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
