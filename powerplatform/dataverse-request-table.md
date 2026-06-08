# Dataverse Request Table

Create a table named `Request Intake` with logical name similar to `crb_intakerequest`.

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

- Category: Bug, Enhancement, Automation, Reporting, Access, Integration, Data, Process, Uncategorized
- Urgency: Low, Medium, High, Critical
- Size: Small, Medium, Large, Extra Large
- Status: Draft, Needs Review, Submitted, Accepted, Rejected

