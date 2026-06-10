# Model-Driven Request Intake App

## Current App

- Display name: `Request Intake Model App`
- App ID: `01e9a589-4264-f111-ab0c-7c1e521c7ea3`
- Unique name: `request_intake_model_app_20d5b868`
- Solution: `WorkManagementAgent`
- Primary table: `crb_intakerequest` / `Request Intakes`

The app was created with `pac model create`, published, and then updated through solution ALM so the app module includes `crb_intakerequest` and the sitemap includes `Main > Intake > Request Intakes`.

## Why Model-Driven

Model-driven apps are the better fit for an embedded Copilot Studio agent because Microsoft's current model-driven guidance supports a PCF control invoking Copilot Studio Agent APIs from a Dataverse form. This avoids relying on the retired Canvas custom Copilot/App Copilot feature.

## Planned Agent Surface

Implemented a PCF control for the Request Intake main form that:

- Reads the current record context from the model-driven form.
- Sends the latest user message through the model-driven app Agent API.
- Displays a compact chat/assistant panel on the form.
- Shows busy/error states and never auto-commits generated content.
- Stores the chat transcript in `crb_conversationjson`.

## Current Implementation

- PCF source: `pcf/RequestIntakeAgentControl`
- Active control on the form: `cr3d3_WorkManagement.RequestIntakeAgentChatV8`
- Earlier control retained in the solution: `cr3d3_WorkManagement.RequestIntakeAgentPanel`
- Bound Dataverse column: `crb_conversationjson`
- Main form label: `Intake Agent Chat`
- App assistant agent: `Copilot in Power Apps - Request Intake ...`
- App assistant bot ID: `5e53f35d-4a64-f111-ab0c-7ced8d217675`

The app assistant agent is configured in the model-driven app designer under `Agents > App assistant agent` and has generative orchestration enabled. Its instructions match the intake behavior used by the Canvas app: assume Power Platform, ask one concise follow-up, avoid generic product/service questions, assume Outlook for email unless stated otherwise, and stop once the request is triage-ready.

The V8 PCF control now shows suggested intake fields immediately from the latest user message, then lets the app assistant response refine them when the Agent API returns useful text. This keeps the chat responsive even when the model-driven Agent API is slow, empty, or returns an internal planning payload. Users can review the suggestions and click `Apply to form`; the control updates visible form fields and sends bound PCF outputs for the main text fields.

The Request Intake main form XML now references `cr3d3_WorkManagement.RequestIntakeAgentChatV8` and includes the main triage columns above the chat in the server-side form definition: description, business impact, category, urgency, size, affected area, desired outcome, estimated effort, estimated duration, missing requirements, and additional information.

## Verification

- `npm.cmd run build` passes in `pcf/RequestIntakeAgentControl`.
- `pac pcf push` imported and published `RequestIntakeAgentChatV8` into `WorkManagementAgent`.
- Solution export verified the Request Intake main form references `cr3d3_WorkManagement.RequestIntakeAgentChatV8` and has bound PCF parameters for title, description, business impact, affected area, desired outcome, effort, duration, missing requirements, and additional information.
- Manual model-driven smoke test on a new Request Intake record showed immediate suggested fields for: `We need a Power Automate flow that emails the intake owner when a request is submitted.`
- The smoke test confirmed `Apply to form` populated the visible title, problem/request, business impact, category, urgency, size, affected area, desired outcome, effort, duration, and missing requirements fields.
- The smoke test saved successfully. The form showed `Save status - Saved` with title `Notify intake owner when request is submitted`, category `Automation`, and urgency `Medium`.

## Open Items

- The original `RequestIntakeAgentPanel` custom control remains in the solution because it was used during the first implementation. It can be removed later once no forms reference it.
- The older `RequestIntakeAgentChatV2` through `RequestIntakeAgentChatV7` controls also remain in the solution because they were used to cache-bust PCF updates during implementation. They can be removed later once V8 has been stable.
