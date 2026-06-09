# Request Intake Copilot

An agentic intake form starter for Power Platform request triage. The app asks follow-up questions, fills a structured request form, estimates request size and delivery effort, and creates an extra developer notes field for useful context.

This repo is built as a Power Apps code app using Vite, React, TypeScript, and the Microsoft Power Apps Vite plugin. It can also be used as the blueprint for a native Canvas app backed by Dataverse and Power Automate.

## What It Does

- Runs a guided intake conversation.
- Extracts and updates required request fields as the user answers.
- Classifies the problem category.
- Estimates size, effort, and rough duration.
- Tracks missing requirements and submission readiness.
- Populates `additionalInformation` with developer-oriented notes.
- Produces a Dataverse-friendly JSON payload, including conversation JSON and draft/submitted status.

## Local Run

Use PowerShell or Command Prompt on Windows.

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL shown by Vite.

Before you run `power-apps init` or `pac code init`, Vite may warn that `power.config.json` is missing. That is expected for the local-only starter; the file is created when the code app is initialized against a Power Platform environment.

## Build

```powershell
npm.cmd run lint
npm.cmd run build
```

## Safe Power Platform Publish Flow

Your active `pac` profile should be checked before publishing. Do not publish to production by accident.

```powershell
pac.cmd auth list
pac.cmd env list
```

Initialize the code app in the intended environment with the npm-based Power Apps CLI:

```powershell
npx.cmd power-apps init --environment-id <environment-id> --display-name "Request Intake Copilot" --description "Agent-assisted request intake form" --build-path ./dist --file-entry-point index.html --app-url http://127.0.0.1:5173
```

Build and publish:

```powershell
npm.cmd run build
npx.cmd power-apps push --environment-id <environment-id> --solution-id <solution-id-or-solution-unique-name>
```

Example:

```powershell
npx.cmd power-apps init --environment-id 00000000-0000-0000-0000-000000000000 --display-name "Request Intake Copilot" --build-path ./dist --file-entry-point index.html --app-url http://127.0.0.1:5173
npm.cmd run build
npx.cmd power-apps push --environment-id 00000000-0000-0000-0000-000000000000 --solution-id RequestIntakeCopilot
```

Older PAC command fallback:

```powershell
pac.cmd code init --environment <environment-url-or-id> --displayName "Request Intake Copilot" --description "Agent-assisted request intake form" --buildPath dist --fileEntryPoint index.html --appUrl http://127.0.0.1:5173
pac.cmd code push --environment <environment-url-or-id> --solutionName <solution-name>
```

## Canvas App Option

If you want this as a traditional Canvas app instead of a code app:

1. Create the Dataverse table described in [powerplatform/dataverse-request-table.md](./powerplatform/dataverse-request-table.md).
2. Create the Copilot Studio agent described in [powerplatform/copilot-studio-agent.md](./powerplatform/copilot-studio-agent.md).
3. Create a Power Automate agent flow/tool from [powerplatform/agent-flow-intakecopilot-run.md](./powerplatform/agent-flow-intakecopilot-run.md) with the inputs and outputs in [powerplatform/ai-prompt-contract.md](./powerplatform/ai-prompt-contract.md).
4. Add or update the formulas from [powerplatform/canvas-app-formulas.md](./powerplatform/canvas-app-formulas.md).
5. Bind the final form to the Dataverse request table.

For the exact maker-portal sequence and known environment IDs, use [powerplatform/maker-portal-setup-checklist.md](./powerplatform/maker-portal-setup-checklist.md).

Current `SPDEV-Dev2` status: the `Request Intake` Dataverse table, `Request Intake Copilot` agent, `IntakeCopilot_Run` workflow tool, and Canvas wrapper flow are provisioned in the `WorkManagementAgent` solution. The Canvas app saves drafts to Dataverse, includes a `Submit` button that patches the custom status choice as `Submitted`, and `btnSendAgentMessage` calls `IntakeCopilot_CanvasRun`.

For a code app flow hookup, initialize the app first, then add the solution-aware Power Apps-triggered flow:

```powershell
npx.cmd power-apps add-flow --environment-id <environment-id> --flow-id <flow-guid>
```

The code app's local Save and Submit actions currently stage records in browser storage. Both actions use the same Dataverse mapper:

- `Save draft` stores a payload with `crb_status: "Draft"`.
- `Submit request` stores a payload with `crb_status: "Submitted"`.
- Both include `crb_conversationjson` so a future flow or Dataverse write can preserve the intake transcript.

## Microsoft References

- Power Apps code apps overview: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview
- Add Power Automate flows to a code app: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows
- Use AI Builder prompts in Power Automate: https://learn.microsoft.com/en-us/ai-builder/use-a-custom-prompt-in-flow
- Create an agent flow as a tool: https://learn.microsoft.com/en-us/power-virtual-agents/advanced-flow-create
- Add an agent flow to an agent: https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-agent
- Trigger Power Automate from Canvas apps: https://learn.microsoft.com/en-in/power-apps/maker/canvas-apps/how-to/trigger-flow
