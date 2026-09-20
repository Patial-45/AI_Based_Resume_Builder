# Module 1 and Module 2 design proposal

Prepared September 10, 2026. **Proposal only; awaiting owner approval.** These wireframes describe screen structure, not implemented screens or completed visual testing. No application code, approved design tokens, routes or module acceptance status changes with this document.

## Direction shared by both modules

Develop the calm professional workspace proposed in the existing Design.md: a pale neutral canvas, white work surfaces, dark readable text and one blue action color. The document and the user's next task lead the screen. This proposal refines the existing direction; it does not introduce a new brand.

Working audience assumption: an individual job seeker managing resumes and tailoring reviewed facts to a job description. The existing product scope includes matching, editing, export and job discovery. All current feature categories remain available in navigation.

Use Impeccable's Operate guidance for task hierarchy, complete states, accessibility and consistency. Use Emil Design Engineering for feedback, focus behavior and purposeful motion. Design Taste's marketing compositions are reserved for suitable public pages; its installed version excludes dense app interfaces.

### Shared visual specification

| Element | Proposed treatment |
|---|---|
| App typeface | Keep the current system sans stack for this iteration, with deliberate sizing and weights. A custom font is a separate approval choice; no font asset or external provider is required for this proposal. |
| Type hierarchy | Page title 32/40px desktop and 26/34px mobile; section title 20/28px; body and inputs 16/24px; labels and supporting text 14/20px. Weights 400, 500 and 600. |
| Palette | Canvas #F7F8FA; surface #FFFFFF; text #172033; supporting text #526078; accent #245BDB; hover #1947B5; border #D8DEE8. Validate actual text, control and focus contrast during implementation. |
| Status | Green for ready/saved, amber for needs review, red for failure. Always accompany color with an explicit label and, where helpful, an icon. |
| Spacing | 4, 8, 12, 16, 24, 32 and 48px. Desktop page gutters 32px; mobile 16px. Form groups receive more space than fields within a group. |
| Shape | 10px control radius, 14px major surface radius. Borders separate content; shadows are reserved for overlays. |
| Controls | Practical 44px touch targets, persistent labels, visible focus and named icon actions. Primary action blue; secondary actions outlined; destructive actions explicit. |
| Content width | Shared page header grid. Settings form capped around 880px; library can use the remaining workspace; review uses two readable panes. |
| Icons | Keep the existing Feather icon family through react-icons. One consistent stroke and size treatment. |

### App navigation

Propose a 224px desktop sidebar at wide widths, replacing the current horizontal signed-in navigation. Keep existing labels and URLs: Overview, Resumes, Match a role, Resume builder, Find jobs, Match history and Settings. Place Settings and Sign out at the bottom. Do not hide existing features or invent new routes as part of this proposal.

Below approximately 1024px, use a compact header with a labeled menu button and an accessible navigation drawer. At 200% zoom, allow the compact layout to take over. The sidebar scrolls when viewport height is limited; sign-out must remain reachable.

This shell change affects every signed-in screen, including legacy feature screens. It requires layout regression across those screens before acceptance, even though their detailed redesign belongs to later modules.

## Module 1: settings and identity

### Settings desktop wireframe

```text
┌───────────────────┬─────────────────────────────────────────────────┐
│ Resume Builder    │ Account settings                                │
│                   │ Manage your profile, preferences and security.  │
│ Overview          │                                                 │
│ Resumes           │ [Profile & preferences]  [Security]             │
│ Match a role      │                                                 │
│ Resume builder    │ Profile                                         │
│ Find jobs         │ Full name                 Email address         │
│ Match history     │ [                    ]    [Read-only          ] │
│                   │                          Email changes unavailable│
│                   │                                                 │
│                   │ Job preferences                                 │
│                   │ Preferred job title       Preferred location    │
│                   │ [                    ]    [                   ] │
│                   │ Minimum annual salary     Maximum annual salary │
│                   │ [                    ]    [                   ] │
│                   │ [ ] Prefer remote roles                         │
│                   │ Salary filtering is not available yet.          │
│ Settings          │                                                 │
│ Sign out          │ Unsaved changes                 [Save changes]  │
└───────────────────┴─────────────────────────────────────────────────┘
```

Profile and preferences remain one save transaction, matching the current API. Preserve the existing field names and ordering. Use visual section headings to separate account details from job preferences. The proposed tabs are local view state under the existing settings route.

The Security view contains two clear tasks: change password and create a recovery code. Each action explains what happens before submission. A recovery-code dialog retains the existing one-time display warning and explicit acknowledgment. Do not imply email recovery, email editing or active-session management exists.

Changing views or leaving with unsaved changes requires a discard/stay decision. Successful saves update the account context and show an inline confirmation near the action. Failed saves preserve edits and show a persistent error. Security errors stay with their task; secrets must not appear in general notifications.

### Mobile settings wireframe

```text
┌──────────────────────────────┐
│ Resume Builder        [Menu] │
├──────────────────────────────┤
│ Account settings             │
│ Manage your account.         │
│ [Profile] [Security]         │
│                              │
│ Profile                      │
│ Full name                    │
│ [                          ] │
│ Email address                │
│ [Read-only                 ] │
│                              │
│ Job preferences              │
│ Fields stack in reading order│
│                              │
│ Unsaved changes              │
│ [       Save changes       ] │
└──────────────────────────────┘
```

Keep actions in normal document flow on small screens so they do not cover fields or the software keyboard. The wireframe abbreviates the form; implementation retains every field and explanation.

### Other Module 1 screens

- Login, registration and recovery share the same form width, labels, button heights, error treatment and type scale. Keep route-specific actions and honest recovery limitations.
- Retain the existing desktop authentication composition unless review identifies a specific problem; mobile keeps the form as the focus.
- Session loading, session failure with retry, not-found and signed-out states reuse the same spacing and feedback components.
- Preserve keyboard focus restoration, CSRF behavior, session expiry handling and all existing identity tests.

## Module 2: resume library, upload and review

### Library desktop wireframe

```text
┌───────────────────┬─────────────────────────────────────────────────┐
│ Resume Builder    │ Resumes                         [Upload resume] │
│                   │ Manage your originals and reviewed content.     │
│ Overview          │                                                 │
│ Resumes           │ Name                    Status        Action    │
│ Match a role      │ ─────────────────────────────────────────────── │
│ Resume builder    │ Frontend resume         Needs review [Review] ⋮ │
│ Find jobs         │ PDF · Updated Sep 10                            │
│ Match history     │                                                 │
│                   │ Product engineer        Ready         [Open] ⋮ │
│                   │ DOCX · Updated Sep 9                            │
│                   │                                                 │
│                   │ General resume          Ready         [Open] ⋮ │
│                   │ TXT · Updated Sep 8                             │
│                   │                                                 │
│ Settings          │ PDF, DOCX or TXT · Up to configured upload limit│
│ Sign out          │                                                 │
└───────────────────┴─────────────────────────────────────────────────┘
```

Names and dates above are synthetic examples. Each row has a clear Open or Review action. Its labeled action menu exposes rename, download original and delete. Actions remain discoverable on touch and keyboard, not just hover. A filename may wrap; metadata must not push actions off-screen.

Avoid making the whole row an interactive element containing other buttons. Use an explicit name link and separate controls. Do not display an ATS score in this library before a real analysis exists. Module 3 owns matching scores and results.

On mobile, each row becomes a compact stacked item: name, status and metadata followed by its primary action and menu. Keep the same content and status language. No horizontal table scrolling is needed.

### Upload flow

1. **Choose:** Upload resume opens a focused dialog with keyboard Browse and drag-and-drop support, permitted types and the server-configured size cap.
2. **Confirm:** Show selected filename and size, Replace file and Upload. Reject invalid files with inline guidance before submitting where possible; server validation remains authoritative.
3. **Process:** Show real byte progress when available, then an indeterminate Reading document stage. Never present a fabricated percentage or a successful parse before the server confirms it.
4. **Review:** Open the extracted-content review view. An empty or scanned document gets an honest explanation and retry guidance; no invented work history fills the gap.

Prevent duplicate submissions. Closing a processing dialog must not imply cancellation unless the server actually supports it; provide explicit behavior and a visible way to recover the resulting record.

### Review desktop wireframe

```text
┌───────────────────┬─────────────────────────────────────────────────┐
│ Resume Builder    │ Resumes / Frontend resume                       │
│                   │ Review extracted content          Needs review  │
│ Shared navigation │ Check the facts before using this resume.       │
│                   ├───────────────────────┬─────────────────────────┤
│                   │ Original extraction   │ Reviewed content        │
│                   │ [Download original]   │ Contact                 │
│                   │                       │ [Editable fields]       │
│                   │ Read-only source text │ Summary                 │
│                   │ with preserved breaks │ [Editable text]         │
│                   │                       │ Experience / Education  │
│                   │                       │ Skills / Other sections │
│                   │                       │ [Add missing content]   │
│                   ├───────────────────────┴─────────────────────────┤
│ Settings          │ Unsaved changes        [Save reviewed content] │
│ Sign out          │                                                 │
└───────────────────┴─────────────────────────────────────────────────┘
```

Use source text as the consistent review baseline for PDF, DOCX and TXT. Download original preserves the actual file. Do not promise an in-browser DOCX facsimile or pixel-perfect reproduction of the uploaded layout. Formatted template preview and PDF/DOCX generation belong to Module 4.

On mobile, use Source / Edit tabs, retain the draft when switching, and show the save state in both views. Saving records a reviewed version; the original file remains separate. An older concurrent edit must produce a conflict message rather than silently overwrite newer work. Exact storage/version contracts are implemented and verified in Module 2.

### State coverage

| State | Visible behavior |
|---|---|
| Empty library | Explain the first step; one Upload resume action and accepted formats. |
| Loading | Stable placeholders and a named busy region. |
| Fetch failure | Persistent error with Retry; never the empty-library success message. |
| Needs review | Explain extraction uncertainty and lead to Review. |
| Ready | Content has met the review contract; does not mean a guaranteed ATS pass. |
| Save failure | Preserve edits and provide Retry. |
| Save conflict | Explain a newer version exists; preserve the local draft for reconciliation. |
| Delete | Confirmation names the resume and accurately states implemented retention/deletion behavior; do not promise undo unless supported. |
| Unsupported/scanned file | Explain the limitation and how to supply supported text. |
| Session expiry | Preserve recoverable draft state according to the privacy contract and request sign-in without suggesting an unsaved draft is safe on the server. |

## Interaction consistency

| Before: current implementation or gap | After: proposed behavior | Why |
|---|---|---|
| Signed-in navigation runs across the top | Shared wide-screen sidebar and compact-screen menu | Keeps the same destinations accessible as workspace content grows. |
| Profile and security use a shared page-level status | Task-local success/error feedback | Makes it clear which action succeeded or needs attention. |
| Resume fetch errors rely on a toast | Persistent library error with Retry | Distinguishes failure from having no documents. |
| Upload and library lack a complete review flow | Dedicated source-to-reviewed-content view | Makes factual correction an explicit part of the workflow. |
| Individual screens choose spacing and actions independently | Shared page header, form group, action row and feedback components | Carries the same visual rules into Modules 3–5. |

Proposed motion: 120–160ms button feedback; 180–220ms dialog/drawer transitions using opacity and small movement; immediate keyboard tab changes; no repeated page animation during typing or data refresh. Reduced motion removes positional movement. Save confirmations follow actual responses without cosmetic delay. Menus restore focus to their trigger; dialogs support Escape and visible focus.

## Implementation and acceptance after approval

1. Apply the approved shared tokens/components and M1 shell/settings adjustments. Re-run affected identity flows and inspect every signed-in route for shell regressions.
2. Record the M1 design evidence and outstanding operational gate separately. This proposal does not accept M1 staging or deployment.
3. Implement M2 library, upload and review with its API/storage/version contracts, then test the full workflow before moving on.
4. Reuse the approved system for matching/history, builder/export and jobs as their modules begin. Update durable design documentation only after the direction is approved.

Acceptance checks: desktop 1440px and compact/mobile 1024/768/390/360px; 200% zoom; keyboard-only upload, review, save and delete; screen-reader labels/status; contrast and reduced motion; long filenames and two-page content; invalid/corrupt files; two-user isolation; reload/persistence; save conflict; provider-independent parsing failures. Preserve evidence and distinguish mocks from real integrations.

## Approval requested

Approve or revise these three decisions together: **shared light workspace with desktop sidebar; settings grouped into Profile & preferences and Security views; resume library with a dedicated source/content review view.** Approval covers the design direction, not a claim that backend functionality or production readiness is complete. The next implementation step remains subject to the module gates and any explicit owner direction about them.
