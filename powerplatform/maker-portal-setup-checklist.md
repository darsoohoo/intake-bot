# Maker Portal Setup Checklist

Use this checklist in `SPDEV-Dev2` for the `WorkManagementAgent` solution.

## Current Known IDs

| Item | Value |
| --- | --- |
| Environment ID | `543d442f-0b4a-e67b-89eb-1e32c0622907` |
| Environment name | `SPDEV-Dev2` |
| Solution unique name | `WorkManagementAgent` |
| Solution ID | `5f0fcba3-5f63-f111-ab0c-7c1e521c7ea3` |
| Canvas app ID | `b524aff3-cb3e-4baa-bedc-8e006b7bae74` |
| Code app ID | `e8a9c7f3-f052-4a32-ae0b-4d0dae5f91cb` |
| Dataverse table logical name | `crb_intakerequest` |
| Dataverse table ID | `6c428a0e-8d63-f111-ab0c-7c1e521c7ea3` |
| Copilot Studio agent ID | `d410db8a-ac1c-4357-a331-c97ecf394708` |
| Workflow ID | `179221c2-9463-f111-ab0c-7c1e521c7ea3` |
| Canvas wrapper flow ID | `337338cd-9d63-f111-ab0c-7c1e521c7ea3` |

## 1. Repair Connections

- Refresh or recreate the Microsoft Dataverse connection.
- Confirm the Dataverse connection status is `Connected`.
- Confirm it is available in `SPDEV-Dev2`.

## 2. Create Dataverse Table

Status: complete in `SPDEV-Dev2`.

Create a custom table:

| Setting | Value |
| --- | --- |
| Display name | `Request Intake` |
| Plural name | `Request Intakes` |
| Suggested schema/logical name | `crb_intakerequest` |
| Ownership | User or team |
| Add to solution | `WorkManagementAgent` |

Fields:

| Display name | Logical name | Type | Required |
| --- | --- | --- | --- |
| Request Title | `crb_title` | Text | Yes |
| Description | `crb_description` | Multiline text | Yes |
| Category | `crb_category` | Choice | Yes |
| Affected Area | `crb_affectedarea` | Text | Yes |
| Users Affected | `crb_usersaffected` | Text | No |
| Business Impact | `crb_businessimpact` | Multiline text | Yes |
| Urgency | `crb_urgency` | Choice | Yes |
| Desired Outcome | `crb_desiredoutcome` | Multiline text | Yes |
| Constraints | `crb_constraints` | Multiline text | No |
| Dependencies | `crb_dependencies` | Multiline text | No |
| Acceptance Criteria | `crb_acceptancecriteria` | Multiline text | No |
| Size | `crb_size` | Choice | No |
| Estimated Effort | `crb_estimatedeffort` | Text | No |
| Estimated Duration | `crb_estimatedduration` | Text | No |
| Confidence | `crb_confidence` | Whole number | No |
| Missing Requirements | `crb_missingrequirements` | Multiline text | No |
| Additional Information | `crb_additionalinformation` | Multiline text | No |
| Conversation JSON | `crb_conversationjson` | Multiline text | No |
| Status | `crb_status` | Choice | No |

Choice values:

- Category: `Bug`, `Enhancement`, `Automation`, `Reporting`, `Access`, `Integration`, `Data`, `Process`, `Uncategorized`
- Urgency: `Low`, `Medium`, `High`, `Critical`
- Size: `Small`, `Medium`, `Large`, `Extra Large`
- Status: `Draft`, `Needs Review`, `Submitted`, `Accepted`, `Rejected`

## 3. Create Copilot Studio Agent

Status: agent shell complete, workflow created, workflow attached, and agent published.

Create and publish the agent from [copilot-studio-agent.md](./copilot-studio-agent.md).

Required items:

- Agent: `Request Intake Copilot`
- Agent flow/tool: `IntakeCopilot_Run`
- Prompt and schema: [agent-flow-intakecopilot-run.md](./agent-flow-intakecopilot-run.md)

Implemented workflow:

- Created from Copilot Studio `Workflows`.
- Trigger inputs: `lastUserMessage`, `currentDraftJson`, `conversationJson`.
- Action: `M365 Copilot (V2)` / `Chat Copilot`.
- Runtime output: `Response` text containing the JSON draft.
- Added to solution `WorkManagementAgent`.

Portal path if the flow/tool needs to be recreated:

1. Open Copilot Studio in `SPDEV-Dev2`.
2. Open agent `Request Intake Copilot`.
3. Create or open a topic such as `Draft intake request`.
4. Add a tool from the topic canvas and choose `New Agent flow`.
5. Publish the starter flow once so it exists in Power Automate.
6. Rename it to `IntakeCopilot_Run`.
7. Configure the `When an agent calls the flow` trigger inputs:
   - `conversationJson` as Text
   - `currentDraftJson` as Text
   - `lastUserMessage` as Text
8. Add the AI Builder/custom prompt and Parse JSON steps from [agent-flow-intakecopilot-run.md](./agent-flow-intakecopilot-run.md).
9. Configure `Respond to the agent` with Text outputs:
   - `draftJson`
   - `nextQuestion`
10. Ensure `Respond to the agent` has asynchronous response turned off.
11. Save and publish the flow.
12. Return to the agent and add the published workflow as an agent-level or topic-level tool.

## 4. Update Canvas App

Status: agent send, draft save, and submit status handling are complete. `Request Intakes` is connected as a Dataverse data source, `Save request draft` patches custom status `Draft`, `Submit` patches custom status `Submitted`, and `btnSendAgentMessage.OnSelect` calls `IntakeCopilot_CanvasRun`.

- Wrapper flow `IntakeCopilot_CanvasRun` has been created, activated, added to `WorkManagementAgent`, associated to the Canvas app with `Add-AdminFlowPowerAppContext`, and added inside Power Apps Studio from `Power Automate` > `Add flow` so the Canvas package includes the `shared_logicflows` data source.
- The Canvas formula was updated through unmanaged solution import after patching both Experimental layout copies: `Src/Screen1.fx.yaml` and `Other/Src/Screen1.pa.yaml`.
- Fresh `pac canvas download` confirmed `btnSendAgentMessage.OnSelect` contains `IntakeCopilot_CanvasRun.Run(...)` and the app has no parser or binding errors.
- Fresh `pac canvas download` confirmed `btnSubmitRequest.OnSelect` exists and both save paths patch `Status (crb_status)` with `Status (Request Intakes)`. AppChecker reported no formula-level errors.
- Manual play-app smoke test found the initial wider submit button overlapped the Copilot transcript area. The live button is now shortened to `Submit` with `Width = 80`, ending before the right-hand panel.
- Completed smoke test for submit: published Canvas play app created Dataverse row `ad6f3671-b963-f111-ab0c-7c1e521c7ea3` for `Smoke submitted status 2026-06-09T04-12-31-697Z` with `crb_status` = `Submitted`.
- Completed smoke test for `Send to agent`: published Canvas play app invoked `IntakeCopilot_CanvasRun`, flow run `08584205844564420110835111213CU21` succeeded at `2026-06-09T16:27:25Z`, and the transcript updated with the agent follow-up question.
- Prompt tuning update: both `IntakeCopilot_Run` and `IntakeCopilot_CanvasRun` now instruct the agent to retain conversation context, interpret short answers as answers to the previous question, avoid redundant tool/platform questions, avoid asking for personal concrete values during intake, and return strings for every field except `missingRequirements`.
- Canvas send update: `conversationJson` now sends the prior transcript as context plus the latest user message, and the developer-notes update no longer parses optional `acceptanceCriteria` directly.
- Latest travel-documentation smoke test passed the important checks: no generic Bing Maps question, no exact home-address request, no array/type runtime error.
- Latest OneDrive storage smoke test passed: after the mileage reimbursement screenshot request and `onedrive`, the agent returned `I have enough for initial triage. Review the generated fields, then save or submit the draft.` instead of asking product or implementation-discovery questions.
- Latest calendar-source smoke test passed: when the requester answered `automatically would be nice but i can enter manually as well`, the agent interpreted it as Outlook calendar lookup with manual fallback and returned the completion statement instead of asking `What specific data or process do you want to automate?`.
- Note for future package edits: updating only `Src/*.fx.yaml` is not enough; the packed app can still return the old formula from `Other/Src/*.pa.yaml`.
- Older Power Apps admin API checks: app `GET`, `acquireLease`, and `releaseLease` work, but the current app document URI is read/list only. A package update through this API still needs a readable document URI for the patched `.msapp`.
- Publish the app.

## 5. Validation

- Send: `Finance cannot export the Power BI report today. It fails with an error and blocks month-end review.`
- Confirm the agent updates category, effort, timeline, developer notes, transcript, and next question.
- Save as draft and confirm one Dataverse row is created.
- Submit and confirm one Dataverse row is created with `crb_status` = `Submitted`.
- Open the Canvas play URL and repeat the same smoke test outside Studio preview.
- Completed smoke test for draft save: published Canvas play app created Dataverse row `3e10a06b-9c63-f111-ab0c-7c1e521c7ea3` for `Finance Power BI export fails`.
- Completed smoke test for submit: published Canvas play app created Dataverse row `ad6f3671-b963-f111-ab0c-7c1e521c7ea3` with `crb_status` = `Submitted`.
