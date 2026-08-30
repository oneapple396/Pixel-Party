# Pixel Playground Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair Troll Obby Level 2 and add a persistent shared point wallet, shop, inventory, and four consumable boosts across all three games.

**Architecture:** A new pure progression module owns versioned state, reward conversion, purchases, reservations, refunds, and consumption. The application creates one service and injects it into each existing game controller; controllers emit accomplishments and apply compatible boost effects without containing currency tables.

**Tech Stack:** HTML5, CSS3, ES modules, Canvas 2D, localStorage, CustomEvent, Node.js built-in test runner; no libraries or frameworks.

**Spec:** `docs/superpowers/specs/2026-08-29-pixel-playground-progression-design.md`

## Global Constraints

- Use only HTML, CSS, and JavaScript.
- Keep progression device-local and playable when storage is malformed or unavailable.
- Award each 2048 milestone and Troll Obby level at most once per run.
- Reserve a game-specific boost on activation, consume it only when applied, and refund it on navigation or restart before application.
- Keep Double Points active across navigation until the next positive reward.
- Make Troll Obby Level 2 achievable with keyboard and touch controls.

## File Map

- `js/progression.js`: state normalization, reward tables, wallet mutations, boost lifecycle, subscriptions, and service factory.
- `tests/progression.test.js`: wallet, rewards, anti-farming, purchase, reservation, refund, consumption, and Double Points tests.
- `js/obby.js`, `tests/obby.test.js`: repaired Level 2 geometry, route validator, deterministic physics route, shield, and level rewards.
- `js/tetris.js`, `tests/tetris.test.js`: row rewards and Slow Time effect.
- `js/game2048.js`, `tests/game2048.test.js`: milestone rewards and Undo state restoration.
- `js/app.js`: progression service construction, header/shop synchronization, toast announcements, and injection.
- `index.html`, `enhancements.css`: point balance, shop cards, boost trays, active indicators, and responsive presentation.

---

### Task 1: Progression Domain Service

**Files:**
- Create: `js/progression.js`
- Create: `tests/progression.test.js`

**Interfaces:**
- Consumes: a storage object with `get(key, fallback)` and `set(key, value)`.
- Produces: `normalizeProgression(value)`, `rewardFor(event)`, and `createProgression({ storage, notify })` with `snapshot()`, `earn(event, runState)`, `purchase(boostId)`, `activate(gameId, boostId)`, `consume(gameId, boostId)`, `refund(gameId)`, and `subscribe(listener)`.

- [ ] **Step 1: Write failing normalization and reward tests**

Use literal fixtures to require non-negative integer points/counts, ignore unknown keys, return a fresh version-1 record for malformed input, and map accomplishments to the exact reward tables in the specification.

- [ ] **Step 2: Verify the new test module fails**

Run `node --test tests/progression.test.js`; expect module-not-found for `js/progression.js`.

- [ ] **Step 3: Implement state normalization and pure reward mapping**

Define `BOOSTS` with costs `{ slowTime:60, undo:50, shield:50, doublePoints:75 }`, game compatibility, and labels. Implement `rewardFor({ game, rows, tile, level, noDeath })` so invalid or duplicate-domain inputs return zero.

- [ ] **Step 4: Pass normalization and reward tests**

Run `node --test tests/progression.test.js`; require the pure cases to pass.

- [ ] **Step 5: Write failing wallet mutation tests**

Cover successful and insufficient-funds purchases, compatible activation, incompatible rejection, reserved-item decrement, consumption, refund, Double Points applying once, persistence after every mutation, and subscriber notification.

- [ ] **Step 6: Implement the progression service**

Keep mutable state private, clone snapshots, persist after mutations, and use caller-owned run-state sets to reject paid 2048 milestones and obby levels already completed in the run. Emit `{ type, amount, label, state }` through `notify` and subscribers.

- [ ] **Step 7: Pass the complete progression suite**

Run `node --test tests/progression.test.js`, then `node --test`; require zero failures.

- [ ] **Step 8: Commit when Git is available**

Commit with `feat: add shared progression service`; otherwise record that this workspace is not a Git repository.

### Task 2: Repair and Validate Troll Obby Level 2

**Files:**
- Modify: `js/obby.js`
- Modify: `tests/obby.test.js`

**Interfaces:**
- Consumes: existing player dimensions and physics constants plus the progression service from Task 1.
- Produces: `validateRoute(level, physics) -> { valid, failures }`, `stepObby(state, input, level, dt)`, repaired Level 2 data, Shield consumption, and obby accomplishment events.

- [ ] **Step 1: Write a failing route-validation test**

Create a fixture matching the current Level 2 full-height blocker and assert failure reason `blocked-corridor`. Create the proposed four-platform geometry and assert no rise, gap, landing-width, or corridor failures.

- [ ] **Step 2: Verify the current implementation fails the new test**

Run `node --test tests/obby.test.js`; expect missing exports for `validateRoute` and `stepObby`.

- [ ] **Step 3: Extract deterministic physics and implement route validation**

Move one fixed-timestep update into `stepObby`. Calculate maximum rise as `jumpVelocity² / (2 * gravity)`, conservatively calculate horizontal travel, require landing width `>= playerWidth * 2`, and reject solid active hazards spanning the source-to-destination corridor.

- [ ] **Step 4: Replace Level 2 geometry**

Use platform ranges `0–280 @420`, `325–520 @350`, `545–740 @390`, and `755–940 @330`. Replace the full-height block with a `34×32` pop-up anchored at `x 455`, place the pit strictly below valid landing tops, and preserve the black/red pixel style.

- [ ] **Step 5: Add and pass a deterministic completion-path test**

Feed a recorded sequence of held-right and jump inputs to `stepObby` at `1/60` seconds. Require the player to overlap the Level 2 goal without a hazard collision within 20 simulated seconds.

- [ ] **Step 6: Integrate rewards and Shield**

Track `paidLevels` and `levelDeaths` per run. On first completion call `progression.earn({ game:'obby', level, noDeath: levelDeaths === 0 }, runState)`. Before `die()`, consume active Shield; if consumed, reset position without incrementing deaths and show `Shield saved you!`.

- [ ] **Step 7: Run obby and full regression suites**

Run `node --test tests/obby.test.js` and `node --test`; require zero failures.

- [ ] **Step 8: Commit when Git is available**

Commit with `fix: make troll obby level two achievable`; otherwise record the skipped commit.

### Task 3: Tetris and 2048 Rewards and Boosts

**Files:**
- Modify: `js/tetris.js`
- Modify: `tests/tetris.test.js`
- Modify: `js/game2048.js`
- Modify: `tests/game2048.test.js`

**Interfaces:**
- Consumes: progression service methods `earn`, `consume`, `refund`, and `snapshot`.
- Produces: Tetris row accomplishment events and Slow Time state; 2048 milestone events and one-use Undo state.

- [ ] **Step 1: Write failing Tetris boost and reward tests**

Assert row clear counts are reported unchanged, Slow Time changes an 800ms interval to 1280ms, respects the existing minimum interval before multiplication, lasts 30 seconds from the next spawn, and refunds when destroyed before the first spawn.

- [ ] **Step 2: Implement Tetris integration and pass its tests**

Inject `progression`; call `earn({ game:'tetris', rows: cleared })` after locking; start Slow Time on spawn, consume it once, display remaining seconds, and restore normal speed after 30 seconds.

- [ ] **Step 3: Write failing 2048 milestone and Undo tests**

Assert milestones derive from the maximum tile newly crossed, repeat milestones are ignored through run state, and Undo restores the exact pre-move board and score without retaining the spawned tile.

- [ ] **Step 4: Implement 2048 integration and pass its tests**

Before a valid move, capture `{ board, score }` when Undo is active. After animation, expose Undo; on use restore the snapshot and consume the boost. Report every newly crossed milestone to progression while maintaining a per-run paid set.

- [ ] **Step 5: Run both game suites and all regressions**

Run `node --test tests/tetris.test.js tests/game2048.test.js`, then `node --test`; require zero failures.

- [ ] **Step 6: Commit when Git is available**

Commit with `feat: add game rewards and consumable boosts`; otherwise record the skipped commit.

### Task 4: Header, Shop, Boost Trays, and Final Verification

**Files:**
- Modify: `index.html`
- Modify: `enhancements.css`
- Modify: `js/app.js`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: `BOOSTS`, `createProgression`, progression snapshots, subscriptions, and all enhanced game controllers.
- Produces: a synchronized point balance, shop, inventory controls, reward live region, and compatible per-game activation controls.

- [ ] **Step 1: Write failing application behavior tests**

Test a pure `shopViewModel(snapshot)` helper for exact costs, owned counts, affordability, and disabled state. Extend the shell test to require the point balance, shop landmark, live region, and one boost tray per game.

- [ ] **Step 2: Verify the app tests fail for missing UI and exports**

Run `node --test tests/app.test.js`; expect missing markup and `shopViewModel`.

- [ ] **Step 3: Add progression markup**

Add a header balance button, four shop cards with owned counts and Buy buttons, a polite live region, and compatible boost buttons in each game page. Use native buttons and explicit accessible names containing boost name and cost.

- [ ] **Step 4: Wire the shared service and UI**

Construct progression once in `app.js`, inject it into controllers, subscribe one render function, handle purchase/activation clicks through delegated listeners, and display reward/insufficient-funds messages without blocking play.

- [ ] **Step 5: Complete responsive and reduced-motion styling**

Style the shop as four compact arcade cards, keep the balance visible at phone widths, distinguish owned/active/disabled states with text plus color, and disable toast/purchase animation under `prefers-reduced-motion`.

- [ ] **Step 6: Run the full automated suite and syntax checks**

Run `node --test` and `node --check` on every file in `js/`; require zero failures and syntax errors.

- [ ] **Step 7: Perform browser verification**

Buy and activate each boost using a controlled test balance, earn points from all three games, refresh to verify persistence, verify insufficient-funds behavior, complete Level 2 with keyboard and touch controls, inspect console warnings/errors, and check phone and Chromebook layouts.

- [ ] **Step 8: Package the updated draft**

Create `outputs/pixel-playground-progression.zip` containing `index.html`, both stylesheets, `package.json`, `js`, `tests`, and `docs`. Verify the archive exists and report its SHA-256 checksum.

- [ ] **Step 9: Commit when Git is available**

Commit with `feat: add points shop and powerups`; otherwise keep the verified workspace in place.

