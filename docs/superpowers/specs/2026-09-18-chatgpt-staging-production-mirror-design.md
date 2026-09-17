# ChatGPT Staging Site — Production Frontend Mirror Design

Date: 2026-09-18
Status: Approved design, implementation not started

## Goal

Rebuild the ChatGPT Site staging environment at `https://zoom-support-navigator.cjeius08.chatgpt.site/` so it mirrors the current production Zoom Support Navigator frontend as closely as possible while intentionally omitting authentication and admin/backend-only behavior for now.

The staging site is a guinea-pig environment for UI/UX experiments before changes are later applied to the live GitHub Pages site.

## Source of truth

The production frontend in `cjeius08/zoom-support-navigator` is the canonical reference. The staging site must not be independently redesigned from screenshots or approximate descriptions. Layout, labels, content structure, navigation, training resources, icons, spacing, interaction patterns, and responsive behavior should follow the current production implementation.

## Staging principle

`Production agent-facing frontend - authentication/admin backend = ChatGPT staging site`

The staging site should feel like an already-signed-in agent session.

## Included views

### Navigator

Mirror the live Navigator experience, including:

- Support Console shell and branding
- Hero copy: “Find the next step without opening documents.”
- Search field for issue, symptom, or process name
- Search suggestions/autocomplete
- Keyboard-accessible search behavior
- `Locate → Describe → Guide → Confirm` workflow strip
- Category cards for:
  - Joining Meetings
  - Audio & Microphone
  - Camera & Video
  - Meeting Controls
  - Screen Sharing
  - Devices & App
  - Support Boundaries
- Distinct friendly icons for every category
- Common Issues / Fastest Routes panel
- Process result cards
- Clickable process detail drawer/view
- Current production process content and supporting resources
- Desktop and mobile responsive behavior
- Visible focus states, readable contrast, and reduced-motion support

### Training & Resources

Mirror the current production training library, including:

- Same page title and introductory copy
- Same searchable/filterable video library
- Same current training video dataset from production
- Same category filters
- Same thumbnails
- Same video modal/player behavior
- Previous / Next navigation
- Open on YouTube action
- Same related-category tags

The staging training library should be driven by the same production content structure rather than a smaller placeholder set.

### Feedback

Mirror the production Feedback page visually and structurally. Backend submission may be disabled or converted to a clearly non-persistent staging interaction if the ChatGPT Site cannot use the production backend safely.

## Shell and navigation

The staging site should mirror the live Support Console shell:

- Header layout
- Sidebar layout
- Typography
- Spacing
- Colors
- Icons
- Mobile navigation behavior
- Current favicon/brand treatment

Agent-facing navigation should include:

- Navigator
- Training & Resources
- Feedback

A fake/static account area should remain in the upper-right so the layout stays visually faithful to production. It should look like an agent profile but should not depend on real authentication or Supabase.

Suggested staging identity:

- Initials/avatar: neutral demo value
- Username: `staging_agent` or equivalent
- Role label: `Agent`

The account control may either be non-interactive or open a harmless mock profile panel; no password or account actions should call production services.

## Explicitly excluded for this phase

Do not include or require:

- Sign In page
- Activate Account flow
- Supabase authentication
- Password reset/change behavior
- Team Management
- Usage Analytics
- Admin Home
- Feedback Queue admin view
- Real user presence
- Real account/session state
- Invite code generation

These may be added later only if explicitly requested.

## Content fidelity

The staging site should use the production repository as the content source of truth. Avoid rewriting, shortening, or paraphrasing process content unless the production site itself changes.

Where possible, reuse the same logical datasets and labels used by production so the staging site does not drift.

## Visual fidelity

The objective is not “production-inspired.” It is a production frontend mirror suitable for safe UI/UX experimentation.

Priority order:

1. Information architecture and navigation
2. Content parity
3. Layout and spacing
4. Colors, typography, icons, and component styling
5. Interaction behavior
6. Responsive/mobile behavior
7. Accessibility behavior

Minor platform-specific differences are acceptable only where ChatGPT Site capabilities prevent exact parity.

## Interaction behavior

The staging site should preserve the main agent workflows:

- Search → suggestion → process detail
- Category → filtered process list
- Common issue → process detail
- Training search/filter → video modal
- Sidebar navigation between agent-facing views
- Keyboard navigation and escape/close behavior where present in production

No interaction should silently call production account-management services.

## Architecture

Use a staging-only frontend composition that mirrors production components conceptually:

- `AppShell` equivalent for header/sidebar/account chrome
- `Navigator` equivalent for support process discovery
- `TrainingResources` equivalent for training library
- `Feedback` equivalent for agent feedback UI
- Shared production-derived datasets for processes and training resources
- Staging-only mock profile/session state

Authentication should be bypassed at the staging entry point rather than partially emulated throughout components.

## Error handling

If a production-only backend action is unavailable in staging:

- Do not leave a dead button with no explanation.
- Either hide the backend-only action or make it visibly non-persistent/staging-only.
- Never expose production secrets or service-role credentials.

## Accessibility requirements

The staging mirror should retain or improve the production accessibility behavior:

- Keyboard-operable navigation
- Visible focus states
- Accessible labels
- Combobox/listbox semantics for search suggestions
- Dialog semantics for drawers/modals where applicable
- Escape-to-close behavior where present
- Readable color contrast
- Reduced-motion support

## Testing / acceptance criteria

The staging implementation is acceptable when:

1. A user familiar with the live site can navigate the staging site without relearning the layout.
2. Navigator content and primary interactions match production.
3. Training & Resources contains the current production training library and behaves the same way.
4. The staging shell closely matches the production header/sidebar/profile treatment.
5. Login/admin pages are absent, and the site opens directly into the agent workspace.
6. No production account-management call is required for normal staging use.
7. Desktop and mobile layouts are usable and visually consistent with production.
8. Search, drawers/modals, navigation, and training filters are keyboard accessible.

## Future phase: interactive Zoom training simulator

The previously discussed clickable Zoom-like training environment is intentionally out of scope for this mirror phase. It should be designed and implemented only after the staging site reaches production frontend parity, so the simulator can be developed inside a stable replica of the real Support Console.
