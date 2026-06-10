import { IntakeCopilot_CanvasRunService } from "./generated";
import type { IntakeDraft, IntakeMessage, RequestCategory, RequestSize, Urgency } from "./types";

type AgentDraftUpdate = Partial<IntakeDraft>;

export type IntakeAgentResult = {
  draft: AgentDraftUpdate;
  nextQuestion?: string;
};

const categoryValues: RequestCategory[] = [
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

const urgencyValues: Urgency[] = ["Low", "Medium", "High", "Critical"];
const sizeValues: RequestSize[] = ["Small", "Medium", "Large", "Extra Large"];

export async function runIntakeAgentFlow(options: {
  lastUserMessage: string;
  currentDraft: IntakeDraft;
  messages: IntakeMessage[];
}): Promise<IntakeAgentResult> {
  const result = await IntakeCopilot_CanvasRunService.Run({
    text: options.lastUserMessage,
    text_1: JSON.stringify(options.currentDraft),
    text_2: JSON.stringify(toConversationPayload(options.messages))
  });

  if (!result.success) {
    throw new Error(result.error?.message ?? "The intake agent flow call failed.");
  }

  const response = result.data?.response;

  if (!response) {
    throw new Error("The intake agent flow did not return a response.");
  }

  return parseIntakeAgentResponse(response);
}

export function parseIntakeAgentResponse(response: string): IntakeAgentResult {
  const parsed = JSON.parse(extractJson(response)) as Record<string, unknown>;
  const draft: AgentDraftUpdate = {};

  assignString(draft, "title", parsed.title);
  assignString(draft, "description", parsed.description);
  assignString(draft, "affectedArea", parsed.affectedArea);
  assignString(draft, "usersAffected", parsed.usersAffected);
  assignString(draft, "businessImpact", parsed.businessImpact);
  assignString(draft, "desiredOutcome", parsed.desiredOutcome);
  assignString(draft, "constraints", parsed.constraints);
  assignString(draft, "dependencies", parsed.dependencies);
  assignString(draft, "acceptanceCriteria", parsed.acceptanceCriteria);
  assignString(draft, "estimatedEffort", parsed.estimatedEffort);
  assignString(draft, "estimatedDuration", parsed.estimatedDuration);
  assignString(draft, "additionalInformation", parsed.additionalInformation);

  const category = getEnumValue(parsed.category, categoryValues);
  if (category) {
    draft.category = category;
  }

  const urgency = getEnumValue(parsed.urgency, urgencyValues);
  if (urgency) {
    draft.urgency = urgency;
  }

  const size = getEnumValue(parsed.size, sizeValues);
  if (size) {
    draft.size = size;
  }

  const confidence = toNumber(parsed.confidence);
  if (confidence !== undefined) {
    draft.confidence = confidence;
  }

  const missingRequirements = toStringArray(parsed.missingRequirements);
  if (missingRequirements) {
    draft.missingRequirements = missingRequirements;
  }

  return {
    draft,
    nextQuestion: toNonEmptyString(parsed.nextQuestion)
  };
}

function toConversationPayload(messages: IntakeMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    createdAt: message.createdAt
  }));
}

function extractJson(response: string): string {
  const trimmed = response.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function assignString<T extends keyof IntakeDraft>(
  draft: AgentDraftUpdate,
  field: T,
  value: unknown
): void {
  const text = toNonEmptyString(value);
  if (text) {
    draft[field] = text as IntakeDraft[T];
  }
}

function getEnumValue<T extends string>(value: unknown, allowedValues: T[]): T | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return allowedValues.find((allowedValue) => allowedValue.toLowerCase() === normalized);
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}
