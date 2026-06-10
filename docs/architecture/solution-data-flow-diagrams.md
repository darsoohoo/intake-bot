# Solution Data Flow Diagrams

These diagrams show how the request intake solution is split across three Power Platform experiences:

- Canvas app: the maker-built intake form with an agent chat panel.
- Model-driven app: the Dataverse-centered intake form with an embedded PCF agent chat control.
- Code app: the React and TypeScript implementation that produces Dataverse-shaped request payloads.

## Canvas App

The Canvas app is the main citizen-developer intake experience. It collects a request through a chat-style interface, calls the Canvas wrapper flow for agent reasoning, fills visible form fields, and saves or submits rows to the Dataverse `Request Intakes` table.

```mermaid
flowchart LR
    Requester["Requester"] --> CanvasUi["Canvas app screen\nRequest Intake Copilot Canvas"]

    subgraph Canvas["Canvas app components"]
        CanvasUi --> ChatControls["Agent chat controls\ntxtAgentMessage, transcript, send button"]
        CanvasUi --> FormControls["Structured intake fields\ntitle, problem, impact, category, effort, timeline"]
        CanvasUi --> Timer["Hidden timer\ntmrRunAgent"]
        CanvasUi --> SaveButtons["Save Draft and Submit buttons"]
    end

    ChatControls --> Timer
    Timer --> WrapperFlow["Power Automate wrapper flow\nIntakeCopilot_CanvasRun"]
    WrapperFlow --> CopilotAction["Microsoft 365 Copilot action\nResponse"]
    CopilotAction --> WrapperFlow
    WrapperFlow --> AgentJson["Agent JSON response\nfield suggestions, follow-up, notes"]

    AgentJson --> ParseResponse["Canvas formulas parse response\nSet variables and reset controls"]
    ParseResponse --> FormControls
    ParseResponse --> Transcript["Conversation context JSON"]
    Transcript --> ChatControls

    SaveButtons --> PatchDraft["Patch row with status Draft"]
    SaveButtons --> PatchSubmit["Patch row with status Submitted"]
    PatchDraft --> Dataverse["Dataverse table\ncrb_intakerequest / Request Intakes"]
    PatchSubmit --> Dataverse

    Dataverse --> Makers["Makers and developers review requests"]
```

### Canvas Data Flow

1. The requester describes the issue in the agent chat box.
2. Canvas sends the latest message, current draft JSON, and conversation JSON to `IntakeCopilot_CanvasRun`.
3. The wrapper flow calls the Microsoft 365 Copilot response action and returns a structured response.
4. Canvas formulas parse the response and update visible form variables and controls.
5. `Save Draft` or `Submit` patches the Dataverse `Request Intakes` row with `crb_status` set to `Draft` or `Submitted`.

## Model-Driven App

The model-driven app is the Dataverse-first experience. The request form owns the record, and the PCF control acts as the embedded agent chat surface. The active control is `cr3d3_WorkManagement.RequestIntakeAgentChatV8`.

```mermaid
flowchart LR
    Maker["Requester or triage user"] --> ModelApp["Model-driven app\nRequest Intake Model App"]

    subgraph Form["Request Intake main form"]
        ModelApp --> DataverseFields["Dataverse form fields\ntitle, description, impact, size, effort, notes"]
        ModelApp --> ConversationField["Conversation JSON column\ncrb_conversationjson"]
        ConversationField --> PcfControl["PCF agent chat control\nRequestIntakeAgentChatV8"]
    end

    PcfControl --> PromptBuilder["Prompt builder\ncurrent record + transcript"]
    PromptBuilder --> AgentApi["Model-driven Agent API\ncontext.copilot.executePrompt"]
    AgentApi --> AppAssistant["App assistant agent\nCopilot in Power Apps - Request Intake"]
    AppAssistant --> AgentApi
    AgentApi --> Suggestions["Suggested field values\ncategory, urgency, size, effort, missing requirements"]

    Suggestions --> ReviewPanel["PCF review panel\nuser reviews suggestions"]
    ReviewPanel --> ApplyButton["Apply to form"]
    ApplyButton --> XrmForm["Xrm form attributes\nsetValue on visible fields"]
    ApplyButton --> BoundOutputs["PCF bound outputs\nconversation and suggested fields"]
    ApplyButton --> WebApiFallback["Web API update fallback\nfor saved records"]

    XrmForm --> SaveRecord["User saves record"]
    BoundOutputs --> SaveRecord
    WebApiFallback --> Dataverse["Dataverse table\ncrb_intakerequest / Request Intakes"]
    SaveRecord --> Dataverse

    Dataverse --> Views["Model-driven views, forms, and triage workflows"]
```

### Model-Driven Data Flow

1. The user opens or creates a `Request Intake` record in the model-driven app.
2. The embedded PCF chat control builds a prompt from the record, transcript, and latest message.
3. The control calls the model-driven Agent API, which uses the app assistant agent.
4. The response is shown as reviewed suggestions rather than blindly overwriting the record.
5. `Apply to form` updates visible form fields and bound outputs; the user then saves the Dataverse record.

## Code App

The code app is the React and TypeScript version of the intake experience. It currently runs the intake reasoning locally in `src/intakeEngine.ts`, stages draft and submitted payloads in browser storage, and produces a Dataverse-friendly JSON shape for a future direct flow or Dataverse write.

```mermaid
flowchart LR
    User["Requester"] --> ReactApp["Power Apps code app shell\nVite + React + TypeScript"]

    subgraph Source["Code app source"]
        ReactApp --> AppTsx["src/App.tsx\nconversation UI, form UI, actions"]
        AppTsx --> IntakeEngine["src/intakeEngine.ts\nanalysis, next question, readiness, estimates"]
        IntakeEngine --> Types["src/types.ts\nIntakeDraft, IntakeMessage, status types"]
        AppTsx --> Css["App.css and index.css\napplication styling"]
    end

    AppTsx --> Messages["Conversation state\nassistant and user messages"]
    Messages --> IntakeEngine
    IntakeEngine --> Draft["Inferred intake draft\nrequired fields, size, effort, notes"]
    Draft --> Readiness["Readiness score\nready, needs review, needs intake"]
    Draft --> PayloadMapper["toPowerPlatformPayload\ncrb_* Dataverse field shape"]

    PayloadMapper --> SaveLocal["Save Draft\nlocalStorage draft payload"]
    PayloadMapper --> SubmitLocal["Submit Request\nlocalStorage submitted payload"]
    PayloadMapper --> CopyJson["Copy JSON payload\nfor inspection or handoff"]

    SaveLocal --> BrowserStorage["Browser localStorage"]
    SubmitLocal --> BrowserStorage
    CopyJson --> Clipboard["Clipboard"]

    subgraph Publish["Power Apps code app publish path"]
        ReactApp --> Build["npm build\nstatic app bundle"]
        Build --> PowerConfig["power.config.json\nPower Apps code app metadata"]
        PowerConfig --> Push["Power Apps push\nsolution-aware deployment"]
        Push --> HostedCodeApp["Published code app\nPower Platform environment"]
    end

    PayloadMapper -. "Future integration point" .-> FlowOrDataverse["Power Automate flow or Dataverse API"]
    FlowOrDataverse -.-> Dataverse["Dataverse table\ncrb_intakerequest / Request Intakes"]
```

### Code App Data Flow

1. The requester chats with the React UI in `src/App.tsx`.
2. `src/intakeEngine.ts` infers category, urgency, size, effort, missing requirements, readiness, and developer notes.
3. `toPowerPlatformPayload` maps the draft into `crb_*` fields that match the Dataverse request table.
4. Save and submit actions currently stage payloads in browser `localStorage`; copy JSON supports inspection and handoff.
5. The published code app path builds the React bundle and pushes it to the Power Platform solution.

## Shared Data Contract

All three experiences converge on the same Dataverse-oriented request shape:

- `crb_title`
- `crb_description`
- `crb_category`
- `crb_affectedarea`
- `crb_usersaffected`
- `crb_businessimpact`
- `crb_urgency`
- `crb_desiredoutcome`
- `crb_constraints`
- `crb_dependencies`
- `crb_acceptancecriteria`
- `crb_size`
- `crb_estimatedeffort`
- `crb_estimatedduration`
- `crb_confidence`
- `crb_missingrequirements`
- `crb_additionalinformation`
- `crb_conversationjson`
- `crb_status`

That shared contract is the architectural anchor: each app can have a different user experience, but the request data lands in a consistent structure for triage, reporting, automation, and developer handoff.
