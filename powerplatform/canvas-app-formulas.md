# Canvas App Formulas

These formulas show the native Canvas app version. Names are examples; adjust control and flow names to your app.

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
    IntakeCopilot_Run.Run(
        JSON(colConversation, JSONFormat.Compact),
        JSON(varDraft, JSONFormat.Compact),
        txtUserReply.Text
    )
);

Set(varParsedDraft, ParseJSON(varAgentResponse.draftJson));

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

## Submit Button OnSelect

```powerfx
Patch(
    'Request Intakes',
    Defaults('Request Intakes'),
    {
        'Request Title': varDraft.title,
        Description: varDraft.description,
        Category: varDraft.category,
        'Affected Area': varDraft.affectedArea,
        'Users Affected': varDraft.usersAffected,
        'Business Impact': varDraft.businessImpact,
        Urgency: varDraft.urgency,
        'Desired Outcome': varDraft.desiredOutcome,
        Constraints: varDraft.constraints,
        Dependencies: varDraft.dependencies,
        'Acceptance Criteria': varDraft.acceptanceCriteria,
        Size: varDraft.size,
        'Estimated Effort': varDraft.estimatedEffort,
        'Estimated Duration': varDraft.estimatedDuration,
        Confidence: varDraft.confidence,
        'Missing Requirements': varDraft.missingRequirements,
        'Additional Information': varDraft.additionalInformation,
        'Conversation JSON': JSON(colConversation, JSONFormat.Compact),
        Status: "Submitted"
    }
);
```

