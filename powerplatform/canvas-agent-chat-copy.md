# Canvas Agent Chat Copy

## App

- Original Canvas app: `Request Intake Copilot Canvas`
- Original app ID: `b524aff3-cb3e-4baa-bedc-8e006b7bae74`
- Comparison copy: `Request Intake Copilot Canvas - Agent Chat`
- Copy app ID: `fc5b4e4a-c6eb-4cd6-9c59-1b1ea31f48a6`
- Copy component name: `cr3d3_requestintakecopilotcanvasagentchat`
- Solution: `WorkManagementAgent`

The copy was created through solution ALM so the original app remains untouched for comparison.

## Direct Embedded Copilot Finding

The intended option 3 was to embed the existing Copilot Studio agent directly in the Canvas app for a more native chat experience. Current Microsoft guidance and the live Studio UI block that exact path for this newly copied app:

- `Add a custom Copilot to a canvas app` is the feature that connected an existing Copilot Studio agent, but Microsoft says adding it to new canvas apps was discontinued starting February 2, 2026.
- The older Copilot control was also discontinued for new canvas apps starting February 2, 2026, and it does not support enabling an existing Copilot Studio agent.
- Microsoft 365 Copilot in canvas apps is the replacement direction, but it is tenant/environment gated, preview-only, and focused on natural-language access to app data. It is not the same as embedding this existing intake agent.

Studio checks on the copied app did not expose `App Copilot`, `Copilot component`, `Edit in Copilot Studio`, or `M365 Copilot in canvas apps (Preview)` settings. The copy was also opened with `enableM365CopilotSetting=true`, but the General settings pane still did not show the M365 Copilot toggle.

## Practical Path

Keep the original app as the baseline and use the `Request Intake Copilot Canvas - Agent Chat` copy for any chat-experience experiments. Until a supported direct-embed option appears in the tenant, the safest implementation remains the current Canvas chat surface backed by `IntakeCopilot_CanvasRun`, with possible UX improvements such as optimistic transcript updates, a waiting indicator, disabled send state during flow execution, and clearer message layout.
