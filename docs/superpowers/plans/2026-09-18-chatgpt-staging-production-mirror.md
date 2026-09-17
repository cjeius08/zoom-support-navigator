# ChatGPT Staging Production Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing ChatGPT Site staging environment so it mirrors the live Zoom Support Navigator agent-facing frontend while bypassing authentication and all admin/backend-only behavior.

**Architecture:** Treat `cjeius08/zoom-support-navigator` on `main` as the canonical source of truth. The staging Site should reuse the same component boundaries and production datasets (`Navigator`, `ProcessDrawer`, process parsing, training library, feedback UI, shell, styles) but enter directly into a mock signed-in agent session. Backend-only callbacks become staging-safe no-ops or local success states; no Supabase auth/admin code should be imported into the staging entry point.

**Tech Stack:** React 19, Vite-style component structure, CSS, Vitest, Testing Library. Target deployment is the existing ChatGPT Site at `https://zoom-support-navigator.cjeius08.chatgpt.site/`.

**Spec:** `docs/superpowers/specs/2026-09-18-chatgpt-staging-production-mirror-design.md`

## Global Constraints

- The production frontend in `cjeius08/zoom-support-navigator` is the canonical reference.
- Do not redesign from screenshots or prose; mirror production component structure, labels, content, spacing, icons, interactions, and responsive behavior.
- Staging principle: `Production agent-facing frontend - authentication/admin backend = ChatGPT staging site`.
- Agent-facing navigation is exactly: `Navigator`, `Training & Resources`, `Feedback`.
- The staging site opens directly into the agent workspace; do not show Sign In or Activate Account.
- Do not import or call Supabase authentication, password, invite, presence, usage, admin, or account-management services.
- Keep a fake/static account area in the upper-right so shell geometry matches production.
- Use the current production process dataset and training dataset without shortening or paraphrasing content.
- Keep keyboard accessibility, visible focus states, dialog semantics, escape-to-close behavior, readable contrast, and reduced-motion support.
- The interactive Zoom training simulator is out of scope for this plan.
- Modify the currently referenced ChatGPT Site; do not create a second staging site.
- Before replacing files in the Site editor, inspect its current file tree once and map the canonical paths below onto the existing project. If the Site uses different filenames, replace the corresponding existing files rather than creating a duplicate parallel app.

---

### Task 1: Replace the staging entry point with a mock signed-in agent shell

**Files:**
- Modify/replace in staging Site: `src/App.jsx`
- Create/replace in staging Site: `src/features/shell/StagingAppShell.jsx`
- Test: `src/App.test.jsx`
- Reference only: production `src/features/shell/AppShell.jsx`

**Interfaces:**
- Consumes: `Navigator`, `TrainingResources`, `FeedbackPage`.
- Produces: `StagingAppShell({ children, currentView, onNavigate })` and a top-level `App()` that never imports auth/admin services.

- [ ] **Step 1: Write the failing staging-entry test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('opens directly in the agent workspace without authentication', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /find the next step/i })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /support console/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /activate account/i })).not.toBeInTheDocument()
})

test('shows only agent-facing navigation', async () => {
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getByRole('button', { name: /navigator/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /training & resources/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^feedback$/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /team management/i })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /training & resources/i }))
  expect(screen.getByRole('heading', { name: /training & resources/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because the current staging app still uses its own layout and/or auth flow.

- [ ] **Step 3: Implement the staging-only entry point**

Use this shape; do not import `authApi`, `adminApi`, or Supabase:

```jsx
import { useState } from 'react'
import { Navigator } from './features/navigator/Navigator'
import { TrainingResources } from './features/training/TrainingResources'
import { FeedbackPage } from './features/feedback/FeedbackPage'
import { StagingAppShell } from './features/shell/StagingAppShell'
import './styles.css'
import './accessibility-ui.css'

export default function App() {
  const [view, setView] = useState('navigator')
  const [feedback, setFeedback] = useState([])

  const content = view === 'training'
    ? <TrainingResources />
    : view === 'feedback'
      ? <FeedbackPage onSubmit={async payload => setFeedback(items => [...items, payload])} />
      : <Navigator
          onFeedback={async payload => setFeedback(items => [...items, payload])}
          onOpenTraining={() => setView('training')}
        />

  return <StagingAppShell currentView={view} onNavigate={setView}>{content}</StagingAppShell>
}
```

Create `StagingAppShell.jsx` by reproducing the production shell geometry and nav labels, but use a static profile:

```jsx
const agentLinks = [
  ['navigator', 'Navigator'],
  ['training', 'Training & Resources'],
  ['feedback', 'Feedback'],
]

const stagingProfile = { username: 'staging_agent', initials: 'SA', role: 'Agent' }
```

The profile control may open a harmless mock panel with `staging_agent`, `SA`, and `Agent`; it must not expose password, logout, invite, admin, or Supabase actions.

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run: `npm test -- --run src/App.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/App.jsx src/App.test.jsx src/features/shell/StagingAppShell.jsx
git commit -m "feat: add staging agent shell"
```

---

### Task 2: Mirror Navigator, process content, and process drawer exactly from production

**Files:**
- Replace in staging Site from production source: `src/features/navigator/Navigator.jsx`
- Replace in staging Site from production source: `src/features/navigator/ProcessDrawer.jsx`
- Replace in staging Site from production source: `src/features/navigator/processText.js`
- Replace in staging Site from production source: `src/data/processes.js`
- Replace/copy required production visual/source assets referenced by `processes.js`
- Test: `src/features/navigator/Navigator.test.jsx`
- Test: `src/features/navigator/processText.test.js`

**Interfaces:**
- Consumes: `PROCESSES`, `buildCallGuide`, `processSections`, `relatedTrainingForCategory`, `assetUrl`.
- Produces: production-parity search, category filtering, common-issue routing, process cards, and the four-tab process drawer (`Call Guide`, `Visual Guide`, `Source Pages`, `Full Process`).

- [ ] **Step 1: Write the failing parity test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigator } from './Navigator'

test('renders the seven production categories and fastest routes', () => {
  render(<Navigator />)
  for (const label of [
    'Joining Meetings', 'Audio & Microphone', 'Camera & Video',
    'Meeting Controls', 'Screen Sharing', 'Devices & App', 'Support Boundaries',
  ]) expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument()
  expect(screen.getByText('Common Issues')).toBeInTheDocument()
})

test('search suggestion opens the production process drawer', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const input = screen.getByRole('combobox', { name: /search support processes/i })
  await user.type(input, 'camera')
  expect(screen.getByRole('listbox', { name: /search suggestions/i })).toBeInTheDocument()
  await user.click(screen.getAllByRole('option')[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Call Guide' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Visual Guide' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Source Pages' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Full Process' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- --run src/features/navigator/Navigator.test.jsx src/features/navigator/processText.test.js`

Expected: FAIL if the staging Site still has abbreviated categories, placeholder content, or a simplified drawer.

- [ ] **Step 3: Replace staging Navigator files with the current production files**

Canonical production sources to copy without paraphrasing:

```text
src/features/navigator/Navigator.jsx
src/features/navigator/ProcessDrawer.jsx
src/features/navigator/processText.js
src/data/processes.js
```

Preserve the production `commonIssues` IDs, search scoring, combobox/listbox semantics, category icon SVG paths, drawer tab labels, copy buttons, step anchors (`call-step-*`), visual/source-page behavior, and related-training links.

Only staging-specific adaptation allowed in `Navigator.jsx`: the `onFeedback` callback may resolve locally instead of calling Supabase.

- [ ] **Step 4: Copy all process-linked assets used by `processes.js`**

Do not replace missing production visuals with placeholders. Every `images[]` and `visualReferences[].image` path in the mirrored dataset must resolve in staging. Use the production repository asset paths as the canonical set.

- [ ] **Step 5: Run parity tests and source-data tests**

Run:

```bash
npm test -- --run src/features/navigator/Navigator.test.jsx src/features/navigator/processText.test.js src/data/processes.source.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit/checkpoint**

```bash
git add src/features/navigator src/data/processes.js public
git commit -m "feat: mirror production navigator content"
```

---

### Task 3: Mirror the production Training & Resources library

**Files:**
- Replace in staging Site from production source: `src/features/training/TrainingResources.jsx`
- Replace in staging Site from production source: `src/data/trainingVideos.js`
- Test: `src/features/training/TrainingResources.test.jsx`

**Interfaces:**
- Consumes: `TRAINING_CATEGORIES`, `TRAINING_VIDEOS`, `trainingEmbedUrl`.
- Produces: searchable/filterable training cards and modal video viewer with Previous, Next, and Open on YouTube.

- [ ] **Step 1: Write the failing training parity test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrainingResources } from './TrainingResources'

test('shows the production training library and filters it', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)
  expect(screen.getByRole('heading', { name: /training & resources/i })).toBeInTheDocument()
  expect(screen.getByText(/31 videos available/i)).toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: /filter training by category/i }), 'Camera & Video')
  expect(screen.getAllByRole('button', { name: /watch video/i }).length).toBeGreaterThan(0)
})

test('opens the production-style training viewer', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)
  await user.click(screen.getAllByRole('button', { name: /watch video/i })[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /open on youtube/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- --run src/features/training/TrainingResources.test.jsx`

Expected: FAIL if staging has a placeholder/minimal resources page.

- [ ] **Step 3: Replace both files with current production versions**

Copy exactly from production:

```text
src/features/training/TrainingResources.jsx
src/data/trainingVideos.js
```

Do not shorten the playlist. Keep the current 31 entries, category tags, `youtube-nocookie.com` embed behavior, thumbnail URLs, and Previous/Next viewer navigation.

- [ ] **Step 4: Run and verify GREEN**

Run: `npm test -- --run src/features/training/TrainingResources.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/features/training src/data/trainingVideos.js
git commit -m "feat: mirror production training library"
```

---

### Task 4: Mirror Feedback while keeping staging non-persistent

**Files:**
- Replace in staging Site from production source: `src/features/feedback/FeedbackPage.jsx`
- Replace in staging Site from production source: `src/features/feedback/FeedbackForm.jsx`
- Test: `src/features/feedback/FeedbackPage.test.jsx`

**Interfaces:**
- Consumes: `onSubmit(payload)` supplied by staging `App`.
- Produces: production-like feedback form and a staging-local success state only.

- [ ] **Step 1: Write the failing feedback test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackPage } from './FeedbackPage'

test('submits feedback without a production backend', async () => {
  const user = userEvent.setup()
  const submitted = []
  render(<FeedbackPage onSubmit={async payload => submitted.push(payload)} />)
  expect(screen.getByRole('heading', { name: 'Feedback' })).toBeInTheDocument()
  // Fill the required production FeedbackForm controls by their labels, then submit.
  // The assertion target is the local callback, never a network request.
  expect(submitted).toHaveLength(0)
})
```

Before finalizing this test, inspect the production `FeedbackForm.jsx` labels and replace the comment with explicit `user.selectOptions` / `user.type` calls for every required field. The finished test must contain no comment placeholder.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- --run src/features/feedback/FeedbackPage.test.jsx`

Expected: FAIL until the production form structure is present.

- [ ] **Step 3: Mirror the production Feedback components**

Use production markup/copy, but pass the staging-local callback from Task 1. Do not import `feedbackApi.js`, Supabase, or admin queue logic.

When submission resolves, retain the production success presentation but change backend-specific wording from `JA can review the report in the Feedback Queue.` to `Saved in this staging session only.` so the staging site does not imply persistence.

- [ ] **Step 4: Complete the explicit test inputs and verify GREEN**

Run: `npm test -- --run src/features/feedback/FeedbackPage.test.jsx`

Expected: PASS and no network/auth dependency.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/features/feedback src/App.jsx
git commit -m "feat: add staging-safe feedback flow"
```

---

### Task 5: Mirror production visual language, icons, favicon, and responsive behavior

**Files:**
- Replace/merge in staging Site: `src/styles.css`
- Replace/merge in staging Site: `src/accessibility-ui.css`
- Copy from production: `public/support-console-icon.svg`
- Copy all shell/process assets required by `assetUrl(...)`
- Modify staging Site: `index.html`
- Test: `src/features/shell/StagingAppShell.test.jsx`

**Interfaces:**
- Consumes: class names emitted by Tasks 1–4.
- Produces: production-parity header/sidebar, warm dark visual language, category icons, process drawer, training/feedback surfaces, mobile navigation, focus states, and reduced-motion behavior.

- [ ] **Step 1: Write the failing shell visual-structure test**

```jsx
import { render, screen } from '@testing-library/react'
import { StagingAppShell } from './StagingAppShell'

test('keeps the production shell structure and static staging profile', () => {
  render(<StagingAppShell currentView="navigator" onNavigate={() => {}}><div>content</div></StagingAppShell>)
  expect(screen.getByText('zoom')).toBeInTheDocument()
  expect(screen.getByText('Support Console')).toBeInTheDocument()
  expect(screen.getByText('staging_agent')).toBeInTheDocument()
  expect(screen.getByText('Agent')).toBeInTheDocument()
  expect(screen.getAllByTestId('nav-icon')).toHaveLength(3)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- --run src/features/shell/StagingAppShell.test.jsx`

- [ ] **Step 3: Port production CSS rather than restyling from scratch**

Start from the current production `src/styles.css` and `src/accessibility-ui.css`. Remove only selectors that are exclusively for Sign In, Activate Account, Team Management, Usage Analytics, Feedback Queue, or admin lifecycle dialogs if they are unused in staging. Do not change the production color/spacing values for shared agent-facing components.

- [ ] **Step 4: Restore favicon and brand treatment**

Ensure `index.html` contains:

```html
<link rel="icon" type="image/svg+xml" href="/support-console-icon.svg" />
<title>Zoom Support Console</title>
```

If the ChatGPT Site requires a base-path helper, use its generated asset base rather than hard-coding a GitHub Pages path.

- [ ] **Step 5: Verify responsive and accessibility CSS**

Confirm the mirrored CSS contains production behavior for:

```css
@media (max-width: 700px) { /* mobile sidebar + content */ }
@media (prefers-reduced-motion: reduce) { /* animation/transition reduction */ }
```

Also preserve `.search-suggestions`, `.category-icon-*`, `.drawer-backdrop`, `.process-drawer`, `.training-*`, `.feedback-*`, `:focus-visible`, and mobile navigation rules.

- [ ] **Step 6: Run targeted tests**

Run:

```bash
npm test -- --run src/features/shell/StagingAppShell.test.jsx src/features/navigator/Navigator.test.jsx src/features/training/TrainingResources.test.jsx
```

Expected: PASS.

- [ ] **Step 7: Commit/checkpoint**

```bash
git add src/styles.css src/accessibility-ui.css public/support-console-icon.svg index.html
git commit -m "style: mirror production console visuals"
```

---

### Task 6: Integration, keyboard, and no-backend verification

**Files:**
- Test: `src/staging.integration.test.jsx`
- Audit: all staging files under `src/`

**Interfaces:**
- Consumes: completed staging app.
- Produces: proof that normal staging use needs no production account-management backend.

- [ ] **Step 1: Write the integration test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('supports the main staging workflow with keyboard-accessible navigation', async () => {
  const user = userEvent.setup()
  render(<App />)

  const search = screen.getByRole('combobox', { name: /search support processes/i })
  await user.type(search, 'microphone')
  await user.keyboard('{ArrowDown}{Enter}')
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /training & resources/i }))
  expect(screen.getByRole('heading', { name: /training & resources/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /^feedback$/i }))
  expect(screen.getByRole('heading', { name: /^feedback$/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run integration test and verify RED/GREEN as appropriate**

Run: `npm test -- --run src/staging.integration.test.jsx`

Expected after Tasks 1–5: PASS.

- [ ] **Step 3: Audit for forbidden backend imports**

Run:

```bash
rg "supabase|authApi|adminApi|loginWithUsername|activateAccount|runAdminAction|loadUsage|loadTeam" src
```

Expected: no matches in the staging application path. If shared source files contain production-only imports, replace those imports with staging-safe props/adapters; do not ship credentials or service-role keys.

- [ ] **Step 4: Run complete verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: all pass with no runtime import errors.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/staging.integration.test.jsx
git commit -m "test: verify staging production mirror"
```

---

### Task 7: Visual acceptance audit against the live production site

**Files:**
- No new production code unless a discrepancy is found.
- Reference: `https://cjeius08.github.io/zoom-support-navigator/`
- Target: `https://zoom-support-navigator.cjeius08.chatgpt.site/`

**Interfaces:**
- Consumes: deployed staging Site from Tasks 1–6.
- Produces: a parity-checked staging mirror ready for future UI/UX experiments.

- [ ] **Step 1: Compare desktop shell**

At the same viewport width, compare header height, sidebar width, logo/brand position, nav spacing, content offset, static profile geometry, background, and typography. Fix staging to match production rather than changing production.

- [ ] **Step 2: Compare Navigator**

Verify exact hero copy, workflow strip, seven category cards, category icons, fastest routes, search suggestions, process-card metadata, and process drawer tabs/content.

- [ ] **Step 3: Compare Training & Resources**

Verify 31 current videos, search, categories, thumbnails, tags, Watch Video behavior, modal layout, Previous/Next, and Open on YouTube.

- [ ] **Step 4: Compare mobile behavior**

At a phone-width viewport, verify sidebar toggle, no horizontal page overflow, usable search suggestions, readable category cards, and process drawer sizing.

- [ ] **Step 5: Keyboard pass**

Using keyboard only, verify sidebar navigation, search suggestion ArrowUp/ArrowDown/Enter/Escape, process drawer Escape, tab buttons, training modal close/navigation, and visible focus states.

- [ ] **Step 6: Final verification after any parity fixes**

Run again:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 7: Final commit/checkpoint**

```bash
git add -A
git commit -m "fix: complete staging frontend parity audit"
```

## Self-review notes

- Spec coverage: shell, Navigator, process content, training resources, Feedback, fake profile, no auth/admin, visual parity, responsive behavior, accessibility, and backend exclusion are all assigned to explicit tasks.
- Scope: the Zoom interactive training simulator remains intentionally excluded.
- Data parity: `src/data/processes.js` and `src/data/trainingVideos.js` are copied from production rather than rewritten.
- Backend safety: Task 1 removes auth/admin entry points; Task 4 makes Feedback local-only; Task 6 explicitly audits forbidden imports.
- Platform caveat: the public `chatgpt.site` URL is not fetchable from the current tool environment, so the implementation worker must inspect the existing Site source tree at execution time and replace the matching files in-place rather than creating a separate site.
