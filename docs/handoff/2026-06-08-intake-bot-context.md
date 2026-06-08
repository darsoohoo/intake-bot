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
- Canvas editor URL:
  `https://make.powerapps.com/e/543d442f-0b4a-e67b-89eb-1e32c0622907/canvas/?action=edit&form-factor=tablet&name=Request+Intake+Copilot+Canvas&solution-id=5f0fcba3-5f63-f111-ab0c-7c1e521c7ea3&app-id=%2Fproviders%2FMicrosoft.PowerApps%2Fapps%2Fb524aff3-cb3e-4baa-bedc-8e006b7bae74`
- Canvas play URL:
  `https://apps.powerapps.com/play/e/543d442f-0b4a-e67b-89eb-1e32c0622907/a/b524aff3-cb3e-4baa-bedc-8e006b7bae74`

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

## Important Local Files

- `AGENTS.md`: project-specific Codex instructions.
- `README.md`: code app setup and Power Platform publish notes.
- `src/App.tsx`: React code app UI.
- `src/intakeEngine.ts`: request analysis logic for the React code app.
- `powerplatform/ai-prompt-contract.md`: AI/Copilot prompt contract.
- `powerplatform/canvas-app-formulas.md`: Canvas formula design notes.
- `powerplatform/dataverse-request-table.md`: Dataverse table shape.
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

## Continuation Notes

- Prefer editing the live Canvas app in Power Apps Studio for nontrivial visual changes. The CLI can download/unpack the Canvas source, but `pac canvas pack` hit a local JSON parse error on the downloaded source.
- Treat `canvas/RequestIntakeCopilotCanvas-src` as a review/export artifact, not the only source of truth.
- The current Canvas app uses rule-based Power Fx for triage. It does not yet call a real Copilot Studio agent, AI Builder prompt, Power Automate flow, or Dataverse submit action.
- The most valuable next build step is likely connecting `Save request draft` to Dataverse or adding a Power Automate/AI Builder/Copilot Studio action behind `Send to agent`.
- This folder was not a Git repo when this handoff was written.

