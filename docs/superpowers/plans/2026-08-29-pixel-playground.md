# Pixel Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, framework-free browser arcade with playable Tetris, 2048, and a three-level 2D troll obby.

**Architecture:** A single semantic HTML shell uses hash routing to mount exactly one game controller at a time. Each game owns its state and renderer behind the shared `mount`, `pause`, `resume`, and `destroy` lifecycle, while pure rule helpers are independently testable with Node's built-in test runner.

**Tech Stack:** HTML5, CSS3, ES modules, Canvas 2D, Web Audio API, localStorage, Node.js built-in test runner; no libraries or frameworks.

**Spec:** `docs/superpowers/specs/2026-08-29-pixel-playground-design.md`

## Global Constraints

- Use only HTML, CSS, and JavaScript.
- Load no downloads, accounts, ads, external assets, libraries, or frameworks.
- Support both keyboard and on-screen touch controls in every game.
- Keep all score and settings data on the current device through optional `localStorage`.
- Honor `prefers-reduced-motion`, include visible focus states, and keep touch targets at least 44 pixels.
- Stop timers, animation frames, and input listeners whenever a game is unmounted.

## File Map

- `index.html`: shared application shell, homepage cards, game view containers, and accessible overlays.
- `styles.css`: visual tokens, arcade layout, responsive rules, controls, board presentation, and reduced-motion rules.
- `js/app.js`: routing, game registry, settings/storage helpers, shared audio, and lifecycle coordination.
- `js/tetris.js`: pure Tetris rules plus DOM renderer and controller.
- `js/game2048.js`: pure 2048 rules plus DOM renderer and controller.
- `js/obby.js`: pure collision/trigger helpers plus canvas engine, level data, and controller.
- `tests/tetris.test.js`, `tests/game2048.test.js`, `tests/obby.test.js`: rule-level regression tests.
- `package.json`: scripts for test and a static local server without dependencies.

---

### Task 1: Arcade Shell and Routing

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `js/app.js`
- Create: `package.json`

**Interfaces:**
- Consumes: browser `hashchange`, `localStorage`, and the game modules introduced later.
- Produces: `storage.get(key, fallback)`, `storage.set(key, value)`, `registerGame(hash, controller)`, and route lifecycle calls to `mount(root)`, `pause()`, `resume()`, `destroy()`.

- [ ] **Step 1: Create a smoke test for the shell**

Create a temporary Node test in `tests/app.test.js` that reads `index.html` and asserts the presence of `#home`, `#tetris`, `#2048`, `#obby`, three game links, a viewport meta tag, and the module entry script.

- [ ] **Step 2: Run the smoke test and verify failure**

Run `node --test tests/app.test.js` and expect failure because `index.html` does not exist.

- [ ] **Step 3: Build the smallest recognizable homepage slice**

Create the semantic header, “Pixel Playground” hero, responsive three-card grid, card links to the three hashes, empty game containers, and CSS-only artwork. Add `package.json` with `"type": "module"` and `"test": "node --test"`. Keep all cards visible without requiring network content.

- [ ] **Step 4: Implement routing and safe storage**

In `js/app.js`, normalize unknown hashes to `#home`, toggle `[data-view]` sections, update `document.title`, and call the active controller lifecycle. Wrap storage reads, JSON parsing, and writes in `try/catch`; return the supplied fallback on failure.

- [ ] **Step 5: Pass the shell test and manually verify routing**

Run `npm test`, serve the folder locally, visit each hash, use browser Back, and verify that only one view is visible at a time.

- [ ] **Step 6: Commit the independently usable shell when Git is available**

Stage `index.html`, `styles.css`, `js/app.js`, `package.json`, and `tests/app.test.js`; commit with `feat: add arcade shell and routing`. If the workspace remains outside Git, record the skipped commit in the execution notes.

### Task 2: Tetris

**Files:**
- Create: `js/tetris.js`
- Create: `tests/tetris.test.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: a root element containing `[data-tetris-board]`, `[data-tetris-next]`, score fields, and labeled action buttons; `storage` from `app.js`.
- Produces: `createTetrisController({ storage })`, `collides(board, piece, x, y)`, `rotate(matrix)`, `clearRows(board)`, and a controller with `mount`, `pause`, `resume`, `destroy`.

- [ ] **Step 1: Write failing pure-rule tests**

Cover wall/floor/locked-cell collision, clockwise matrix rotation, single and multi-row clearing, and the scoring table `{1:100, 2:300, 3:500, 4:800}` multiplied by level.

- [ ] **Step 2: Verify the tests fail for missing exports**

Run `node --test tests/tetris.test.js` and expect an import or missing-export failure.

- [ ] **Step 3: Implement pure Tetris rules**

Define the seven tetromino matrices, seven-bag shuffle, immutable row clearing, collision checks, clockwise rotation, wall-kick offsets `[0, -1, 1, -2, 2]`, piece locking, and line scoring.

- [ ] **Step 4: Pass the pure-rule tests**

Run `node --test tests/tetris.test.js` and require all cases to pass.

- [ ] **Step 5: Implement the Tetris controller and UI**

Render a 10×20 CSS grid and next-piece preview. Add arrow/WASD movement, up rotation, down soft drop, space hard drop, labeled touch buttons, pause, restart, level speed, score/lines/level updates, best-score persistence, and game-over overlay. Use one timeout loop that is cleared during pause and destroy.

- [ ] **Step 6: Verify a complete run lifecycle**

Run `npm test`; manually confirm keyboard and held touch actions, line clearing, pause on `visibilitychange`, restart, game over, best score, and leaving/re-entering without duplicate timers.

- [ ] **Step 7: Commit Tetris when Git is available**

Commit the task files with `feat: add playable tetris` or record that the commit was skipped.

### Task 3: 2048

**Files:**
- Create: `js/game2048.js`
- Create: `tests/game2048.test.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: a root containing `[data-2048-board]`, score fields, New Game, four direction buttons, and overlay actions; `storage` from `app.js`.
- Produces: `create2048Controller({ storage, random })`, `slideLine(values)`, `moveBoard(board, direction)`, `canMove(board)`, and the standard lifecycle.

- [ ] **Step 1: Write failing movement tests**

Assert `slideLine([2,2,2,2])` returns `[4,4,0,0]`, `[4,4,8,0]` returns `[8,8,0,0]`, score deltas are correct, vertical and horizontal moves agree, unchanged moves do not spawn, and `canMove` detects both blocked and mergeable boards.

- [ ] **Step 2: Verify missing implementation fails**

Run `node --test tests/game2048.test.js` and expect failure.

- [ ] **Step 3: Implement deterministic rules**

Implement line compression/merge/compression, board transforms for four directions, changed-board comparison, open-cell enumeration, injectable random tile spawning with 90% `2` and 10% `4`, win detection, and move availability.

- [ ] **Step 4: Pass the rule tests**

Run `node --test tests/game2048.test.js` and require all cases to pass.

- [ ] **Step 5: Implement rendering and controls**

Render 16 grid cells and positioned tiles with numeric classes. Support arrows, WASD, swipe gestures with a 30-pixel threshold, and four touch buttons. Add score/best score, New Game confirmation during an active run, 2048 continue/restart overlay, game-over overlay, and safe persistence.

- [ ] **Step 6: Verify game behavior**

Run `npm test`; manually exercise every direction, confirm one merge per tile per move, no spawn after invalid moves, swipe suppression of page scroll only on the board, win continuation, game over, and refresh persistence.

- [ ] **Step 7: Commit 2048 when Git is available**

Commit the task files with `feat: add playable 2048` or record that the commit was skipped.

### Task 4: Three-Level Troll Obby

**Files:**
- Create: `js/obby.js`
- Create: `tests/obby.test.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: a canvas, death/level/time fields, restart/pause controls, held-input touch buttons, and `storage`.
- Produces: `createObbyController({ storage, now, requestFrame, cancelFrame })`, `overlaps(a, b)`, `resolveVertical(player, platform, previousY)`, `activateTriggers(level, player)`, and the standard lifecycle.

- [ ] **Step 1: Write failing physics and trigger tests**

Test separating and non-separating rectangles, landing only when crossing a platform from above, spike activation at an x threshold, checkpoint selection, hazard reset coordinates, and final-goal completion.

- [ ] **Step 2: Verify the tests fail**

Run `node --test tests/obby.test.js` and expect failure for the absent module.

- [ ] **Step 3: Implement pure helpers and level data**

Define fixed world coordinates and three data-driven levels: Sneaky Steps with a proximity spike, Fake Shortcut with an airborne wall trigger and safe lower route, and Last Laugh with a collapsing floor plus decoy goal. Implement rectangle overlap, vertical/horizontal platform resolution, trigger state copies, checkpoints, hazards, and goals.

- [ ] **Step 4: Pass helper tests**

Run `node --test tests/obby.test.js` and require all cases to pass.

- [ ] **Step 5: Implement the canvas engine**

Use a fixed timestep capped after tab suspension, acceleration, friction, gravity, terminal velocity, 100ms coyote time, and 120ms jump buffering. Render platforms, player, hazards, checkpoints, goal, trigger reveals, camera offset, and short troll messages with Canvas 2D primitives. Scale the backing canvas by device pixel ratio without changing world units.

- [ ] **Step 6: Add keyboard and held touch controls**

Map A/D and arrows to movement, W/up/space to jump, and pointer down/up/cancel to touch buttons. Prevent default only for active game inputs. Track deaths, elapsed completion time, level advancement, pause/restart, best time, and completion overlay.

- [ ] **Step 7: Verify all levels and lifecycle behavior**

Run `npm test`; manually beat all three levels with keyboard and touch controls, intentionally trigger each troll, use each checkpoint, pause/resume, resize, leave the route, and verify only one animation loop exists after returning.

- [ ] **Step 8: Commit the obby when Git is available**

Commit task files with `feat: add three-level troll obby` or record that the commit was skipped.

### Task 5: Accessibility, Audio, Responsive Polish, and Release Verification

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.js`
- Modify: `js/tetris.js`
- Modify: `js/game2048.js`
- Modify: `js/obby.js`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: all prior game controllers and shared shell controls.
- Produces: final local draft satisfying every acceptance criterion in the spec.

- [ ] **Step 1: Expand the shell regression test**

Assert every icon-only button has an accessible label, every game contains a Home and restart action, the stylesheet contains `prefers-reduced-motion`, and no `http://`, `https://`, CDN, framework, or third-party script reference exists in the HTML.

- [ ] **Step 2: Run the new checks and inspect failures**

Run `npm test` and use each reported omission as the exact completion list.

- [ ] **Step 3: Complete shared presentation and accessibility**

Add consistent header controls, live regions for score/status changes, focus-visible styles, 44-pixel targets, small-screen layouts, Chromebook two-column game layouts, high-contrast overlays, and reduced-motion overrides. Ensure color is paired with shape, number, or label.

- [ ] **Step 4: Add optional synthesized sound**

Implement a muted-by-default shared audio helper that creates an `AudioContext` only after a user gesture and plays short oscillator tones for moves, clears, hazards, wins, and game over. Persist the sound preference and silently skip audio on failure.

- [ ] **Step 5: Run the complete automated suite**

Run `npm test` and require zero failures and zero unhandled rejections.

- [ ] **Step 6: Perform final browser checks**

Verify homepage and every game at 390×844, 768×1024, and 1366×768; test keyboard, touch, swipe, route Back, refresh, storage-disabled fallback, reduced motion, focus order, pause/restart, and every terminal overlay.

- [ ] **Step 7: Validate final scope**

Confirm there are no network requests for application assets, no dependency entries in `package.json`, no inactive timers or animation frames after navigation, and no missing requirement from the design spec.

- [ ] **Step 8: Commit the completed draft when Git is available**

Commit all final changes with `feat: complete pixel playground draft` or record that the workspace is not a Git repository.
