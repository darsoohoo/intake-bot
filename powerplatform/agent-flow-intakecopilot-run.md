# Agent Flow: IntakeCopilot_Run

Create this as an agent flow/tool in Copilot Studio for the `Request Intake Copilot` agent.

## Current SPDEV-Dev2 Implementation

Status: created, published, smoke-tested, and attached to `Request Intake Copilot`.

| Item | Value |
| --- | --- |
| Environment | `SPDEV-Dev2` |
| Workflow name | `IntakeCopilot_Run` |
| Workflow ID | `179221c2-9463-f111-ab0c-7c1e521c7ea3` |
| Solution | `WorkManagementAgent` |
| Trigger type | Manual/on-demand workflow in Copilot Studio Workflows |
| Action | `M365 Copilot (V2)` / `Chat Copilot` |
| Connection | `darsoohoo@spdevdarren.onmicrosoft.com` |
| Prefer Async | Off |
| Runtime output | M365 Copilot `Response` text containing the JSON draft |

Smoke-test result from Copilot Studio workflow test succeeded in 14 seconds and returned valid JSON for:

```text
Finance cannot export the Power BI report today. It fails with an error and blocks month-end review.
```

The returned draft classified the request as a `Bug`, identified `Power BI report export` as the affected area, marked urgency as `Critical`, and asked for the exact error message.

## Flow Name

`IntakeCopilot_Run`

## Trigger

Use `When an agent calls the flow`.

Inputs:

| Name | Type | Description |
| --- | --- | --- |
| `conversationJson` | Text | Full conversation history as compact JSON. |
| `currentDraftJson` | Text | Current request draft as compact JSON. |
| `lastUserMessage` | Text | Latest user message. |

## Prompt Action

Use either an AI Builder prompt action or a Copilot Studio generative action.

Prompt:

```text
You are a request-intake analyst for a Power Platform development team.

Return only valid JSON. Do not wrap it in markdown.

Conversation JSON:
{conversationJson}

Current draft JSON:
{currentDraftJson}

Latest user message:
{lastUserMessage}

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
- confidence must be a whole number from 0 to 100.
- missingRequirements must be an array of strings.
- Return JSON only.
```

## Parse JSON Schema

Use this schema in the Parse JSON action:

```json
{
  "type": "object",
  "required": [
    "title",
    "description",
    "category",
    "affectedArea",
    "usersAffected",
    "businessImpact",
    "urgency",
    "desiredOutcome",
    "constraints",
    "dependencies",
    "acceptanceCriteria",
    "size",
    "estimatedEffort",
    "estimatedDuration",
    "confidence",
    "missingRequirements",
    "additionalInformation",
    "nextQuestion"
  ],
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["Bug", "Enhancement", "Automation", "Reporting", "Access", "Integration", "Data", "Process", "Uncategorized"]
    },
    "affectedArea": { "type": "string" },
    "usersAffected": { "type": "string" },
    "businessImpact": { "type": "string" },
    "urgency": {
      "type": "string",
      "enum": ["Low", "Medium", "High", "Critical"]
    },
    "desiredOutcome": { "type": "string" },
    "constraints": { "type": "string" },
    "dependencies": { "type": "string" },
    "acceptanceCriteria": { "type": "string" },
    "size": {
      "type": "string",
      "enum": ["Small", "Medium", "Large", "Extra Large"]
    },
    "estimatedEffort": { "type": "string" },
    "estimatedDuration": { "type": "string" },
    "confidence": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "missingRequirements": {
      "type": "array",
      "items": { "type": "string" }
    },
    "additionalInformation": { "type": "string" },
    "nextQuestion": { "type": "string" }
  }
}
```

## Response

Classic Power Automate agent flows should use `Respond to the agent`.

Outputs:

| Name | Type | Value |
| --- | --- | --- |
| `draftJson` | Text | String version of the parsed JSON object. |
| `nextQuestion` | Text | `nextQuestion` from the parsed JSON. |

The current Copilot Studio Workflows implementation returns the JSON draft through the M365 Copilot action's `Response` output instead of separate `draftJson` and `nextQuestion` outputs. Consumers should parse `Response` as JSON and read `nextQuestion` from the parsed object.

## Smoke Test

Use this message:

```text
Finance cannot export the Power BI report today. It fails with an error and blocks month-end review.
```

Expected result:

- `category`: `Reporting` or `Bug`
- `urgency`: `High`
- `affectedArea`: `Power BI`
- `businessImpact`: includes month-end review blocked
- `nextQuestion`: asks for evidence, affected report/workspace, error text, users, or expected outcome
