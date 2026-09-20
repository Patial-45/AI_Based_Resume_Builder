# Design overhaul specification

2026-09-09. Proposed visual/interaction direction, not an implemented redesign. All current feature categories stay in scope. Build each vertical module's UI with its API and tests; do not postpone all styling until the last day.

## Product feel

A calm professional workspace: warm neutral background, white editing surfaces, dark readable type and one blue accent. The resume is the central object; actions and status are clear without large decorative hero panels. Keep details available through tabs, expandable analysis and a side panel. Motion communicates state changes and never hides controls.

## Information architecture

Desktop sidebar: Overview, Resumes, Match & improve, Job discovery, History. Builder is prominent inside Resumes and accessible through a persistent “Create resume” action. Profile/settings sit at the bottom. Preserve current URLs with redirects where labels change. On mobile use a labelled menu, compact top bar and single-column content; never squeeze desktop navigation into 768px.

```text
┌────────────────┬─────────────────────────────────────────────────┐
│ Resume Builder │ Resumes / Frontend resume      Saved   Export   │
│                ├─────────────────────────────────────────────────┤
│ Overview       │ Frontend resume                                 │
│ Resumes        │ Updated today · Version 2                       │
│ Match & improve├──────────────────────────┬──────────────────────┤
│ Job discovery  │ Edit content             │ Document preview     │
│ History        │ Contact                  │ Name + contact       │
│                │ Summary                  │ Summary              │
│                │ Experience               │ Experience           │
│                │ Education / skills       │ Education / skills   │
│                │ + Add section            │ Projects             │
│ Profile        │ [Save changes]           │ [Full preview]       │
└────────────────┴──────────────────────────┴──────────────────────┘
```

On small screens: Edit / Preview tabs with a clear saved-state label and a bottom action row that respects safe areas and keyboard focus. Long resumes scroll naturally; export actions never overlap content. AI suggestions open in a separate panel with before/after and explicit Apply/Dismiss. Do not replace typed edits automatically.

## Tokens and typography

| Token | Proposed value / use |
|---|---|
| Canvas / surface / subtle | #F7F8FA / #FFFFFF / #F0F3F7 |
| Main text / secondary text | #172033 / #526078 |
| Accent / accent hover | #245BDB / #1947B5 |
| Border / focus | #D8DEE8 / #245BDB, visible 2px outline plus offset |
| Success / warning / danger | #176344 / #805500 / #B42318, with text/icon and pale surfaces |
| Typeface | Self-hosted Inter if licensed asset available; system UI fallback. One family, weights 400/500/600/700; no new font provider needed |
| Page title | 30–32px desktop, 26px mobile; line-height 1.2; weight 600 |
| Section heading | 20px/28px, weight 600 |
| Body / form input | 16px/24px; avoid input zoom on mobile |
| Label / metadata | 14px/20px; 12px only for nonessential compact metadata |
| Text measure | 60–75 characters for explanatory prose; constrain wide panels |
| Spacing | 4/8/12/16/24/32/48px scale; page gutters 24–32 desktop, 16 mobile |
| Radius / shadow | 10px controls, 14px panels; subtle shadow only for overlays/elevated affordances |
| Numbers | Tabular numerals for scores, dates and progress |

These colors are proposed tokens, not measured accessibility certification. Verify every foreground/background pairing and state. Font files, if added, must be shipped locally with appropriate license and fallback metrics to limit layout shift.

## Motion specification

| Interaction | Effect | Timing / reduced motion |
|---|---|---|
| Button hover/press | Color and subtle 1px press only; no static-card lift | 120ms; no transform under reduced motion |
| Panel/dialog opening | Opacity plus 4–8px translation | 180–220ms ease-out; opacity only or instant under reduced motion |
| Tab switching | Immediate content replacement with subtle fade | 120–160ms; instant under reduced motion |
| Save state | Saving → Saved text/icon, screen-reader announcement | No fake delay or confetti |
| Upload/scan | Real byte progress when available; named stages otherwise | Never animate fabricated percent; cancel/retry remains available |
| Page entry | Small opacity transition once | ≤180ms; avoid repeated motion on every fetch |

Use CSS transitions first. Add a motion library only for a concrete need that cannot be handled simply. Do not animate layout dimensions for long lists or scroll automatically on every update. Reduced-motion rules must also cover smooth scrolling, skeleton pulse and score fills.

## Screen-by-screen changes

| Screen | Primary task | Proposed composition and required states |
|---|---|---|
| Login/register | Access account | Focused form, visible labels, show/hide password, autocomplete, concise credential errors, recovery link only if functional. Remove unrelated decorative feature tiles. |
| Overview | Continue useful work | Resume “continue editing” panel, recent analysis and saved job activity. Secondary metrics explicitly say last five/all-time. Separate empty account from failed fetch. |
| Resumes/upload | Build a trusted document | Library with name/date/status; visible menu actions on touch and focus. Keyboard browse/dropzone, format/cap text, progress, extraction review and error recovery. |
| Builder | Edit and export | Contact + section editor, full document preview, save/version status, undo of suggestion, complete export. One template done well. |
| Match | Understand fit | Resume version selector + JD input; result tabs Overview, Keywords, Recommendations. Explain unavailable score components and avoid employer/ATS guarantees. Link directly to editable sections. |
| History | Reopen prior evidence | Search/filter/paginated compact list; stable detail URL and side-by-side input metadata. Preserve immutable result meaning. |
| Jobs | Find and track actual roles | Resume selector, saved/applied filters, location/remote controls only when backed by data. Source health/staleness, real listings, score method, clear Save/Applied/Ignore and undo. |
| Profile | Manage identity/preferences | Account and preference groups; currency/period for salary, validated range, persistent successful save reflected in navbar. Processing/privacy settings clearly named. |

## Shared components to complete in M1

Button with correct type/loading/disabled semantics; Input/Textarea/Select with IDs, labels, helper/error linkage; labelled IconButton; StatusBadge; EmptyState; ErrorState with retry; Skeleton with aria-busy on region; Dialog with Escape/focus management; Tabs with keyboard behavior; Toast/inline alerts with appropriate live regions; ConfirmationDialog for deletion; Progress with accessible values; responsive AppShell.

Do not nest buttons inside links. Noninteractive cards should not behave visually like buttons. Critical errors live inline until resolved; toasts supplement them. Every form handles editing, invalid, submitting, success and failure, and preserves inputs after recoverable errors.

## Responsive and accessibility acceptance

Test 360, 390, 768, 1024 and 1440px layouts; long names, filenames, company names, 50 skills and two-page resume content. At 200% zoom, no trapped controls or horizontal page scroll. Touch actions have at least a 44px practical target. Focus is visible; dialogs trap and restore it. Keyboard users can browse/upload, edit, apply suggestions, export, save jobs and log out. Screen readers hear labels, errors and status changes. Color is never the only indicator. Validate contrast, reduced motion and OS high-contrast behavior on staging.

## Design gate

M1 demonstrates shell/controls in all states. Each later module records desktop/mobile screenshots and a keyboard smoke check before acceptance. M6 runs the complete visual regression and exported-document QA. Owner review is required for any proposed feature removal; no feature removal is currently approved. Do not mark visual QA complete from source inspection alone.
## Module 1 implementation update

The first shared design slice now includes a neutral canvas, dark slate text, one blue action color, restrained borders/shadows, system sans typography, a responsive navigation menu and consistent authentication/settings forms. Motion is limited to brief entrance/interaction transitions and disabled for prefers-reduced-motion. Inputs have explicit label/error associations. Native dialogs add focus wrapping, Escape dismissal and restoration.

This applies to foundation/identity/shared controls. The existing dashboard, resume, match, builder and job screens still need their respective module redesigns and full state/visual testing. Screenshots and browser results live in docs/m1; no full-platform redesign acceptance is implied.

