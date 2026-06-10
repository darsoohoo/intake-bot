import { IInputs, IOutputs } from "./generated/ManifestTypes";

type ChatRole = "assistant" | "user" | "system";

interface ChatMessage {
    role: ChatRole;
    content: string;
    createdAt: string;
}

interface CopilotLike {
    executePrompt?: (promptText: string) => Promise<ComponentFramework.MCSResponse[]>;
    executeEvent?: (eventName: string, parameters: Record<string, unknown>) => Promise<ComponentFramework.MCSResponse[]>;
}

interface ModelDrivenContextHints {
    page?: {
        entityId?: string;
        entityTypeName?: string;
    };
    mode?: {
        contextInfo?: {
            entityId?: string;
            entityTypeName?: string;
        };
    };
}

interface SuggestedFields {
    requestTitle?: string;
    description?: string;
    category?: string;
    affectedArea?: string;
    usersAffected?: string;
    businessImpact?: string;
    urgency?: string;
    desiredOutcome?: string;
    constraints?: string;
    dependencies?: string;
    acceptanceCriteria?: string;
    size?: string;
    estimatedEffort?: string;
    estimatedDuration?: string;
    confidence?: number;
    missingRequirements?: string;
    additionalInformation?: string;
}

interface StructuredAgentResponse {
    assistantReply: string;
    fields: SuggestedFields;
}

interface XrmFormAttribute {
    setValue: (value: string | number | null) => void;
    fireOnChange?: () => void;
}

interface XrmFormContext {
    getAttribute: (logicalName: string) => XrmFormAttribute | null;
}

interface XrmPageProvider {
    Page?: XrmFormContext;
}

interface FieldDefinition {
    label: string;
    logicalName: string;
    type: "text" | "choice" | "number";
    choiceMap?: Record<string, number>;
    value: (fields: SuggestedFields) => string | number | undefined;
}

const STARTER_MESSAGE =
    "Tell me what the requester needs. I will help refine this Dataverse intake record without changing fields until you review the suggestions.";
const AGENT_TIMEOUT_MS = 90000;

const CATEGORY_VALUES: Record<string, number> = {
    bug: 100000000,
    enhancement: 100000001,
    automation: 100000002,
    reporting: 100000003,
    access: 100000004,
    integration: 100000005,
    data: 100000006,
    process: 100000007,
    uncategorized: 100000008
};

const URGENCY_VALUES: Record<string, number> = {
    low: 100000000,
    medium: 100000001,
    high: 100000002,
    critical: 100000003
};

const SIZE_VALUES: Record<string, number> = {
    small: 100000000,
    medium: 100000001,
    large: 100000002,
    "extra large": 100000003
};

const FIELD_DEFINITIONS: FieldDefinition[] = [
    { label: "Request title", logicalName: "crb_title", type: "text", value: (fields) => fields.requestTitle },
    { label: "Problem or request", logicalName: "crb_description", type: "text", value: (fields) => fields.description },
    { label: "Business impact", logicalName: "crb_businessimpact", type: "text", value: (fields) => fields.businessImpact },
    { label: "Category", logicalName: "crb_category", type: "choice", choiceMap: CATEGORY_VALUES, value: (fields) => fields.category },
    { label: "Affected area", logicalName: "crb_affectedarea", type: "text", value: (fields) => fields.affectedArea },
    { label: "Users affected", logicalName: "crb_usersaffected", type: "text", value: (fields) => fields.usersAffected },
    { label: "Urgency", logicalName: "crb_urgency", type: "choice", choiceMap: URGENCY_VALUES, value: (fields) => fields.urgency },
    { label: "Desired outcome", logicalName: "crb_desiredoutcome", type: "text", value: (fields) => fields.desiredOutcome },
    { label: "Constraints", logicalName: "crb_constraints", type: "text", value: (fields) => fields.constraints },
    { label: "Dependencies", logicalName: "crb_dependencies", type: "text", value: (fields) => fields.dependencies },
    { label: "Acceptance criteria", logicalName: "crb_acceptancecriteria", type: "text", value: (fields) => fields.acceptanceCriteria },
    { label: "Size", logicalName: "crb_size", type: "choice", choiceMap: SIZE_VALUES, value: (fields) => fields.size },
    { label: "Estimated effort", logicalName: "crb_estimatedeffort", type: "text", value: (fields) => fields.estimatedEffort },
    { label: "Estimated duration", logicalName: "crb_estimatedduration", type: "text", value: (fields) => fields.estimatedDuration },
    { label: "Confidence", logicalName: "crb_confidence", type: "number", value: (fields) => fields.confidence },
    { label: "Missing requirements", logicalName: "crb_missingrequirements", type: "text", value: (fields) => fields.missingRequirements },
    { label: "Additional information", logicalName: "crb_additionalinformation", type: "text", value: (fields) => fields.additionalInformation }
];

export class RequestIntakeAgentChatV8 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container!: HTMLDivElement;
    private notifyOutputChanged!: () => void;
    private context!: ComponentFramework.Context<IInputs>;
    private messages: ChatMessage[] = [];
    private transcriptValue = "";
    private isBusy = false;
    private input!: HTMLTextAreaElement;
    private sendButton!: HTMLButtonElement;
    private transcript!: HTMLDivElement;
    private status!: HTMLDivElement;
    private suggestionPanel!: HTMLDivElement;
    private applyButton!: HTMLButtonElement;
    private applyStatus!: HTMLDivElement;
    private suggestedFields: SuggestedFields = {};
    private appliedOutputs: SuggestedFields = {};

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.context = context;
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.messages = this.parseMessages(context.parameters.conversationJson.raw);
        this.render();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
        const nextRaw = context.parameters.conversationJson.raw ?? "";
        if (!this.transcriptValue && nextRaw) {
            this.messages = this.parseMessages(nextRaw);
        }
        this.paintMessages();
        this.updateBusyState();
    }

    public getOutputs(): IOutputs {
        return {
            conversationJson: this.transcriptValue,
            requestTitle: this.appliedOutputs.requestTitle,
            description: this.appliedOutputs.description,
            businessImpact: this.appliedOutputs.businessImpact,
            affectedArea: this.appliedOutputs.affectedArea,
            desiredOutcome: this.appliedOutputs.desiredOutcome,
            estimatedEffort: this.appliedOutputs.estimatedEffort,
            estimatedDuration: this.appliedOutputs.estimatedDuration,
            missingRequirements: this.appliedOutputs.missingRequirements,
            additionalInformation: this.appliedOutputs.additionalInformation
        };
    }

    public destroy(): void {
        this.container.replaceChildren();
    }

    private render(): void {
        this.container.className = "ri-agent";
        this.container.replaceChildren();

        const header = document.createElement("div");
        header.className = "ri-agent__header";

        const titleBlock = document.createElement("div");
        const eyebrow = document.createElement("div");
        eyebrow.className = "ri-agent__eyebrow";
        eyebrow.textContent = "Copilot Studio";
        const title = document.createElement("div");
        title.className = "ri-agent__title";
        title.textContent = "Intake assistant";
        titleBlock.append(eyebrow, title);

        this.status = document.createElement("div");
        this.status.className = "ri-agent__status";
        header.append(titleBlock, this.status);

        this.transcript = document.createElement("div");
        this.transcript.className = "ri-agent__messages";
        this.transcript.setAttribute("aria-live", "polite");

        const composer = document.createElement("div");
        composer.className = "ri-agent__composer";

        this.input = document.createElement("textarea");
        this.input.className = "ri-agent__input";
        this.input.placeholder = "Reply to the intake agent";
        this.input.rows = 3;
        this.input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void this.sendMessage();
            }
        });

        this.sendButton = document.createElement("button");
        this.sendButton.className = "ri-agent__send";
        this.sendButton.type = "button";
        this.sendButton.textContent = "Send";
        this.sendButton.addEventListener("click", () => {
            void this.sendMessage();
        });

        composer.append(this.input, this.sendButton);
        this.suggestionPanel = document.createElement("div");
        this.suggestionPanel.className = "ri-agent__suggestions";

        this.applyButton = document.createElement("button");
        this.applyButton.className = "ri-agent__apply";
        this.applyButton.type = "button";
        this.applyButton.textContent = "Apply to form";
        this.applyButton.addEventListener("click", () => {
            void this.applySuggestions();
        });

        this.applyStatus = document.createElement("div");
        this.applyStatus.className = "ri-agent__apply-status";

        this.container.append(header, this.transcript, this.suggestionPanel, composer);
        this.paintMessages();
        this.paintSuggestions();
        this.updateBusyState();
    }

    private async sendMessage(): Promise<void> {
        const text = this.input.value.trim();
        if (!text || this.isBusy) {
            return;
        }

        this.addMessage("user", text);
        this.suggestedFields = this.buildFallbackFields();
        this.paintSuggestions();
        this.input.value = "";
        this.isBusy = true;
        this.updateBusyState();

        const thinkingMessage = this.addMessage("assistant", "Agent is thinking...");

        try {
            const response = await this.callAgent(text);
            this.suggestedFields = response.fields;
            thinkingMessage.content = response.assistantReply || "I updated the suggested intake fields.";
            thinkingMessage.createdAt = new Date().toISOString();
            this.paintSuggestions();
        } catch (error) {
            thinkingMessage.content = this.errorMessage(error);
            thinkingMessage.createdAt = new Date().toISOString();
        } finally {
            this.isBusy = false;
            this.persistMessages();
            this.paintMessages();
            this.updateBusyState();
        }
    }

    private async callAgent(lastUserMessage: string): Promise<StructuredAgentResponse> {
        const copilot = this.context.copilot as CopilotLike | undefined;
        if (!copilot?.executePrompt) {
            throw new Error("The model-driven Agent API is not available on this form. Confirm the app has an app assistant agent configured and the preview is enabled.");
        }

        const prompt = this.buildRequesterPrompt(lastUserMessage);
        const responses = await this.withTimeout(copilot.executePrompt(prompt), AGENT_TIMEOUT_MS);
        const responseText = this.extractResponseText(responses);
        const structured = this.parseStructuredResponse(responseText);
        if (!this.hasSuggestedFields(structured.fields)) {
            structured.fields = this.buildFallbackFields();
            structured.assistantReply =
                responseText ||
                "I drafted the initial intake fields from the conversation. Review the suggestions, then apply them to the form.";
        } else {
            structured.fields = this.mergeFallbackFields(structured.fields);
        }

        return structured;
    }

    private buildRequesterPrompt(lastUserMessage: string): string {
        const previousMessages = this.messages
            .filter((message) => message.content !== "Agent is thinking...")
            .slice(0, -1)
            .filter((message) => message.content !== STARTER_MESSAGE)
            .slice(-6)
            .map((message) => `${message.role === "assistant" ? "Agent" : "Requester"}: ${message.content}`)
            .join("\n");
        const recordContext = this.getRecordContext();

        return [
            "Continue this request intake conversation for the Power Platform delivery team.",
            "Assume requests are for Power Apps, Power Automate, Dataverse, Power BI, Copilot Studio, Power Pages, or Microsoft 365 connectors unless the requester explicitly names a different platform.",
            "Do not ask generic tool/service questions when the business need already explains the tool. Assume Microsoft 365 Outlook for email unless the requester names a different service.",
            "Reply naturally, but include labeled intake lines when you know them: Title, Problem/Request, Business Impact, Category, Affected Area, Users Affected, Urgency, Desired Outcome, Constraints, Dependencies, Acceptance Criteria, Size, Estimated Effort, Estimated Duration, Missing Requirements, Additional Information.",
            "Fill Title, Problem/Request, and Business Impact as soon as there is enough information. Keep developer-facing notes high level.",
            `Record table: ${recordContext.entityName}`,
            recordContext.entityId ? `Record id: ${recordContext.entityId}` : "",
            previousMessages ? "" : "",
            previousMessages ? "Prior conversation:" : "",
            previousMessages,
            "",
            `Requester: ${lastUserMessage}`
        ]
            .filter(Boolean)
            .join("\n");
    }

    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutId: number | undefined;
        const timeout = new Promise<never>((_, reject) => {
            timeoutId = window.setTimeout(() => {
                reject(new Error("The app assistant did not respond within 90 seconds. Try sending again or shorten the latest message."));
            }, timeoutMs);
        });

        try {
            return await Promise.race([promise, timeout]);
        } finally {
            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        }
    }

    private getRecordContext(): { entityId: string; entityName: string } {
        const contextHints = this.context as ComponentFramework.Context<IInputs> & ModelDrivenContextHints;
        const page = contextHints.page;
        const contextInfo = contextHints.mode?.contextInfo;

        return {
            entityId: page?.entityId ?? contextInfo?.entityId ?? "",
            entityName: page?.entityTypeName ?? contextInfo?.entityTypeName ?? "crb_intakerequest"
        };
    }

    private extractResponseText(responses: ComponentFramework.MCSResponse[]): string {
        const firstText = responses.find((response) => response.text)?.text;
        if (firstText) {
            return firstText;
        }

        const firstValue = responses.find((response) => response.value !== undefined)?.value;
        if (typeof firstValue === "string") {
            return firstValue;
        }

        if (firstValue) {
            return JSON.stringify(firstValue, null, 2);
        }

        const firstAttachment = responses.flatMap((response) => response.attachments ?? []).find((attachment) => attachment.content);
        if (typeof firstAttachment?.content === "string") {
            return firstAttachment.content;
        }

        if (firstAttachment?.content) {
            return JSON.stringify(firstAttachment.content, null, 2);
        }

        return "";
    }

    private addMessage(role: ChatRole, content: string): ChatMessage {
        const message = {
            role,
            content,
            createdAt: new Date().toISOString()
        };
        this.messages.push(message);
        this.persistMessages();
        this.paintMessages();
        return message;
    }

    private parseStructuredResponse(raw: string): StructuredAgentResponse {
        const parsed = this.parseJsonObject(raw);
        if (parsed) {
            return {
                assistantReply: this.cleanText(parsed.assistantReply) || this.cleanText(parsed.nextQuestion) || "I updated the suggested intake fields.",
                fields: this.normalizeSuggestedFields(parsed.fields ?? parsed.draft ?? parsed)
            };
        }

        return {
            assistantReply: raw,
            fields: this.extractFieldsFromText(raw)
        };
    }

    private parseJsonObject(raw: string): Record<string, unknown> | null {
        const trimmed = raw.trim();
        const candidates = [
            trimmed,
            trimmed.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? "",
            trimmed.match(/\{[\s\S]*\}/)?.[0] ?? ""
        ].filter(Boolean);

        for (const candidate of candidates) {
            try {
                const parsed = JSON.parse(candidate) as unknown;
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return parsed as Record<string, unknown>;
                }
            } catch {
                // Try the next candidate.
            }
        }

        return null;
    }

    private normalizeSuggestedFields(source: unknown): SuggestedFields {
        if (!source || typeof source !== "object") {
            return {};
        }

        const record = source as Record<string, unknown>;
        return {
            requestTitle: this.pickString(record, "requestTitle", "title", "crb_title"),
            description: this.pickString(record, "description", "problemOrRequest", "problem", "request", "crb_description"),
            category: this.pickString(record, "category", "crb_category"),
            affectedArea: this.pickString(record, "affectedArea", "crb_affectedarea"),
            usersAffected: this.pickString(record, "usersAffected", "crb_usersaffected"),
            businessImpact: this.pickString(record, "businessImpact", "crb_businessimpact"),
            urgency: this.pickString(record, "urgency", "crb_urgency"),
            desiredOutcome: this.pickString(record, "desiredOutcome", "crb_desiredoutcome"),
            constraints: this.pickString(record, "constraints", "crb_constraints"),
            dependencies: this.pickString(record, "dependencies", "crb_dependencies"),
            acceptanceCriteria: this.pickString(record, "acceptanceCriteria", "crb_acceptancecriteria"),
            size: this.pickString(record, "size", "crb_size"),
            estimatedEffort: this.pickString(record, "estimatedEffort", "effort", "crb_estimatedeffort"),
            estimatedDuration: this.pickString(record, "estimatedDuration", "timeline", "duration", "crb_estimatedduration"),
            confidence: this.pickNumber(record, "confidence", "crb_confidence"),
            missingRequirements: this.pickString(record, "missingRequirements", "crb_missingrequirements"),
            additionalInformation: this.pickString(record, "additionalInformation", "developerNotes", "notes", "crb_additionalinformation")
        };
    }

    private extractFieldsFromText(text: string): SuggestedFields {
        return {
            requestTitle: this.extractLabeledText(text, ["Title", "Request title"]),
            description: this.extractLabeledText(text, ["Problem/Request", "Problem or request", "Description"]),
            businessImpact: this.extractLabeledText(text, ["Business Impact", "Business impact"]),
            category: this.extractLabeledText(text, ["Category"]),
            affectedArea: this.extractLabeledText(text, ["Affected Area", "Affected area"]),
            usersAffected: this.extractLabeledText(text, ["Users Affected", "Users affected"]),
            desiredOutcome: this.extractLabeledText(text, ["Desired Outcome", "Desired outcome"]),
            constraints: this.extractLabeledText(text, ["Constraints"]),
            dependencies: this.extractLabeledText(text, ["Dependencies"]),
            acceptanceCriteria: this.extractLabeledText(text, ["Acceptance Criteria", "Acceptance criteria"]),
            estimatedEffort: this.extractLabeledText(text, ["Estimated Effort", "Estimated effort"]),
            estimatedDuration: this.extractLabeledText(text, ["Likely Timeline", "Estimated Duration", "Estimated duration"]),
            additionalInformation: this.extractLabeledText(text, ["Additional Developer Notes", "Developer Notes", "Additional information"])
        };
    }

    private hasSuggestedFields(fields: SuggestedFields): boolean {
        return FIELD_DEFINITIONS.some((definition) => {
            const value = definition.value(fields);
            return value !== undefined && String(value).trim() !== "";
        });
    }

    private buildFallbackFields(): SuggestedFields {
        const userMessages = this.messages
            .filter((message) => message.role === "user")
            .map((message) => message.content.trim())
            .filter(Boolean);
        const combined = userMessages.join("\n");
        const latest = userMessages[userMessages.length - 1] ?? "";
        const source = combined || latest;
        const lower = source.toLowerCase();

        if (!source) {
            return {};
        }

        return {
            requestTitle: this.fallbackTitle(source),
            description: source,
            businessImpact: this.fallbackBusinessImpact(source),
            category: this.fallbackCategory(lower),
            affectedArea: this.fallbackAffectedArea(lower),
            urgency: this.fallbackUrgency(lower),
            desiredOutcome: this.fallbackDesiredOutcome(source),
            size: this.fallbackSize(lower),
            estimatedEffort: this.fallbackEffort(lower),
            estimatedDuration: this.fallbackDuration(lower),
            confidence: 70,
            missingRequirements: "Review detailed requirements, owners, triggers, data sources, permissions, and acceptance criteria during implementation intake.",
            additionalInformation: "Generated from the conversation because the model-driven app assistant did not return structured field text."
        };
    }

    private fallbackTitle(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes("power automate") && lower.includes("email") && lower.includes("submitted")) {
            return "Notify intake owner when request is submitted";
        }

        if (lower.includes("print") && lower.includes("pdf")) {
            return "Add Print to PDF feature";
        }

        if (lower.includes("mileage") || lower.includes("reimburs")) {
            return "Automate travel reimbursement documentation";
        }

        const firstLine = text.split(/\r?\n/).find(Boolean) ?? text;
        return firstLine
            .replace(/^(we|i)\s+need\s+(to\s+)?/i, "")
            .replace(/^a\s+solution\s+that\s+/i, "")
            .trim()
            .slice(0, 90);
    }

    private fallbackBusinessImpact(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes("streamline") || lower.includes("reduce") || lower.includes("improve")) {
            return text;
        }

        if (lower.includes("submitted") && lower.includes("email")) {
            return "Improves intake responsiveness by notifying the owner immediately when a request is submitted, reducing manual monitoring and follow-up delays.";
        }

        if (lower.includes("reimburs") || lower.includes("mileage")) {
            return "Reduces time spent assembling reimbursement documentation and improves consistency for mileage record keeping.";
        }

        return "Reduces manual coordination, improves request visibility, and helps the Power Platform team triage the work more efficiently.";
    }

    private fallbackCategory(lowerText: string): string {
        if (lowerText.includes("bug") || lowerText.includes("error") || lowerText.includes("fail")) {
            return "Bug";
        }

        if (lowerText.includes("report") || lowerText.includes("power bi")) {
            return "Reporting";
        }

        if (lowerText.includes("flow") || lowerText.includes("automate") || lowerText.includes("email")) {
            return "Automation";
        }

        if (lowerText.includes("app") || lowerText.includes("feature") || lowerText.includes("enhance")) {
            return "Enhancement";
        }

        return "Process";
    }

    private fallbackAffectedArea(lowerText: string): string {
        if (lowerText.includes("power automate") || lowerText.includes("flow")) {
            return "Power Automate";
        }

        if (lowerText.includes("power bi")) {
            return "Power BI";
        }

        if (lowerText.includes("powerapps") || lowerText.includes("power apps") || lowerText.includes("canvas app")) {
            return "Power Apps";
        }

        if (lowerText.includes("dataverse")) {
            return "Dataverse";
        }

        return "Power Platform";
    }

    private fallbackUrgency(lowerText: string): string {
        if (lowerText.includes("critical") || lowerText.includes("blocked") || lowerText.includes("cannot")) {
            return "Critical";
        }

        if (lowerText.includes("today") || lowerText.includes("urgent")) {
            return "High";
        }

        return "Medium";
    }

    private fallbackDesiredOutcome(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes("email") && lower.includes("submitted")) {
            return "A Power Automate flow sends an Outlook email notification to the intake owner whenever a request is submitted.";
        }

        return `A Power Platform solution that addresses the request: ${text}`;
    }

    private fallbackSize(lowerText: string): string {
        if (lowerText.includes("integration") || lowerText.includes("merge") || lowerText.includes("multiple")) {
            return "Large";
        }

        if (lowerText.includes("flow") || lowerText.includes("email")) {
            return "Small";
        }

        return "Medium";
    }

    private fallbackEffort(lowerText: string): string {
        if (lowerText.includes("flow") && lowerText.includes("email")) {
            return "1-3 days";
        }

        if (lowerText.includes("merge") || lowerText.includes("integration")) {
            return "5-10 days";
        }

        return "3-5 days";
    }

    private fallbackDuration(lowerText: string): string {
        if (lowerText.includes("flow") && lowerText.includes("email")) {
            return "This sprint";
        }

        return "1-2 sprints";
    }

    private extractLabeledText(text: string, labels: string[]): string | undefined {
        for (const label of labels) {
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?\\s*[:\\-]\\s*([^\\n]+)`, "i"));
            if (match?.[1]) {
                return this.cleanText(match[1]);
            }
        }

        return undefined;
    }

    private pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
        for (const key of keys) {
            const value = record[key];
            if (typeof value === "string") {
                return this.cleanText(value);
            }

            if (Array.isArray(value)) {
                const joined = value.map((item) => this.cleanText(item)).filter(Boolean).join("\n");
                if (joined) {
                    return joined;
                }
            }
        }

        return undefined;
    }

    private pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
        for (const key of keys) {
            const value = record[key];
            if (typeof value === "number" && Number.isFinite(value)) {
                return value;
            }

            if (typeof value === "string") {
                const parsed = Number.parseInt(value, 10);
                if (Number.isFinite(parsed)) {
                    return parsed;
                }
            }
        }

        return undefined;
    }

    private mergeFallbackFields(fields: SuggestedFields): SuggestedFields {
        const fallback = this.buildFallbackFields();
        const merged = { ...fallback, ...fields };

        if (!this.choiceValue(merged.category ?? "", CATEGORY_VALUES)) {
            merged.category = fallback.category;
        }

        if (!this.choiceValue(merged.urgency ?? "", URGENCY_VALUES)) {
            merged.urgency = fallback.urgency;
        }

        if (!this.choiceValue(merged.size ?? "", SIZE_VALUES)) {
            merged.size = fallback.size;
        }

        return merged;
    }

    private cleanText(value: unknown): string {
        if (typeof value !== "string") {
            return "";
        }

        return value
            .trim()
            .replace(/^[\s*_\-:]+/, "")
            .replace(/[\s*_]+$/, "")
            .replace(/^["']|["']$/g, "")
            .trim();
    }

    private parseMessages(raw: string | null): ChatMessage[] {
        if (!raw) {
            return [{ role: "assistant", content: STARTER_MESSAGE, createdAt: new Date().toISOString() }];
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            if (Array.isArray(parsed)) {
                const messages = parsed
                    .map((item) => this.normalizeMessage(item))
                    .filter((item): item is ChatMessage => item !== null);
                return messages.length ? messages : [{ role: "assistant", content: STARTER_MESSAGE, createdAt: new Date().toISOString() }];
            }
        } catch {
            return [
                { role: "assistant", content: STARTER_MESSAGE, createdAt: new Date().toISOString() },
                { role: "system", content: raw, createdAt: new Date().toISOString() }
            ];
        }

        return [{ role: "assistant", content: STARTER_MESSAGE, createdAt: new Date().toISOString() }];
    }

    private normalizeMessage(item: unknown): ChatMessage | null {
        if (!item || typeof item !== "object") {
            return null;
        }

        const candidate = item as Record<string, unknown>;
        const content = typeof candidate.content === "string" ? candidate.content : "";
        const role = candidate.role === "user" || candidate.role === "assistant" || candidate.role === "system" ? candidate.role : "assistant";
        const createdAt = typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString();

        return content ? { role, content, createdAt } : null;
    }

    private persistMessages(): void {
        this.transcriptValue = JSON.stringify(this.messages);
        this.notifyOutputChanged();
    }

    private paintMessages(): void {
        if (!this.transcript) {
            return;
        }

        this.transcript.replaceChildren();
        this.messages.forEach((message) => {
            const row = document.createElement("div");
            row.className = `ri-agent__message ri-agent__message--${message.role}`;

            const label = document.createElement("div");
            label.className = "ri-agent__message-label";
            label.textContent = message.role === "user" ? "You" : message.role === "system" ? "Context" : "Agent";

            const body = document.createElement("div");
            body.className = "ri-agent__message-body";
            body.textContent = message.content;

            row.append(label, body);
            this.transcript.append(row);
        });
        this.transcript.scrollTop = this.transcript.scrollHeight;
    }

    private paintSuggestions(): void {
        if (!this.suggestionPanel) {
            return;
        }

        this.suggestionPanel.replaceChildren();
        const populatedFields = FIELD_DEFINITIONS.map((definition) => ({
            definition,
            value: definition.value(this.suggestedFields)
        })).filter((item) => item.value !== undefined && String(item.value).trim() !== "");

        if (!populatedFields.length) {
            this.applyButton.disabled = true;
            this.applyStatus.textContent = "";
            return;
        }

        const header = document.createElement("div");
        header.className = "ri-agent__suggestions-header";
        const title = document.createElement("div");
        title.className = "ri-agent__suggestions-title";
        title.textContent = "Suggested fields";
        const hint = document.createElement("div");
        hint.className = "ri-agent__suggestions-hint";
        hint.textContent = "Review, then apply to the Dataverse form.";
        header.append(title, hint);

        const list = document.createElement("div");
        list.className = "ri-agent__suggestions-list";
        populatedFields.slice(0, 8).forEach(({ definition, value }) => {
            const row = document.createElement("div");
            row.className = "ri-agent__suggestion";

            const label = document.createElement("div");
            label.className = "ri-agent__suggestion-label";
            label.textContent = definition.label;

            const body = document.createElement("div");
            body.className = "ri-agent__suggestion-value";
            body.textContent = String(value);

            row.append(label, body);
            list.append(row);
        });

        const actions = document.createElement("div");
        actions.className = "ri-agent__suggestions-actions";
        this.applyButton.disabled = false;
        actions.append(this.applyButton, this.applyStatus);
        this.suggestionPanel.append(header, list, actions);
    }

    private async applySuggestions(): Promise<void> {
        const payload = this.buildDataversePayload();
        const fieldCount = Object.keys(payload).length;
        if (!fieldCount) {
            this.applyStatus.textContent = "No suggested fields to apply.";
            return;
        }

        this.appliedOutputs = {
            requestTitle: this.suggestedFields.requestTitle,
            description: this.suggestedFields.description,
            businessImpact: this.suggestedFields.businessImpact,
            affectedArea: this.suggestedFields.affectedArea,
            desiredOutcome: this.suggestedFields.desiredOutcome,
            estimatedEffort: this.suggestedFields.estimatedEffort,
            estimatedDuration: this.suggestedFields.estimatedDuration,
            missingRequirements: this.suggestedFields.missingRequirements,
            additionalInformation: this.suggestedFields.additionalInformation
        };
        this.notifyOutputChanged();

        const formContext = this.getFormContext();
        if (formContext) {
            const applied = this.applyToOpenForm(formContext, payload);
            this.applyStatus.textContent = applied
                ? `Applied ${applied} visible field${applied === 1 ? "" : "s"} and sent bound field outputs to the form.`
                : "Sent bound field outputs to the form.";
            return;
        }

        const recordContext = this.getRecordContext();
        if (recordContext.entityId) {
            await this.context.webAPI.updateRecord(recordContext.entityName, recordContext.entityId, payload);
            this.applyStatus.textContent = `Updated ${fieldCount} field${fieldCount === 1 ? "" : "s"} on the saved record.`;
            return;
        }

        this.applyStatus.textContent = "Open-form field access is unavailable. Save the record first, then apply again.";
    }

    private buildDataversePayload(): Record<string, string | number> {
        const payload: Record<string, string | number> = {};

        FIELD_DEFINITIONS.forEach((definition) => {
            const rawValue = definition.value(this.suggestedFields);
            if (rawValue === undefined || String(rawValue).trim() === "") {
                return;
            }

            if (definition.type === "choice") {
                const option = this.choiceValue(rawValue, definition.choiceMap ?? {});
                if (option !== undefined) {
                    payload[definition.logicalName] = option;
                }
                return;
            }

            if (definition.type === "number") {
                const parsed = typeof rawValue === "number" ? rawValue : Number.parseInt(String(rawValue), 10);
                if (Number.isFinite(parsed)) {
                    payload[definition.logicalName] = Math.max(0, Math.min(100, parsed));
                }
                return;
            }

            payload[definition.logicalName] = String(rawValue).trim();
        });

        return payload;
    }

    private choiceValue(value: string | number, choiceMap: Record<string, number>): number | undefined {
        if (typeof value === "number") {
            return value;
        }

        const normalized = this.cleanText(value).toLowerCase();
        return choiceMap[normalized];
    }

    private applyToOpenForm(formContext: XrmFormContext, payload: Record<string, string | number>): number {
        let applied = 0;
        Object.entries(payload).forEach(([logicalName, value]) => {
            const attribute = formContext.getAttribute(logicalName);
            if (!attribute) {
                return;
            }

            attribute.setValue(value);
            attribute.fireOnChange?.();
            applied += 1;
        });
        return applied;
    }

    private getFormContext(): XrmFormContext | null {
        const windows = [globalThis.window, globalThis.window?.parent, globalThis.window?.top].filter(Boolean) as Window[];
        for (const candidateWindow of windows) {
            try {
                const page = (candidateWindow as Window & { Xrm?: XrmPageProvider }).Xrm?.Page;
                if (page?.getAttribute) {
                    return page;
                }
            } catch {
                // Cross-frame access is not guaranteed in every host shell.
            }
        }

        const contextualPage = (this.context as unknown as { page?: XrmFormContext }).page;
        return contextualPage?.getAttribute ? contextualPage : null;
    }

    private updateBusyState(): void {
        if (this.sendButton) {
            this.sendButton.disabled = this.isBusy;
            this.sendButton.textContent = this.isBusy ? "Sending..." : "Send";
        }

        if (this.input) {
            this.input.disabled = this.isBusy;
            this.input.placeholder = this.isBusy ? "Waiting for the agent..." : "Reply to the intake agent";
        }

        if (this.status) {
            const hasCopilot = Boolean((this.context.copilot as CopilotLike | undefined)?.executePrompt);
            this.status.textContent = this.isBusy ? "Working" : hasCopilot ? "Ready" : "Needs app agent";
            this.status.dataset.state = this.isBusy ? "busy" : hasCopilot ? "ready" : "warning";
        }
    }

    private errorMessage(error: unknown): string {
        const detail = error instanceof Error ? error.message : "Unknown error.";
        return `I could not reach the model-driven app agent. ${detail}`;
    }
}
