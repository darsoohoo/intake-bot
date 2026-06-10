# Intake Bot Handoff Context

Use this file when continuing the project from another computer or a fresh Codex thread.

## Current State

- Project folder on this machine: `C:\Users\darso\DevProjects\intake-bot`
- Power Platform environment ID: `543d442f-0b4a-e67b-89eb-1e32c0622907`
- Environment name shown in Studio: `SPDEV-Dev2`
- Solution ID: `5f0fcba3-5f63-f111-ab0c-7c1e521c7ea3`
- Solution unique name: `WorkManagementAgent`
- Canvas app display name: `Request Intake Copilot Canvas`
- Canvas app ID: `b524aff3-cb3e-4baa-bedc-8e006b7bae74`
- Canvas comparison copy display name: `Request Intake Copilot Canvas - Agent Chat`
- Canvas comparison copy app ID: `fc5b4e4a-c6eb-4cd6-9c59-1b1ea31f48a6`
- Canvas comparison copy component name: `cr3d3_requestintakecopilotcanvasagentchat`
- Canvas editor URL:
  `https://make.powerapps.com/e/543d442f-0b4a-e67b-89eb-1e32c0622907/canvas/?action=edit&form-factor=tablet&name=Request+Intake+Copilot+Canvas&solution-id=5f0fcba3-5f63-f111-ab0c-7c1e521c7ea3&app-id=%2Fproviders%2FMicrosoft.PowerApps%2Fapps%2Fb524aff3-cb3e-4baa-bedc-8e006b7bae74`
- Canvas play URL:
  `https://apps.powerapps.com/play/e/543d442f-0b4a-e67b-89eb-1e32c0622907/a/b524aff3-cb3e-4baa-bedc-8e006b7bae74`
- Code app ID: `e8a9c7f3-f052-4a32-ae0b-4d0dae5f91cb`
- Dataverse Request Intake table logical name: `crb_intakerequest`
- Dataverse Request Intake table ID: `6c428a0e-8d63-f111-ab0c-7c1e521c7ea3`
- Copilot Studio agent display name: `Request Intake Copilot`
- Copilot Studio agent schema name: `crb_RequestIntakeCopilot`
- Copilot Studio agent ID: `d410db8a-ac1c-4357-a331-c97ecf394708`
- Copilot Studio workflow/tool name: `IntakeCopilot_Run`
- Copilot Studio workflow/tool ID: `179221c2-9463-f111-ab0c-7c1e521c7ea3`
- Canvas-callable wrapper flow name: `IntakeCopilot_CanvasRun`
- Canvas-callable wrapper flow ID: `337338cd-9d63-f111-ab0c-7c1e521c7ea3`
- Model-driven app display name: `Request Intake Model App`
- Model-driven app ID: `01e9a589-4264-f111-ab0c-7c1e521c7ea3`
- Model-driven app unique name: `request_intake_model_app_20d5b868`
- Model-driven app assistant agent display name: `Copilot in Power Apps - Request Intake ...`
- Model-driven app assistant agent ID: `5e53f35d-4a64-f111-ab0c-7ced8d217675`
- Model-driven PCF active control: `cr3d3_WorkManagement.RequestIntakeAgentChatV8`
- Model-driven PCF source folder: `pcf/RequestIntakeAgentControl`

## What Was Built

There are two related implementations in this workspace.

1. React/TypeScript Power Apps code app in `src/`
   - Vite + React + TypeScript
   - Guided intake conversation
   - Auto-filled request fields
   - Local draft/submission staging
   - Dataverse-friendly payload creation

2. Native Canvas app in Power Apps Studio
   - Published to the Canvas app above
   - Includes request fields, analysis button, clear button, save draft notification, generated category, generated effort, generated timeline, developer notes, and a chat-style Copilot message area
   - Latest published version includes:
     - `lblConversation`
     - `txtAgentTranscript`
     - `txtAgentMessage`
     - `btnSendAgentMessage`
     - Hidden legacy `lblChecklist` so the Copilot message box owns the lower-right area

## Verification Already Done

- Previewed the first Canvas version with an approver login outage sample.
- Confirmed `Analyze request` filled category, effort, timeline, developer notes, and the follow-up prompt.
- Added the Copilot message box to the Canvas app.
- Preview-tested the message box with:
  `Finance cannot export the Power BI report today. It fails with an error and blocks month-end review.`
- Confirmed the message box updated the transcript, prompt, category, effort, timeline, and developer notes.
- Published the updated Canvas app successfully from Power Apps Studio.
- Power Apps Studio reported no formula errors after the chat controls were added.
- Downloaded the latest published Canvas app into `canvas/RequestIntakeCopilotCanvas-src`.
- Downloaded the latest `.msapp` to `canvas/RequestIntakeCopilotCanvas.msapp`.
- Installed PAC CLI `2.8.1` to `C:\Users\darso\.local\pac-cli\2.8.1\tools` and added `pac.cmd` shim at `C:\Users\darso\AppData\Roaming\npm\pac.cmd`.
- Selected `SPDEV-Dev2` as the active PAC org.
- Created Dataverse table `crb_intakerequest` with the columns in `powerplatform/dataverse-request-table.md`.
- Added `crb_intakerequest` to the `WorkManagementAgent` solution and published customizations.
- Created Copilot Studio agent `Request Intake Copilot` using PAC copilot workspace tooling.
- Pushed intake-specific agent instructions and published the agent successfully at `2026-06-08T22:27:50Z`.
- Added the Copilot Studio agent component to the `WorkManagementAgent` solution. The agent also remains visible in its original unmanaged `crb_RequestIntakeCopilot` solution and Default, which is expected for solution components.
- Confirmed in Copilot Studio that the published `Request Intake Copilot` opens at:
  `https://copilotstudio.preview.microsoft.com/environments/543d442f-0b4a-e67b-89eb-1e32c0622907/agents/d410db8a-ac1c-4357-a331-c97ecf394708/tools`
- Initially confirmed the agent's Tools dialog showed no workflows before `IntakeCopilot_Run` was created.
- Created Copilot Studio workflow `IntakeCopilot_Run` from the Copilot Studio Workflows surface.
- Configured trigger inputs: `lastUserMessage`, `currentDraftJson`, and `conversationJson`.
- Created the `M365 Copilot (V2)` connection for `darsoohoo@spdevdarren.onmicrosoft.com`.
- Configured the workflow to call M365 Copilot with the intake JSON prompt and dynamic trigger inputs.
- Turned `Prefer Async` off.
- Published `IntakeCopilot_Run`; Dataverse reports it as `Activated`.
- Smoke-tested `IntakeCopilot_Run` with the Finance/Power BI export failure sample. The run succeeded in 14 seconds and returned valid JSON. Key values: `category` = `Bug`, `affectedArea` = `Power BI report export`, `urgency` = `Critical`, `nextQuestion` asks for the exact error message.
- Added `IntakeCopilot_Run` to the `WorkManagementAgent` solution. It also appears in `Default` and `GeoRisk`.
- Attached `IntakeCopilot_Run` to the `Request Intake Copilot` agent as a workflow tool.
- Restored the live agent instructions in Copilot Studio and explicitly instructed the agent to use `IntakeCopilot_Run` for intake extraction. Saved and published the agent after attaching the tool.
- Added the `Request Intakes` Dataverse table as a data source in the live Canvas app.
- Replaced `btnSaveDraft.OnSelect` with a Dataverse `Patch` to `Request Intakes` using generated Dataverse choice enums for `Category`, `Urgency`, `Size`, and custom `Status`. Draft saves use the generated disambiguated column label `Status (crb_status)` with `Status (Request Intakes)`.Draft.
- Saved and published the Canvas app after the Dataverse data-source/formula update.
- Smoke-tested the published Canvas play app:
  - Before test row count: 0.
  - Test title: `Finance Power BI export fails`.
  - Canvas showed `Request draft saved to Dataverse.`
  - Verified Dataverse row ID `3e10a06b-9c63-f111-ab0c-7c1e521c7ea3` created at `2026-06-09T00:44:57Z` with `Category` = Bug, `Urgency` = Critical, `Size` = Large, `Estimated Duration` = `Start today`.
- Confirmed the Copilot Studio workflow `IntakeCopilot_Run` does not appear in the Canvas app Add data picker by exact-name search. It is available to the Copilot Studio agent, but not directly callable from Canvas as `IntakeCopilot_Run.Run(...)` in the current configuration.
- Created and activated wrapper flow `IntakeCopilot_CanvasRun` with a Power Apps V2 trigger, three text inputs (`lastUserMessage`, `currentDraftJson`, `conversationJson`), the same M365 Copilot action as `IntakeCopilot_Run`, and a Power Apps response output named `response`.
- Confirmed `IntakeCopilot_CanvasRun` appears in Power Apps Studio under the Canvas app's `Power Automate` pane > `Add flow` > `Instant`, and it can be added to the app in the editing session.
- Attempted to replace `btnSendAgentMessage.OnSelect` in live Studio with a wrapper-backed formula. Studio's embedded formula editor repeatedly accepted only partial selections/pastes through browser automation, so the live send formula was not safely changed.
- Verified with a fresh `pac canvas download` into `.agentworkstream\check-current-src` that the server-side saved app remains clean and still has the original rule-based `btnSendAgentMessage.OnSelect`; the partial formula edits were not saved or published.
- Added `IntakeCopilot_CanvasRun` to the `WorkManagementAgent` solution with `pac solution add-solution-component --componentType 29 --AddRequiredComponents`.
- Associated `IntakeCopilot_CanvasRun` as an in-context flow for Canvas app `b524aff3-cb3e-4baa-bedc-8e006b7bae74` using `Add-AdminFlowPowerAppContext`; the cmdlet returned HTTP 200 OK.
- Initial ALM attempt exported `WorkManagementAgent`, unpacked the Canvas `.msapp` in Experimental layout, patched only `Src/Screen1.fx.yaml`, packed the `.msapp`, replaced the solution Canvas document, and imported/published the unmanaged solution. The solution import and publish succeeded, but a fresh `pac canvas download` still returned the rule-based formula because `Other/Src/Screen1.pa.yaml` still contained the old formula.
- Tested direct Dataverse file-column upload to `canvasapp.document` using `InitializeFileBlocksUpload`, `UploadBlock`, and `CommitFileBlocksUpload`. The upload returned a file ID, but fresh `pac canvas download` still returned the rule-based formula. Restored the pre-upload `.msapp` backup to the same file column afterward.
- Tested the older Power Apps admin endpoint at `https://api.powerapps.com/providers/Microsoft.PowerApps/apps/{appId}`. `GET` succeeded and returned the current `documentUri`; `acquireLease` and `releaseLease` succeeded. The returned document SAS only had read/list permissions, so this route did not provide a safe writable package-update path without an external readable blob location.
- Added a shorter Studio paste formula to `powerplatform/canvas-app-formulas.md` and scratch copy `.agentworkstream/canvas-send-agent-formula-short.powerfx`.
- Corrected the Experimental `.msapp` patch by updating both `Src/Screen1.fx.yaml` and `Other/Src/Screen1.pa.yaml`, then repacked `patched-canvas-both.msapp`.
- Replaced the Canvas document in the unpacked `WorkManagementAgent` solution, packed `WorkManagementAgent-canvas-agent-both.zip`, imported it with `--force-overwrite --publish-changes`, and confirmed import `da1afc16-b163-f111-ab0c-7c1e521c7ea3` plus publish `f788a589-b163-f111-ab0c-7c1e521c7ea3` completed successfully.
- Verified with fresh `pac canvas download` that `btnSendAgentMessage.OnSelect` now calls `IntakeCopilot_CanvasRun.Run(...)`.
- Added `btnSubmitRequest` beside `Save request draft`. It patches the same Dataverse payload shape and sets `Status (crb_status)` to `Status (Request Intakes)`.Submitted.
- Imported/published the submit-status Canvas update through unmanaged solution ALM. Import `ea53c73c-b363-f111-ab0c-7c1e521c7ea3` and publish `36082f8b-b363-f111-ab0c-7c1e521c7ea3` completed successfully.
- Verified with fresh `pac canvas download` that `btnSubmitRequest.OnSelect` exists, `btnSaveDraft` patches Draft, and `btnSubmitRequest` patches Submitted. AppChecker returned no formula-level errors; remaining SARIF entries are warnings.
- Queried Dataverse `workflow` rows after the import and confirmed `IntakeCopilot_Run` plus `IntakeCopilot_CanvasRun` remain activated (`statecode` 1, `statuscode` 2).
- Manual play-app smoke testing showed the initial `Submit request` button overlapped the right Copilot transcript panel; browser automation clicked the overlapped center and did not fire the button. Shortened the live button to text `Submit` with `Width = 80`, imported/published fix `c4bbfae1-b863-f111-ab0c-7c1e521c7ea3`, publish `8351642d-b963-f111-ab0c-7c1e521c7ea3`.
- Reran the play-app smoke test after the overlap fix. Dataverse row `ad6f3671-b963-f111-ab0c-7c1e521c7ea3` was created for `Smoke submitted status 2026-06-09T04-12-31-697Z` with `crb_status` = `100000002` / `Submitted`.
- Refreshed `canvas/RequestIntakeCopilotCanvas-src` and `canvas/RequestIntakeCopilotCanvas.msapp` from the updated live app.
- Ran local code-app validation: `npm.cmd run lint` passed and `npm.cmd run build` passed. Vite emitted a warning that Node.js `20.12.2` is below its recommended `20.19+` / `22.12+`, but the build completed.
- Downloaded the latest published Canvas app into `canvas/RequestIntakeCopilotCanvas-src` and latest `.msapp` into `canvas/RequestIntakeCopilotCanvas.msapp`.
- Refreshed the Canvas app export again on `2026-06-10` after maker-portal layout changes. The canonical repo copy now matches app ID `b524aff3-cb3e-4baa-bedc-8e006b7bae74` from environment `SPDEV-Dev2`: `canvas/RequestIntakeCopilotCanvas-src` and `canvas/RequestIntakeCopilotCanvas.msapp`. A timestamped raw package backup was also kept at `canvas/exports/20260610-021716-live-canvas-export/RequestIntakeCopilotCanvas.msapp`. The refreshed `.msapp` SHA-256 starts with `601C6A9585E8`.
- Fixed the live Canvas editor error on `btnSendAgentMessage`: Power Apps Studio reported `Run` as unknown because `IntakeCopilot_CanvasRun` was associated as an in-context flow but had not been added as an app data source. Added it from Studio's `Power Automate` pane under `Add flow` > `Instant`, saved, and published. A fresh Canvas download now includes a `shared_logicflows` local connection reference and a `References/DataSources.json` entry for `IntakeCopilot_CanvasRun`.
- Completed smoke test for `Send to agent` after that fix. The published play app invoked wrapper flow run `08584205844564420110835111213CU21`; the run succeeded at `2026-06-09T16:27:25Z`, and the transcript updated with the agent follow-up: `What error message do you receive when attempting to export the Power BI report?`
- Tuned the live `IntakeCopilot_Run` and `IntakeCopilot_CanvasRun` M365 Copilot prompts to reduce unnecessary follow-up questions. The new rules tell the agent to treat prior conversation as source of truth, interpret short answers in context, avoid asking what a selected tool/platform is for after the business need is known, avoid collecting personal concrete values such as home addresses during intake, and keep all output fields except `missingRequirements` as strings.
- Updated the live Canvas send formula so `conversationJson` includes the prior transcript as a `context` row plus the latest user message. This prevents the flow from losing earlier context between turns.
- Hardened the live Canvas send formula by removing a fragile `Text(varParsedDraft.acceptanceCriteria)` conversion. This avoids runtime failures when the model returns an optional field in the wrong shape.
- Updated the live Canvas send formula and main intake controls so the agent response auto-fills `Request title`, `Problem or request`, and `Business impact` via `varRequestTitle`, `varProblemDescription`, and `varBusinessImpact` once a usable draft is available. The send formula now resets those controls after parsing the response so the visible form updates immediately.
- Smoke-tested the travel documentation scenario. After a mileage-reimbursement request and `Bing Maps`, the agent no longer asked a generic Bing Maps question, did not ask for the exact home address, and did not show the prior untyped object array error.
- Smoke-tested the main-field auto-fill path in the published play app. After the mileage reimbursement screenshot request, the app populated `Request title` with `Automate screenshot capture of recurring meeting and mileage map for reimbursement`, populated `Problem or request` with a high-level calendar/map screenshot request, and populated `Business impact` with reimbursement documentation/time-savings impact. After the requester answered `OneDrive`, the problem field was refined to include OneDrive storage.
- Further tuned the live prompts after the agent still asked generic OneDrive/documentation questions. Added explicit rules for storage destinations, business-value answers, personal productivity wording, and a hard travel-reimbursement screenshot override: once the request includes meeting/map screenshots for mileage reimbursement and the user selects OneDrive or SharePoint storage, `nextQuestion` must be `I have enough for initial triage. Review the generated fields, then save or submit the draft.`
- Smoke-tested the exact OneDrive path. After the mileage reimbursement screenshot request and `onedrive`, the agent stopped with the completion statement and did not ask the generic OneDrive, documentation-system, calendar-source, or multi-user questions.
- Further tuned the live prompts after the agent asked `What specific data or process do you want to automate?` when the requester answered the calendar-source question with `automatically would be nice but i can enter manually as well`. Added an explicit rule to interpret that answer as `Prefer Outlook calendar lookup with manual entry/override fallback` and hard-stop the travel reimbursement screenshot intake with the completion statement.
- Smoke-tested the calendar automation/manual fallback answer. The agent did not ask the generic automation question and returned `I have enough for initial triage. Review the generated fields, then save or submit the draft.`
- Further tuned the live `IntakeCopilot_Run` and `IntakeCopilot_CanvasRun` prompts for Power Platform email defaults and PDF merge requests. The prompts now assume Microsoft 365 Outlook for email output unless the requester names a nonstandard service, forbid asking generic email-service questions, and hard-stop PDF merge intake once selected PDFs, merge output, sort/default display order, and download/email sharing are known.
- Smoke-tested the PDF merge scenario in the published play app. After the requester specified selected PDFs and numeric sort order defaulted from screen display order, the agent returned `I have enough for initial triage. Review the generated fields, then save or submit the draft.` instead of asking what email service to use. It captured PDF library, file-size/performance, and email attachment constraints as developer notes.
- Polished the published Canvas layout through unmanaged solution import after updating both Experimental layout copies. The auto-filled fields section now starts higher, action buttons align on a single row, short generated fields explicitly use single-line text inputs, and the problem, business impact, developer notes, and Copilot transcript boxes are taller to reduce internal scrolling. Fresh `pac canvas download` confirmed zero parser and binding errors.
- Updated and published the live `IntakeCopilot_Run`, `IntakeCopilot_CanvasRun`, and `Request Intake Copilot` agent instructions so the agent assumes incoming requests are for the Power Platform team and should map to Power Apps, Power Automate, Dataverse, Power BI, Copilot Studio, Power Pages, or Microsoft 365 connector solutions unless the requester explicitly names a non-Power Platform system. Round-trip solution export verified the rule is present in both workflow prompts and the agent instruction files.
- Created a separate Canvas app copy named `Request Intake Copilot Canvas - Agent Chat` in the `WorkManagementAgent` solution so the original `Request Intake Copilot Canvas` remains available for comparison. The copy was created by duplicating the Canvas component in an unpacked solution, assigning a new schema name/display name/identity, packing, importing, and publishing.
- Investigated wiring the existing Copilot Studio agent directly into the copied Canvas app. Microsoft has discontinued adding the old custom Copilot/App Copilot feature and the Copilot control to new canvas apps as of February 2, 2026. The current Studio UI for this copied app does not expose `App Copilot`, `Copilot component`, `Edit in Copilot Studio`, or `M365 Copilot in canvas apps (Preview)` settings, even when opened with `enableM365CopilotSetting=true`. Keep using the wrapper-flow backed chat surface unless the tenant/environment later exposes Microsoft 365 Copilot for canvas apps or another supported embedding path.
- Created and published model-driven app shell `Request Intake Model App` in the `WorkManagementAgent` solution using `pac model create`. Added `crb_intakerequest` as an app module component and added a sitemap area/group/subarea for `Request Intakes`. Round-trip solution export verified the table component and sitemap subarea are present.
- Improved Canvas chat perceived speed in the published original Canvas app. `btnSendAgentMessage` now immediately stores the current transcript, appends the user message plus `Agent is thinking...`, disables the input/button via `varAgentBusy`, and starts hidden timer `tmrRunAgent` to call `IntakeCopilot_CanvasRun` after the UI repaints. The timer replaces the thinking placeholder with the returned agent question and re-enables the send controls.
- Smoke-tested the published Canvas app after the speed update. A Power BI export failure message updated fields and transcript after the flow returned. A second message immediately disabled the send button while the agent ran and then re-enabled it after the response updated the generated fields.
- Built PCF control source under `pcf/RequestIntakeAgentControl` and imported it into `WorkManagementAgent`.
- Added `Conversation JSON` / `crb_conversationjson` to the Request Intake main form, relabeled it `Intake Agent Chat`, made it 6 rows tall, and attached the PCF control.
- Configured the model-driven app's `Agents > App assistant agent`. This created/published app assistant agent `Copilot in Power Apps - Request Intake ...` with ID `5e53f35d-4a64-f111-ab0c-7ced8d217675`.
- Added intake-specific instructions to the app assistant agent and enabled generative orchestration so model-driven Agent API calls return useful responses instead of echoing prompts.
- Published the model-driven app after app assistant configuration. The app designer shows `App assistant agent, Last published 6/9/2026`.
- Published active PCF control `RequestIntakeAgentChatV8` and updated the Request Intake main form XML to reference `cr3d3_WorkManagement.RequestIntakeAgentChatV8` for web/tablet/mobile. The older `RequestIntakeAgentPanel` and `RequestIntakeAgentChatV2` through `RequestIntakeAgentChatV7` controls remain in the solution but are no longer referenced by the form.
- Updated the model-driven PCF so it immediately drafts suggested intake fields from the user message, then lets the app assistant response refine them if the Agent API returns useful text. This avoids a frozen/blank experience when the app assistant is slow, empty, or returns an internal planning payload.
- Added a review/apply panel to the model-driven PCF. Users can click `Apply to form` after reviewing suggested values. The control maps suggestions to `crb_title`, `crb_description`, `crb_businessimpact`, `crb_category`, `crb_urgency`, `crb_size`, `crb_affectedarea`, `crb_desiredoutcome`, `crb_estimatedeffort`, `crb_estimatedduration`, `crb_missingrequirements`, and other triage columns. V8 also exposes bound PCF outputs for the main text fields so the form receives values from the control itself.
- Expanded the Request Intake main form server-side XML to include core triage fields above the chat: description, business impact, category, urgency, size, affected area, desired outcome, estimated effort, estimated duration, missing requirements, and additional information.
- Smoke-tested the model-driven embedded chat on a new Request Intake record. For `We need a Power Automate flow that emails the intake owner when a request is submitted.`, the embedded chat immediately showed suggested fields including title `Notify intake owner when request is submitted`, category `Automation`, affected area `Power Automate`, urgency `Medium`, desired outcome, and effort/duration. `Apply to form` populated the visible title, problem/request, business impact, category, urgency, size, affected area, desired outcome, effort, duration, and missing requirements fields. Saving succeeded and the form showed `Save status - Saved`.
- Connected the Power Apps code app to the existing `IntakeCopilot_CanvasRun` wrapper flow with `npx.cmd power-apps add-flow --flow-id 337338cd-9d63-f111-ab0c-7c1e521c7ea3`. Added `src/agentFlow.ts` to call the generated flow client from the chat send path, parse the returned JSON, merge suggested fields into the form, and fall back to the local intake engine if the flow is unavailable during local development. Also improved the local engine so short answers to the previous question, such as `This is for CMR Admin <Power Apps URL>`, populate `affectedArea` instead of repeating the same question. Published the updated code app to `SPDEV-Dev2` / `WorkManagementAgent` at app ID `e8a9c7f3-f052-4a32-ae0b-4d0dae5f91cb`.

## Important Local Files

- `AGENTS.md`: project-specific Codex instructions.
- `README.md`: code app setup and Power Platform publish notes.
- `src/App.tsx`: React code app UI.
- `src/intakeEngine.ts`: request analysis logic for the React code app.
- `powerplatform/ai-prompt-contract.md`: AI/Copilot prompt contract.
- `powerplatform/canvas-app-formulas.md`: Canvas formula design notes.
- `powerplatform/dataverse-request-table.md`: Dataverse table shape.
- `powerplatform/model-driven-request-intake.md`: model-driven app and PCF/agent path notes.
- `canvas/RequestIntakeCopilotCanvas-src/Src/Screen1.pa.yaml`: latest published Canvas source export.
- `canvas/RequestIntakeCopilotCanvas.msapp`: latest downloaded Canvas app package.

## Tooling Added

`codex-workflows` was installed in this project:

- `.agents/`
- `.codex/`
- `.codex-workflows-manifest.json`

Verified with:

```powershell
npx.cmd codex-workflows status
```

Expected output includes:

```text
Version:   0.6.7
Files:     97 managed
```

`mcp-local-rag` was configured globally for Codex on this machine:

- Global skill path: `C:\Users\darso\.codex\skills\mcp-local-rag`
- Codex config entry: `mcp_servers.local-rag-intake-bot`
- RAG DB path: `C:\Users\darso\.codex\local-rag\intake-bot\db`
- RAG cache path: `C:\Users\darso\.codex\local-rag\models`
- Indexed docs included `README.md`, `AGENTS.md`, and `powerplatform/`.

This user-level Codex config does not automatically travel with the project folder. Recreate it on the other computer if RAG is needed there.

PAC CLI was installed locally from the official `Microsoft.PowerApps.CLI` NuGet package after the MSI shortlink returned HTML on this machine:

- Install root: `C:\Users\darso\.local\pac-cli\2.8.1\tools`
- Shim: `C:\Users\darso\AppData\Roaming\npm\pac.cmd`

## Useful Commands

Install dependencies:

```powershell
npm.cmd install
```

Run code app locally:

```powershell
npm.cmd run dev
```

Validate code app:

```powershell
npm.cmd run lint
npm.cmd run build
```

Download latest Canvas source:

```powershell
pac canvas download --environment 543d442f-0b4a-e67b-89eb-1e32c0622907 --name b524aff3-cb3e-4baa-bedc-8e006b7bae74 --extract-to-directory "canvas\RequestIntakeCopilotCanvas-src" --overwrite
```

Download latest Canvas package:

```powershell
pac canvas download --environment 543d442f-0b4a-e67b-89eb-1e32c0622907 --name b524aff3-cb3e-4baa-bedc-8e006b7bae74 --file-name "canvas\RequestIntakeCopilotCanvas.msapp" --overwrite
```

Open the copied Canvas app for comparison:

```powershell
Start-Process "https://apps.powerapps.com/play/e/543d442f-0b4a-e67b-89eb-1e32c0622907/a/fc5b4e4a-c6eb-4cd6-9c59-1b1ea31f48a6"
```

## Continuation Notes

- Prefer editing the live Canvas app in Power Apps Studio for nontrivial visual changes. The CLI can download/unpack the Canvas source, but `pac canvas pack` with `SourceCode` layout currently fails in PAC 2.8.1 with a `System.FormatException` from `SourceCodeCanvasPacker.ValidateSources`. Experimental layout can unpack/pack a no-op `.msapp`, but importing/updating the existing app still needs Studio or solution ALM.
- Treat `canvas/RequestIntakeCopilotCanvas-src` as a review/export artifact, not the only source of truth.
- The current Canvas app uses `IntakeCopilot_CanvasRun.Run(...)` for the send-button agent response and still uses rule-based Power Fx for the separate Analyze button. `Save request draft` writes Dataverse rows with custom status `Draft`; `Submit` writes rows with custom status `Submitted`.
- The current Canvas app uses hidden timer `tmrRunAgent` to make the chat feel responsive: the click handler updates the transcript and busy state immediately, and the timer performs the flow call.
- The Dataverse table, Copilot Studio agent, `IntakeCopilot_Run` workflow, and `IntakeCopilot_CanvasRun` wrapper flow now exist. The wrapper is in the `WorkManagementAgent` solution and is associated to the Canvas app as an in-context flow.
- The model-driven app uses its app assistant agent, not the original Canvas wrapper flow, for the embedded PCF chat. The PCF calls the model-driven Agent API from the form and stores transcript JSON in `crb_conversationjson`.
- The model-driven PCF now shows suggested fields and can apply reviewed values to the model-driven form. Current active cache-busting control is V8.
- `IntakeCopilot_Run` was built with the newer Copilot Studio Workflows surface, not the classic Power Automate designer. It uses a Manual/on-demand trigger and M365 Copilot `Response` output instead of separate `draftJson` and `nextQuestion` response outputs.
- Because `IntakeCopilot_Run` did not appear in the Canvas Add data picker, the Canvas app uses `IntakeCopilot_CanvasRun` from the Power Automate pane/flow context instead.
- For future package edits through Experimental layout, update both `Src/*.fx.yaml` and `Other/Src/*.pa.yaml` before packing. Updating only `Src/*.fx.yaml` packs but does not change the package returned by `pac canvas download`.
- The older Power Apps app PUT/publish flow requires a readable document URI; the current API response only exposes read/list SAS for the existing package and does not provide write permissions.
- This folder is now a Git repo with a dirty working tree from the Power Platform/code app work. Do not revert unrelated changes.

