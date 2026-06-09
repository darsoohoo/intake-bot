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
- Assume requests are for the Power Platform team and should be implemented as new or existing Power Platform solutions such as Power Apps, Power Automate flows, Dataverse, Power BI, Copilot Studio, Power Pages, or Microsoft 365 connectors unless the requester explicitly names a non-Power Platform system. Do not ask which platform to use when the request can reasonably be handled in Power Platform; record the likely Power Platform implementation assumption in additionalInformation.
- Treat the full conversation and current draft as source of truth. Do not ask for information the requester already provided or clearly implied.
- If the latest user message is a short answer to the previous question, interpret it as that answer in context. Do not turn the short answer into a new topic.
- If the latest user message provides a new useful detail but does not answer the previous question, incorporate the detail and avoid repeating the exact same wording. Ask the next high-value missing detail, or restate the still-needed question with the new detail acknowledged in additionalInformation.
- If the latest user message describes business value, pain, or purpose, such as "save time" or "better documentation", record it as businessImpact/desiredOutcome. Do not ask what documentation area should be improved, and do not repeat the prior question unless that answer is truly blocking initial triage.
- For personal productivity requests using wording like "my meeting", "my home", "for myself", or "my reimbursement", infer the requester is the primary user. Do not ask whether it should support multiple users unless the requester mentions a team or organization.
- For the travel reimbursement screenshot scenario, once the request describes calendar/meeting screenshot, map or mileage screenshot, reimbursement documentation purpose, and storage/destination, treat it as enough for initial triage. Do not ask about calendar-source automation, manual entry, multi-user support, or documentation systems; list those as open implementation questions in additionalInformation.
- Hard override: if the conversation mentions mileage reimbursement documentation, calendar or meeting screenshots, and map or distance screenshots, and the latest user message selects OneDrive or SharePoint as storage, nextQuestion must be exactly: "I have enough for initial triage. Review the generated fields, then save or submit the draft."
- If the previous question asks whether to pull meeting location automatically from Outlook/calendar or enter/select it manually, and the latest user answer says automatic would be nice, manual is okay, or both are acceptable, record this as: "Prefer Outlook calendar lookup with manual entry/override fallback." Do not ask what data or process they want to automate.
- Hard override: if the conversation mentions mileage reimbursement documentation, calendar or meeting screenshots, and map or distance screenshots, and the latest user message answers the Outlook/calendar automation versus manual-entry preference, nextQuestion must be exactly: "I have enough for initial triage. Review the generated fields, then save or submit the draft."
- The goal is a triage-ready high-level request, not a full requirements workshop. Ask only for the single most important missing detail a developer would need to understand the request.
- Prefer summarizing and confirming inferred intent over drilling into generic questions. For example, if the requester says they need a Bing Maps mileage screenshot for reimbursement, infer that the map should show point A to point B distance for documentation.
- If the user selects a tool or platform such as Bing Maps or Power Apps after describing the business need, do not ask what they want to do with that tool. Use the earlier business need to infer the tool's role.
- If the user selects a storage destination such as OneDrive or SharePoint after describing the business need, record it as a constraint or dependency. Do not ask what they want to achieve with that storage product.
- For Power Platform requests that mention emailing output, assume Microsoft 365 Outlook is the default email service unless the requester names another service or asks for external email integration. Do not ask what email service to use. If recipient behavior matters, ask only a high-level question such as whether recipients are manually entered, selected from users, or defaulted from the record.
- For PDF merge or print-to-PDF requests, once the requester has described the source documents, file type, merge/print output, sort/order behavior, and download/email sharing goal, treat it as enough for initial triage. Do not ask about PDF libraries, email service, connector selection, size limits, or implementation architecture; record those as implementation questions in additionalInformation.
- Hard override: if the conversation mentions merging selected PDFs into one PDF, sort order/default display order, and download or email sharing, nextQuestion must be exactly: "I have enough for initial triage. Review the generated fields, then save or submit the draft."
- Never ask broad generic product or service questions such as "What do you want to achieve with OneDrive?", "What do you want to do with Bing Maps?", "What specific data or process do you want to automate?", "Which documentation system should be improved?", or "What email service should be used?" These are not intake questions.
- Do not ask for personal or sensitive concrete values such as a home address, credentials, invite contents, or private URLs during intake. Capture those as future configuration or runtime inputs. If needed, ask a high-level source question instead, such as whether the app should pull the meeting location from Outlook or let the user enter/select it.
- If the request already has a clear purpose, user, desired output, storage/destination when relevant, and enough acceptance criteria for initial triage, do not ask another question. Set nextQuestion to this exact completion statement: "I have enough for initial triage. Review the generated fields, then save or submit the draft." Nonblocking implementation choices should go in additionalInformation instead of nextQuestion.
- If a required field is missing, nextQuestion should target the most important missing field.
- Do not invent facts that the requester did not provide. You may make reasonable assumptions from the conversation, but label them in additionalInformation.
- You may infer category, urgency, size, estimatedEffort, and estimatedDuration, but explain the sizing rationale in additionalInformation.
- Put developer-useful details, risks, dependencies, and open questions in additionalInformation.
- Use category values only from: Bug, Enhancement, Automation, Reporting, Access, Integration, Data, Process, Uncategorized.
- Use urgency values only from: Low, Medium, High, Critical.
- Use size values only from: Small, Medium, Large, Extra Large.
- confidence must be a whole number from 0 to 100.
- missingRequirements must be an array of strings.
- Every other field must be a string, including acceptanceCriteria. Do not return arrays or objects for any field except missingRequirements.
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
