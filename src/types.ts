export type Role = "assistant" | "user";

export type IntakeMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
};

export type RequestCategory =
  | "Bug"
  | "Enhancement"
  | "Automation"
  | "Reporting"
  | "Access"
  | "Integration"
  | "Data"
  | "Process"
  | "Uncategorized";

export type Urgency = "Low" | "Medium" | "High" | "Critical";

export type RequestSize = "Small" | "Medium" | "Large" | "Extra Large";

export type IntakeDraft = {
  title: string;
  description: string;
  category: RequestCategory;
  affectedArea: string;
  usersAffected: string;
  businessImpact: string;
  urgency: Urgency;
  desiredOutcome: string;
  constraints: string;
  dependencies: string;
  acceptanceCriteria: string;
  size: RequestSize;
  estimatedEffort: string;
  estimatedDuration: string;
  confidence: number;
  missingRequirements: string[];
  additionalInformation: string;
};

export type Readiness = {
  score: number;
  label: string;
  tone: "blocked" | "draft" | "ready";
};

