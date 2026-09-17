# ChatGPT Staging Production Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing ChatGPT Site staging environment so it mirrors the live Zoom Support Navigator agent-facing frontend while bypassing authentication and all admin/backend-only behavior.

**Architecture:** Treat `cjeius08/zoom-support-navigator` on `main` as the canonical source of truth. Mirror the production agent-facing component boundaries and datasets (`Navigator`, `ProcessDrawer`, process parsing, Training & Resources, Feedback, shell, styles), but enter directly into a mock signed-in agent session. Backend-only actions are replaced by staging-safe local state; no Supabase auth/admin services are imported by the staging entry point.

**Tech Stack:** React 19, Vite-style component structure, CSS, Vitest, Testing Library. Target deployment is the existing ChatGPT Site at `https://zoom-support-navigator.cjeius08.chatgpt.site/`.

**Spec:** `docs/superpowers/specs/2026-09-18-chatgpt-staging-production-mirror-design.md`

## Global Constraints

- Production `cjeius08/zoom-support-navigator` is the source of truth; do not redesign from screenshots or prose.
- Staging principle: `Production agent-facing frontend - authentication/admin backend = ChatGPT staging site`.
- Agent navigation is exactly `Navigator`, `Training & Resources`, `Feedback`.
- Open directly into the agent workspace; no Sign In or Activate Account.
- No Supabase auth, password, invite, presence, usage, admin, or account-management calls.
- Keep a fake/static profile area in the upper-right for visual parity.
- Copy current production process/training data without shortening or paraphrasing.
- Preserve keyboard accessibility, focus states, dialog semantics, Escape-to-close, contrast, and reduced-motion behavior.
- Interactive Zoom simulator is out of scope.
- Modify the currently referenced ChatGPT Site; do not create another site.
- At execution start, inspect the existing Site source tree once. If its filenames differ, replace the corresponding existing files rather than creating a duplicate parallel app.

---

### Task 1: Staging entry point and static agent shell

**Files:**
- Modify/replace: `src/App.jsx`
- Create/replace: `src/features/shell/StagingAppShell.jsx`
- Test: `src/App.test.jsx`
- Reference: production `src/features/shell/AppShell.jsx`

**Interfaces:**
- Consumes: `Navigator`, `TrainingResources`, `FeedbackPage`.
- Produces: `StagingAppShell({ children, currentView, onNavigate })`; `App()` with no auth/admin imports.

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('opens directly in the agent workspace without authentication', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /find the next step/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /activate account/i })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument()
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

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL while the staging Site still uses its own layout/auth flow.

- [ ] **Step 3: Implement the staging-only entry point**

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

  const submitFeedback = async payload => setFeedback(items => [...items, payload])
  const content = view === 'training'
    ? <TrainingResources />
    : view === 'feedback'
      ? <FeedbackPage onSubmit={submitFeedback} />
      : <Navigator onFeedback={submitFeedback} onOpenTraining={() => setView('training')} />

  return <StagingAppShell currentView={view} onNavigate={setView}>{content}</StagingAppShell>
}
```

In `StagingAppShell.jsx`, mirror production header/sidebar structure and use:

```jsx
const agentLinks = [
  ['navigator', 'Navigator'],
  ['training', 'Training & Resources'],
  ['feedback', 'Feedback'],
]
const stagingProfile = { username: 'staging_agent', initials: 'SA', role: 'Agent' }
```

The profile control may open a harmless mock panel showing those values. Do not expose password, logout, invite, admin, or Supabase actions.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --run src/App.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/App.jsx src/App.test.jsx src/features/shell/StagingAppShell.jsx
git commit -m "feat: add staging agent shell"
```

---

### Task 2: Production Navigator, process data, and process drawer parity

**Files:**
- Replace from production: `src/features/navigator/Navigator.jsx`
- Replace from production: `src/features/navigator/ProcessDrawer.jsx`
- Replace from production: `src/features/navigator/processText.js`
- Replace from production: `src/data/processes.js`
- Copy all production assets referenced by `processes.js`
- Test: `src/features/navigator/Navigator.test.jsx`
- Test: `src/features/navigator/processText.test.js`
- Test: `src/data/processes.source.test.js`

**Interfaces:**
- Consumes: `PROCESSES`, `buildCallGuide`, `processSections`, `relatedTrainingForCategory`, `assetUrl`.
- Produces: production search/autocomplete, category filtering, common routes, process cards, and four-tab process drawer.

- [ ] **Step 1: Write failing parity tests**

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
  for (const tab of ['Call Guide', 'Visual Guide', 'Source Pages', 'Full Process']) {
    expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument()
  }
})
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/navigator/Navigator.test.jsx src/features/navigator/processText.test.js`

Expected: FAIL if staging still has abbreviated content or a simplified drawer.

- [ ] **Step 3: Copy canonical production files without paraphrasing**

```text
src/features/navigator/Navigator.jsx
src/features/navigator/ProcessDrawer.jsx
src/features/navigator/processText.js
src/data/processes.js
```

Preserve production `commonIssues` IDs, search scoring, combobox/listbox semantics, SVG category icons, drawer tab labels, copy actions, `call-step-*` anchors, source pages, visual references, and related training links. The only staging-specific behavior is that `onFeedback` resolves locally.

- [ ] **Step 4: Copy every process-linked asset**

Every path from `process.images[]` and `process.visualReferences[].image` must resolve in staging. Do not substitute placeholders.

- [ ] **Step 5: Verify GREEN and source fidelity**

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

### Task 3: Production Training & Resources parity

**Files:**
- Replace from production: `src/features/training/TrainingResources.jsx`
- Replace from production: `src/data/trainingVideos.js`
- Test: `src/features/training/TrainingResources.test.jsx`

**Interfaces:**
- Consumes: `TRAINING_CATEGORIES`, `TRAINING_VIDEOS`, `trainingEmbedUrl`.
- Produces: searchable/filterable training cards and modal viewer with Previous/Next/Open on YouTube.

- [ ] **Step 1: Write failing tests**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrainingResources } from './TrainingResources'

test('shows the current production training library and filters it', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)
  expect(screen.getByRole('heading', { name: /training & resources/i })).toBeInTheDocument()
  expect(screen.getByText(/31 videos available/i)).toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: /filter training by category/i }), 'Camera & Video')
  expect(screen.getAllByRole('button', { name: /watch video/i }).length).toBeGreaterThan(0)
})

test('opens the production-style video viewer', async () => {
  const user = userEvent.setup()
  render(<TrainingResources />)
  await user.click(screen.getAllByRole('button', { name: /watch video/i })[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /open on youtube/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/training/TrainingResources.test.jsx`

Expected: FAIL while staging has placeholder/minimal resources.

- [ ] **Step 3: Copy exact production files**

```text
src/features/training/TrainingResources.jsx
src/data/trainingVideos.js
```

Keep all current 31 entries, category tags, `youtube-nocookie.com` embed behavior, thumbnail URLs, and Previous/Next navigation.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --run src/features/training/TrainingResources.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/features/training src/data/trainingVideos.js
git commit -m "feat: mirror production training library"
```

---

### Task 4: Production Feedback UI with staging-only persistence

**Files:**
- Replace from production: `src/features/feedback/FeedbackPage.jsx`
- Replace from production: `src/features/feedback/FeedbackForm.jsx`
- Test: `src/features/feedback/FeedbackPage.test.jsx`

**Interfaces:**
- Consumes: `onSubmit(payload)` supplied by staging `App`.
- Produces: production-like feedback form and local-only success state.

- [ ] **Step 1: Write failing feedback test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackPage } from './FeedbackPage'

test('submits feedback to the local staging callback', async () => {
  const user = userEvent.setup()
  const submitted = []
  render(<FeedbackPage onSubmit={async payload => submitted.push(payload)} />)

  await user.selectOptions(screen.getByLabelText('Type'), 'ui_ux')
  await user.type(screen.getByLabelText('What did you notice?'), 'The card spacing is too tight.')
  await user.type(screen.getByLabelText('Suggested change (optional)'), 'Increase the vertical gap.')
  await user.click(screen.getByRole('button', { name: /send feedback/i }))

  expect(submitted).toEqual([{
    type: 'ui_ux',
    what_noticed: 'The card spacing is too tight.',
    suggested_change: 'Increase the vertical gap.',
    page_label: 'Feedback',
  }])
  expect(screen.getByRole('heading', { name: /feedback sent/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/feedback/FeedbackPage.test.jsx`

Expected: FAIL until production form structure is present.

- [ ] **Step 3: Mirror production Feedback components with one staging copy change**

Use production structure/labels. Pass the local callback from Task 1 and do not import `feedbackApi.js` or Supabase. After successful submission, use:

```jsx
<div className="empty-state">
  <h2>Feedback sent</h2>
  <p>Saved in this staging session only.</p>
  <button onClick={() => setSent(false)}>Send another report</button>
</div>
```

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --run src/features/feedback/FeedbackPage.test.jsx`

Expected: PASS and no network/auth dependency.

- [ ] **Step 5: Commit/checkpoint**

```bash
git add src/features/feedback src/App.jsx
git commit -m "feat: add staging-safe feedback flow"
```

---

### Task 5: Production visual language, icons, favicon, and responsive behavior

**Files:**
- Replace/merge: `src/styles.css`
- Replace/merge: `src/accessibility-ui.css`
- Copy: `public/support-console-icon.svg`
- Copy all assets used by production `assetUrl(...)`
- Modify: `index.html`
- Test: `src/features/shell/StagingAppShell.test.jsx`

**Interfaces:**
- Consumes: class names emitted by Tasks 1–4.
- Produces: production-parity shell, warm dark UI, category icons, drawer, training/feedback surfaces, mobile navigation, focus states, reduced motion.

- [ ] **Step 1: Write failing shell-structure test**

```jsx
import { render, screen } from '@testing-library/react'
import { StagingAppShell } from './StagingAppShell'

test('keeps production shell structure with a static staging profile', () => {
  render(<StagingAppShell currentView="navigator" onNavigate={() => {}}><div>content</div></StagingAppShell>)
  expect(screen.getByText('zoom')).toBeInTheDocument()
  expect(screen.getByText('Support Console')).toBeInTheDocument()
  expect(screen.getByText('staging_agent')).toBeInTheDocument()
  expect(screen.getByText('Agent')).toBeInTheDocument()
  expect(screen.getAllByTestId('nav-icon')).toHaveLength(3)
})
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/shell/StagingAppShell.test.jsx`

- [ ] **Step 3: Port production CSS rather than restyling from scratch**

Start from production `src/styles.css` and `src/accessibility-ui.css`. Remove only selectors exclusively used by auth/admin views if they are unused in staging. Keep shared production color, spacing, radius, typography, drawer, category, training, feedback, and mobile values unchanged.

- [ ] **Step 4: Restore favicon and title**

```html
<link rel="icon" type="image/svg+xml" href="/support-console-icon.svg" />
<title>Zoom Support Console</title>
```

If the Site uses a generated base-path helper, use that helper rather than a GitHub Pages path.

- [ ] **Step 5: Preserve accessibility/responsive selectors**

The staging CSS must retain production rules for `.search-suggestions`, `.category-icon-*`, `.drawer-backdrop`, `.process-drawer`, `.training-*`, `.feedback-*`, `:focus-visible`, phone-width navigation, and:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 6: Verify GREEN**

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
- Audit: staging `src/`

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: proof that normal staging use needs no account-management backend.

- [ ] **Step 1: Write integration test**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('supports the main agent workflow with keyboard-accessible navigation', async () => {
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

- [ ] **Step 2: Run integration test**

Run: `npm test -- --run src/staging.integration.test.jsx`

Expected after Tasks 1–5: PASS.

- [ ] **Step 3: Audit forbidden backend imports**

```bash
rg "supabase|authApi|adminApi|loginWithUsername|activateAccount|runAdminAction|loadUsage|loadTeam" src
```

Expected: no matches in the staging application path. Shared production-only modules should not be imported by staging.

- [ ] **Step 4: Complete verification**

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

### Task 7: Visual acceptance audit against production

**Files:**
- Reference: `https://cjeius08.github.io/zoom-support-navigator/`
- Target: `https://zoom-support-navigator.cjeius08.chatgpt.site/`
- No code change unless a discrepancy is found.

**Interfaces:**
- Consumes: deployed Tasks 1–6.
- Produces: parity-checked staging mirror ready for UI/UX experiments.

- [ ] **Step 1: Compare desktop shell**

At the same viewport width compare header height, sidebar width, brand position, nav spacing, content offset, static profile geometry, background, typography, and card spacing. Fix staging to match production; do not change production.

- [ ] **Step 2: Compare Navigator**

Verify exact hero copy, workflow strip, seven categories, icons, fastest routes, search suggestions, process metadata, and all four drawer tabs/content.

- [ ] **Step 3: Compare Training & Resources**

Verify the current 31 videos, search, category filters, thumbnails, tags, video modal, Previous/Next, and Open on YouTube.

- [ ] **Step 4: Compare mobile behavior**

At phone width verify sidebar toggle, no horizontal overflow, usable search suggestions, readable category cards, and process drawer sizing.

- [ ] **Step 5: Keyboard pass**

Verify sidebar navigation, search ArrowUp/ArrowDown/Enter/Escape, process drawer Escape, tab controls, training modal close/navigation, and visible focus states.

- [ ] **Step 6: Final verification after parity fixes**

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

- Spec coverage: shell, Navigator, process content, Training & Resources, Feedback, fake profile, no auth/admin, visual parity, responsive behavior, accessibility, and backend exclusion all map to explicit tasks.
- Placeholder scan: no `TBD`, `TODO`, incomplete test steps, or unspecified validation actions remain.
- Interface consistency: `onNavigate`, `onFeedback`, `onOpenTraining`, and `onSubmit` names stay consistent across tasks.
- Scope remains limited to frontend mirror parity; the interactive Zoom training simulator is intentionally excluded.
- The public `chatgpt.site` URL is not fetchable from the current tool environment, so the implementation worker must inspect the existing Site source tree in the Site editor and replace matching files in-place rather than creating a separate site.
