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

Build a PCF control for the Request Intake main form that:

- Reads the current record context from the model-driven form.
- Sends only scoped intake fields and the latest user message to the existing intake agent path.
- Displays a compact chat/assistant panel on the form.
- Lets the user apply suggested field updates back to Dataverse only after review.
- Shows busy/error states and never auto-commits generated content.

## Implementation Options

Preferred next step:

- Use a PCF control hosted on the `Request Intake` main form.
- Start by calling the existing `IntakeCopilot_CanvasRun` or a model-driven-specific wrapper flow for parity with the Canvas app.
- Later, move to `Xrm.Copilot.executeEvent()` / Copilot Studio Agent APIs if the tenant preview capability is available and stable enough.

Open items:

- Confirm whether `Xrm.Copilot` preview APIs are enabled in `SPDEV-Dev2`.
- Decide whether the PCF should render as a form section, side panel, or command-launched pane.
- Create a model-driven-specific flow or connector path if the Canvas wrapper flow's Power Apps trigger is not appropriate outside Canvas.
