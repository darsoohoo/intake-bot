import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileJson,
  Gauge,
  Layers3,
  MessageSquarePlus,
  Save,
  Send,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import "./App.css";
import {
  analyzeMessages,
  categoryOptions,
  createMessage,
  estimateForSize,
  finalizeDraft,
  getNextQuestion,
  getReadiness,
  sizeOptions,
  toPowerPlatformPayload,
  urgencyOptions
} from "./intakeEngine";
import type { IntakeDraft, IntakeMessage, RequestCategory, RequestSize, Urgency } from "./types";

const firstQuestion =
  "Tell me what the user wants to request. I will ask follow-up questions and fill the intake fields as we go.";

function App() {
  const [messages, setMessages] = useState<IntakeMessage[]>([
    createMessage("assistant", firstQuestion)
  ]);
  const [input, setInput] = useState("");
  const [overrides, setOverrides] = useState<Partial<IntakeDraft>>({});
  const [submitState, setSubmitState] = useState("Draft not saved");

  const inferredDraft = useMemo(() => analyzeMessages(messages), [messages]);
  const hasEstimateOverride =
    overrides.size !== undefined ||
    overrides.estimatedEffort !== undefined ||
    overrides.estimatedDuration !== undefined;
  const draft = useMemo(
    () => finalizeDraft({ ...inferredDraft, ...overrides }, { preserveEstimate: hasEstimateOverride }),
    [hasEstimateOverride, inferredDraft, overrides]
  );
  const readiness = useMemo(() => getReadiness(draft), [draft]);
  const draftPayload = useMemo(
    () => toPowerPlatformPayload(draft, { messages, status: "Draft" }),
    [draft, messages]
  );
  const submittedPayload = useMemo(
    () => toPowerPlatformPayload(draft, { messages, status: "Submitted" }),
    [draft, messages]
  );

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    const nextDraft = finalizeDraft({
      ...analyzeMessages(nextMessages),
      ...overrides
    }, { preserveEstimate: hasEstimateOverride });
    const assistantMessage = createMessage("assistant", getNextQuestion(nextDraft));

    setMessages([...nextMessages, assistantMessage]);
    setInput("");
    setSubmitState("Conversation updated");
  };

  const addFollowUp = () => {
    setMessages((current) => [...current, createMessage("assistant", getNextQuestion(draft))]);
  };

  const updateField = <K extends keyof IntakeDraft>(field: K, value: IntakeDraft[K]) => {
    if (field === "size") {
      setOverrides((current) => ({
        ...current,
        ...estimateForSize(value as RequestSize)
      }));
    } else {
      setOverrides((current) => ({ ...current, [field]: value }));
    }

    setSubmitState("Manual edit captured");
  };

  const saveDraft = () => {
    localStorage.setItem(
      "request-intake-copilot:draft",
      JSON.stringify({ payload: draftPayload, draft, messages, savedAt: new Date().toISOString() }, null, 2)
    );
    setSubmitState("Draft saved locally");
  };

  const submitDraft = () => {
    const key = `request-intake-copilot:submission:${Date.now()}`;
    localStorage.setItem(
      key,
      JSON.stringify({ payload: submittedPayload, draft, messages, submittedAt: new Date().toISOString() }, null, 2)
    );
    setSubmitState(readiness.tone === "ready" ? "Submission staged" : "Submission staged with gaps");
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(draftPayload, null, 2));
    setSubmitState("Payload copied");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Request Intake Copilot</h1>
          <p>Power Platform delivery intake</p>
        </div>
        <div className={`readiness readiness-${readiness.tone}`}>
          {readiness.tone === "ready" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{readiness.label}</span>
          <strong>{readiness.score}%</strong>
        </div>
      </header>

      <section className="workspace">
        <section className="panel conversation-panel" aria-label="Agent conversation">
          <div className="panel-heading">
            <div>
              <span className="section-label">Copilot</span>
              <h2>Guided intake</h2>
            </div>
            <button className="icon-button" type="button" onClick={addFollowUp} title="Ask next question">
              <MessageSquarePlus size={18} />
            </button>
          </div>

          <div className="messages">
            {messages.map((message) => (
              <article className={`message message-${message.role}`} key={message.id}>
                <div className="avatar" aria-hidden="true">
                  {message.role === "assistant" ? <Bot size={16} /> : <Sparkles size={16} />}
                </div>
                <p>{message.content}</p>
              </article>
            ))}
          </div>

          <div className="composer">
            <textarea
              aria-label="Reply to intake copilot"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  sendMessage();
                }
              }}
              placeholder="Example: The Sales intake canvas app fails when managers approve requests over $10k..."
            />
            <button className="primary-button" type="button" onClick={sendMessage}>
              <Send size={17} />
              Send
            </button>
          </div>
        </section>

        <section className="panel form-panel" aria-label="Auto-filled request form">
          <div className="panel-heading">
            <div>
              <span className="section-label">Request form</span>
              <h2>Auto-filled fields</h2>
            </div>
            <span className="status-text">{submitState}</span>
          </div>

          <div className="metrics-grid">
            <Metric icon={<Layers3 size={18} />} label="Size" value={draft.size} />
            <Metric icon={<Gauge size={18} />} label="Effort" value={draft.estimatedEffort} />
            <Metric icon={<Clock3 size={18} />} label="Duration" value={draft.estimatedDuration} />
            <Metric icon={<ClipboardCheck size={18} />} label="Missing" value={String(draft.missingRequirements.length)} />
          </div>

          <div className="form-grid">
            <Field label="Request title" required>
              <input
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </Field>

            <Field label="Category" required>
              <select
                value={draft.category}
                onChange={(event) =>
                  updateField("category", event.target.value as RequestCategory)
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Affected app or process" required>
              <input
                value={draft.affectedArea}
                onChange={(event) => updateField("affectedArea", event.target.value)}
              />
            </Field>

            <Field label="Urgency" required>
              <select
                value={draft.urgency}
                onChange={(event) => updateField("urgency", event.target.value as Urgency)}
              >
                {urgencyOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Problem or request" required wide>
              <textarea
                value={draft.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </Field>

            <Field label="Business impact" required wide>
              <textarea
                value={draft.businessImpact}
                onChange={(event) => updateField("businessImpact", event.target.value)}
              />
            </Field>

            <Field label="Expected outcome" required wide>
              <textarea
                value={draft.desiredOutcome}
                onChange={(event) => updateField("desiredOutcome", event.target.value)}
              />
            </Field>

            <Field label="Users affected">
              <input
                value={draft.usersAffected}
                onChange={(event) => updateField("usersAffected", event.target.value)}
              />
            </Field>

            <Field label="Request size">
              <select
                value={draft.size}
                onChange={(event) => updateField("size", event.target.value as RequestSize)}
              >
                {sizeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Constraints or deadline" wide>
              <textarea
                value={draft.constraints}
                onChange={(event) => updateField("constraints", event.target.value)}
              />
            </Field>

            <Field label="Dependencies" wide>
              <textarea
                value={draft.dependencies}
                onChange={(event) => updateField("dependencies", event.target.value)}
              />
            </Field>

            <Field label="Acceptance criteria" wide>
              <textarea
                value={draft.acceptanceCriteria}
                onChange={(event) => updateField("acceptanceCriteria", event.target.value)}
              />
            </Field>

            <Field label="Additional information for developers" wide>
              <textarea
                className="developer-notes"
                value={draft.additionalInformation}
                onChange={(event) => updateField("additionalInformation", event.target.value)}
              />
            </Field>
          </div>

          {draft.missingRequirements.length > 0 && (
            <div className="missing-block">
              <strong>Missing requirements</strong>
              <span>{draft.missingRequirements.join(", ")}</span>
            </div>
          )}

          <div className="action-bar">
            <button className="secondary-button" type="button" onClick={saveDraft}>
              <Save size={17} />
              Save draft
            </button>
            <button className="secondary-button" type="button" onClick={copyPayload}>
              <FileJson size={17} />
              Copy JSON
            </button>
            <button className="primary-button" type="button" onClick={submitDraft}>
              <ClipboardCheck size={17} />
              Submit request
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

type FieldProps = {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  wide?: boolean;
};

function Field({ children, label, required = false, wide = false }: FieldProps) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span>
        {label}
        {required ? <em>Required</em> : null}
      </span>
      {children}
    </label>
  );
}

function Metric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
