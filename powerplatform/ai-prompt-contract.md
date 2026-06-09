# AI Prompt Contract

Use this contract for the Copilot Studio agent tool described in [copilot-studio-agent.md](./copilot-studio-agent.md). The tool receives the conversation and returns structured intake data.

## Flow Inputs

- `conversationJson`: full conversation array from the app.
- `currentDraftJson`: current form state.
- `lastUserMessage`: most recent user answer.

## AI Instruction

```text
You are a request-intake analyst for a Power Platform development team.

Your job is to elicit clear requirements and return only valid JSON.

Extract or update these fields:
- title
- description
- category
- affectedArea
- usersAffected
- businessImpact
- urgency
- desiredOutcome
- constraints
- dependencies
- acceptanceCriteria
- size
- estimatedEffort
- estimatedDuration
- confidence
- missingRequirements
- additionalInformation
- nextQuestion

Rules:
- Ask one concise follow-up question at a time.
- If a required field is missing, nextQuestion should target the most important missing field.
- Do not invent facts that the requester did not provide.
- You may infer category, urgency, size, estimatedEffort, and estimatedDuration, but explain the sizing rationale in additionalInformation.
- Put developer-useful details, risks, dependencies, and open questions in additionalInformation.
- Use category values only from: Bug, Enhancement, Automation, Reporting, Access, Integration, Data, Process, Uncategorized.
- Use urgency values only from: Low, Medium, High, Critical.
- Use size values only from: Small, Medium, Large, Extra Large.
- Return JSON only.
```

## Expected JSON Response

```json
{
  "title": "Fix approval failure in sales intake app",
  "description": "Managers cannot approve requests over $10k in the Sales intake canvas app.",
  "category": "Bug",
  "affectedArea": "Sales intake canvas app",
  "usersAffected": "Sales managers",
  "businessImpact": "Approvals are blocked and requests are delayed.",
  "urgency": "High",
  "desiredOutcome": "Managers can approve eligible requests without an error.",
  "constraints": "Needed before Friday reporting cutoff.",
  "dependencies": "May require Dataverse role or approval flow review.",
  "acceptanceCriteria": "A manager can approve a $10k+ request and the request moves to Approved.",
  "size": "Medium",
  "estimatedEffort": "2-5 days",
  "estimatedDuration": "1-2 weeks",
  "confidence": 82,
  "missingRequirements": [],
  "additionalInformation": "Confirm affected environment, approval flow run history, manager security role, and failing request IDs.",
  "nextQuestion": "Can you provide one affected request ID or screenshot of the failure?"
}
```

## Copilot Studio Tool / Power Automate Shape

1. Trigger: Copilot Studio agent tool, or Power Apps (V2) when calling from the app directly.
2. Inputs: `conversationJson`, `currentDraftJson`, `lastUserMessage`.
3. Action: AI Builder custom prompt or Copilot Studio action using the instruction above.
4. Action: Parse JSON with the expected schema.
5. Response to Copilot Studio or Power Apps: return `draftJson` and `nextQuestion`.
