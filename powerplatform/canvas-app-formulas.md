# Canvas App Formulas

These formulas show the native Canvas app version. Names are examples; adjust control and flow names to your app.

Current `SPDEV-Dev2` workflow note: deployed workflow `IntakeCopilot_Run` returns the JSON draft in the M365 Copilot action's `Response` output. It is attached to the Copilot Studio agent, but exact-name search in the Canvas Add data picker did not expose it as a Canvas-callable data source.

A Canvas-callable wrapper flow now exists:

- Flow name: `IntakeCopilot_CanvasRun`
- Flow ID: `337338cd-9d63-f111-ab0c-7c1e521c7ea3`
- Trigger: Power Apps V2
- Inputs, in order: `lastUserMessage`, `currentDraftJson`, `conversationJson`
- Output: `response` text containing the JSON draft

Add it from Power Apps Studio's `Power Automate` pane rather than the regular `Data` picker. It appears under `Add flow` > `Instant`.

## App OnStart

```powerfx
ClearCollect(
    colConversation,
    {
        role: "assistant",
        content: "Tell me what the user wants to request. I will ask follow-up questions and fill the intake fields as we go.",
        createdAt: Text(Now(), DateTimeFormat.UTC)
    }
);

Set(
    varDraft,
    {
        title: "",
        description: "",
        category: "Uncategorized",
        affectedArea: "",
        usersAffected: "",
        businessImpact: "",
        urgency: "Medium",
        desiredOutcome: "",
        constraints: "",
        dependencies: "",
        acceptanceCriteria: "",
        size: "Small",
        estimatedEffort: "",
        estimatedDuration: "",
        confidence: 0,
        missingRequirements: "",
        additionalInformation: ""
    }
);
```

## Send Button OnSelect

Use this formula when the screen has a simple reply box named `txtUserReply`.

```powerfx
Collect(
    colConversation,
    {
        role: "user",
        content: txtUserReply.Text,
        createdAt: Text(Now(), DateTimeFormat.UTC)
    }
);

Set(
    varAgentResponse,
        IntakeCopilot_CanvasRun.Run(
            txtUserReply.Text,
            JSON(varDraft, JSONFormat.Compact),
            JSON(colConversation, JSONFormat.Compact)
        )
);

Set(varParsedDraft, ParseJSON(varAgentResponse.response));

Set(
    varDraft,
    {
        title: Text(varParsedDraft.title),
        description: Text(varParsedDraft.description),
        category: Text(varParsedDraft.category),
        affectedArea: Text(varParsedDraft.affectedArea),
        usersAffected: Text(varParsedDraft.usersAffected),
        businessImpact: Text(varParsedDraft.businessImpact),
        urgency: Text(varParsedDraft.urgency),
        desiredOutcome: Text(varParsedDraft.desiredOutcome),
        constraints: Text(varParsedDraft.constraints),
        dependencies: Text(varParsedDraft.dependencies),
        acceptanceCriteria: Text(varParsedDraft.acceptanceCriteria),
        size: Text(varParsedDraft.size),
        estimatedEffort: Text(varParsedDraft.estimatedEffort),
        estimatedDuration: Text(varParsedDraft.estimatedDuration),
        confidence: Value(varParsedDraft.confidence),
        missingRequirements: Concat(Table(varParsedDraft.missingRequirements), Text(Value), "; "),
        additionalInformation: Text(varParsedDraft.additionalInformation)
    }
);

Collect(
    colConversation,
    {
        role: "assistant",
        content: Text(varParsedDraft.nextQuestion),
        createdAt: Text(Now(), DateTimeFormat.UTC)
    }
);

Reset(txtUserReply);
```

## Published Canvas Send Button OnSelect

Use this shorter formula for the currently exported Canvas app controls. It avoids app-level collections so it is easier to paste into Power Apps Studio's embedded formula editor:

- `txtAgentMessage`
- `txtAgentTranscript`
- `btnSendAgentMessage`
- `txtCategory`
- `txtEffort`
- `txtTimeline`
- `txtDeveloperNotes`

```powerfx
If(
    IsBlank(Trim(txtAgentMessage.Text)),
    Notify("Type a message for the intake agent first.", NotificationType.Warning),
    Set(varChatText, Trim(txtAgentMessage.Text));
    Set(
        varAgentResponse,
        IntakeCopilot_CanvasRun.Run(
            varChatText,
            JSON(
                {
                    title: Coalesce(txtProblem.Text, ""),
                    description: Coalesce(txtProblem.Text, ""),
                    category: Coalesce(varCategory, "Uncategorized"),
                    businessImpact: Coalesce(txtBusinessImpact.Text, ""),
                    estimatedEffort: Coalesce(varEffort, ""),
                    estimatedDuration: Coalesce(varTimeline, ""),
                    additionalInformation: Coalesce(txtAdditionalInfo.Text, "")
                },
                JSONFormat.Compact
            ),
            JSON(
                Table(
                    {
                        role: "user",
                        content: varChatText,
                        createdAt: Text(Now(), DateTimeFormat.UTC)
                    }
                ),
                JSONFormat.Compact
            )
        )
    );
    IfError(
        Set(varParsedDraft, ParseJSON(varAgentResponse.response));
        Set(varCategory, Coalesce(Text(varParsedDraft.category), "Uncategorized"));
        Set(varEffort, Coalesce(Text(varParsedDraft.estimatedEffort), ""));
        Set(varTimeline, Coalesce(Text(varParsedDraft.estimatedDuration), ""));
        Set(varQuestion, Coalesce(Text(varParsedDraft.nextQuestion), "I captured the latest message. Review the auto-filled fields and save the draft."));
        Set(varDeveloperNotes, "Developer notes: " & Coalesce(Text(varParsedDraft.additionalInformation), ""));
        Set(varConversationLog, Coalesce(varConversationLog, "Agent: Tell me what the requester needs. I will ask follow-up questions and fill the intake fields as we go.") & Char(10) & Char(10) & "You: " & varChatText & Char(10) & "Agent: " & varQuestion),
        Notify("The intake agent did not return a usable response. Please try again.", NotificationType.Error)
    );
    Reset(txtCategory);
    Reset(txtEffort);
    Reset(txtTimeline);
    Reset(txtDeveloperNotes);
    Reset(txtAgentTranscript);
    Reset(txtAgentMessage)
)
```

## Submit Button OnSelect

The live `btnSubmitRequest` formula mirrors `btnSaveDraft.OnSelect` below, but patches `'Status (crb_status)': 'Status (Request Intakes)'.Submitted` and shows `Notify("Request submitted to Dataverse.", NotificationType.Success)`.

The live button text is `Submit` and its width is `80` so its clickable area does not overlap the Copilot transcript panel.

## Save Draft Button OnSelect

```powerfx
Set(varSaveCategory, If(IsBlank(Lower(Coalesce(varCategory, txtCategory.Text, ""))), "Uncategorized", If("bug" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Bug", If("access" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Access", If("report" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Reporting", If("data" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Data", If("automation" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Automation", If("workflow" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Process", If("integration" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Integration", If("enhancement" in Lower(Coalesce(varCategory, txtCategory.Text, "")), "Enhancement", "Uncategorized"))))))))));
Set(varSaveUrgency, If(Or("urgent" in Lower(txtProblem.Text & " " & txtBusinessImpact.Text), "blocked" in Lower(txtProblem.Text & " " & txtBusinessImpact.Text), "outage" in Lower(txtProblem.Text & " " & txtBusinessImpact.Text)), "Critical", "Medium"));
Set(varSaveSize, If("large" in Lower(Coalesce(varEffort, txtEffort.Text, "")), "Large", If("medium" in Lower(Coalesce(varEffort, txtEffort.Text, "")), "Medium", "Small")));
Patch(
    'Request Intakes',
    Defaults('Request Intakes'),
    {
        'Request Title': If(IsBlank(Trim(txtRequestTitle.Text)), Left(Trim(txtProblem.Text), 80), Trim(txtRequestTitle.Text)),
        Description: If(IsBlank(Trim(txtProblem.Text)), "No description provided.", Trim(txtProblem.Text)),
        'Status (crb_status)': 'Status (Request Intakes)'.Draft,
        Category: Switch(varSaveCategory, "Bug", 'Category (Request Intakes)'.Bug, "Enhancement", 'Category (Request Intakes)'.Enhancement, "Automation", 'Category (Request Intakes)'.Automation, "Reporting", 'Category (Request Intakes)'.Reporting, "Access", 'Category (Request Intakes)'.Access, "Integration", 'Category (Request Intakes)'.Integration, "Data", 'Category (Request Intakes)'.Data, "Process", 'Category (Request Intakes)'.Process, 'Category (Request Intakes)'.Uncategorized),
        'Affected Area': varSaveCategory,
        'Users Affected': "",
        'Business Impact': If(IsBlank(Trim(txtBusinessImpact.Text)), "Not provided.", Trim(txtBusinessImpact.Text)),
        Urgency: Switch(varSaveUrgency, "Critical", 'Urgency (Request Intakes)'.Critical, "High", 'Urgency (Request Intakes)'.High, "Low", 'Urgency (Request Intakes)'.Low, 'Urgency (Request Intakes)'.Medium),
        'Desired Outcome': Coalesce(varQuestion, "Review and triage the intake request."),
        Constraints: txtAdditionalInfo.Text,
        Dependencies: "",
        'Acceptance Criteria': "",
        Size: Switch(varSaveSize, "Large", 'Size (Request Intakes)'.Large, "Medium", 'Size (Request Intakes)'.Medium, "Extra Large", 'Size (Request Intakes)'.'Extra Large', 'Size (Request Intakes)'.Small),
        'Estimated Effort': Coalesce(varEffort, txtEffort.Text, ""),
        'Estimated Duration': Coalesce(varTimeline, txtTimeline.Text, ""),
        Confidence: 0,
        'Missing Requirements': Coalesce(varQuestion, ""),
        'Additional Information': Coalesce(varDeveloperNotes, txtDeveloperNotes.Text, ""),
        'Conversation JSON': Coalesce(varConversationLog, "")
    }
);
Notify("Request draft saved to Dataverse.", NotificationType.Success)
```

The live Canvas app uses the generated disambiguated custom column label `Status (crb_status)` with the custom option set `Status (Request Intakes)`. `Save request draft` patches `Draft`; `Submit` uses the same payload shape and patches `Submitted`.
