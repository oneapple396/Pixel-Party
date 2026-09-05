# Pixel Playground Design

## Purpose

Pixel Playground is a browser-based arcade for students in grades 2–6. It provides three polished games that run without downloads, accounts, ads, external assets, libraries, or frameworks. The experience is designed for school-managed Chromebooks and touch devices, though whether a particular deployment is reachable depends on the school's policies and network configuration.

## Product Goals

- Let a student reach and start a game within two interactions.
- Make every game work with both keyboard and on-screen touch controls.
- Keep instructions short, visible, and understandable to younger players.
- Preserve each game's quality through complete rules, feedback, restart states, and responsive presentation.
- Store scores and settings only on the current device.

## Information Architecture

The site is a single HTML application with hash-based views:

- `#home` shows the arcade library.
- `#tetris` shows Tetris.
- `#2048` shows 2048.
- `#obby` shows Troll Obby.

Each game view behaves as a dedicated page while sharing a consistent shell. Hash navigation provides browser back-button support without page reloads. Direct links to game hashes open the requested game.

## Visual Direction

The interface uses a cheerful pixel-arcade style with chunky typography, saturated colors, dark navy surfaces, rounded panels, and crisp CSS-created game art. The homepage centers the title and a large responsive grid of game cards. Every card includes a distinct color palette, a CSS illustration, the game name, a one-sentence description, and a clear play button.

Motion is used for helpful game feedback rather than decoration. Reduced-motion preferences disable nonessential transitions. Layouts scale from Chromebook screens to tablets and phones without horizontal page scrolling.

## Shared Application Shell

The shell owns routing, view changes, persistent settings, and common controls. Each game page includes:

- A Home button.
- The game title and compact instructions.
- Score or progress information relevant to the game.
- Pause and restart controls where applicable.
- Keyboard hints and labeled touch controls.
- A modal-style overlay for pause, completion, or game over.

Audio is optional and begins muted. If enabled, simple sound effects are synthesized with the Web Audio API; no media files are loaded. Best scores, sound preference, and reduced-motion preference are stored in `localStorage`. A storage failure never blocks play.

## Tetris

Tetris uses a 10-column by 20-row board. The seven standard tetrominoes are represented as four-cell matrices and chosen with a seven-piece bag to avoid extreme random streaks.

### Rules and State

- A piece spawns near the top center and falls on a timer.
- Left/right move, up rotates, down soft-drops, and space hard-drops.
- Touch controls expose the same actions with large buttons.
- Collision detection prevents pieces from passing through walls, the floor, or locked cells.
- When a piece can no longer descend, it locks into the board.
- Complete rows clear together and rows above collapse.
- Score increases for cleared rows and soft/hard drops.
- Falling speed increases at predictable level thresholds.
- The game ends when a new piece cannot spawn.

The screen contains the tall board, score, lines, level, next-piece preview, and controls. Pause occurs when the user requests it or the document becomes hidden. Restart resets the current run but retains the best score.

## 2048

2048 uses a 4×4 board. Each valid move slides all tiles in one direction, merges equal pairs once per move, and spawns a new tile in an empty position. New tiles are normally 2, with a small chance of 4 to match familiar 2048 behavior.

### Rules and State

- Arrow keys, WASD, swipe gestures, and four directional buttons are supported.
- Tiles process from the movement edge so merges resolve correctly.
- A tile created by a merge cannot merge again during the same move.
- Score increases by the value of every resulting merged tile.
- A new tile appears only after a move changes the board.
- Reaching 2048 shows a win overlay with options to continue or restart.
- With no empty cell and no adjacent equal pair, the game-over overlay appears.

The interface includes current score, best score, New Game, instructions, board, and touch controls. Tile colors and text contrast remain readable for all values.

## Troll Obby

Troll Obby is a compact side-scrolling platform game drawn on an HTML canvas. The player runs and jumps through three short levels. Each level introduces visible obstacles plus scripted surprises that can be learned and beaten.

### Controls and Physics

- Arrow keys or A/D move; up, W, or space jumps.
- Touch controls provide left, right, and jump buttons that support held input.
- Movement uses acceleration, friction, gravity, collision resolution, and a capped falling speed.
- A small grace period after leaving a platform and a small jump-input buffer make controls forgiving.

### Level Structure

1. **Sneaky Steps:** a hidden spike rises as the player approaches.
2. **Fake Shortcut:** an unexpected wall appears during a jump, requiring a safer route.
3. **Last Laugh:** a fake-looking finish and collapsing floor combine earlier lessons.

Hazards reset the player to the current level's start or latest checkpoint. The run tracks deaths and completion time, prioritizing persistence over a limited-lives failure state. Reaching the final goal shows a celebration and offers replay or return home.

Level geometry, triggers, checkpoints, and messages are data objects interpreted by one game engine. This keeps levels independent from physics and makes future levels straightforward to add.

## Code Organization

The implementation stays deliberately small and framework-free:

- `index.html`: semantic application shell and view containers.
- `styles.css`: shared visual system, responsive layouts, and game-specific presentation.
- `js/app.js`: routing, settings, homepage, and shared overlays.
- `js/tetris.js`: Tetris state, rules, rendering, and input adapter.
- `js/game2048.js`: 2048 state, rules, rendering, and input adapter.
- `js/obby.js`: platform physics, level data, canvas rendering, and input adapter.

Each game exposes `mount`, `pause`, `resume`, and `destroy` behavior. Leaving a game stops timers and animation frames so hidden games do not continue running. Input listeners are registered on mount and removed on destroy.

## Data Flow and Resilience

Inputs update only the active game's state. A state update is validated against game rules, rendered, and then persisted when it affects a best score. Rendering never reads from the DOM as the source of truth.

The application has no network dependency. If `localStorage`, audio, pointer events, or vibration are unavailable, those enhancements are skipped. Invalid route hashes return to the homepage. Canvas scales for device pixel ratio while game coordinates remain stable.

## Accessibility and Child-Friendly UX

- Interactive controls are native buttons with visible focus states and accessible names.
- Touch targets are at least 44 pixels in their smallest dimension.
- Color is never the only signal for state; numbers, shapes, labels, or motion provide reinforcement.
- Instructions use short verbs and familiar keys.
- Game overlays trap neither focus nor navigation and provide an obvious next action.
- The design honors `prefers-reduced-motion`.
- No personal information, chat, purchases, advertisements, or outbound links appear.

## Verification

Automated JavaScript checks cover deterministic rule helpers:

- Tetris collision, locking, rotation boundaries, row clearing, and scoring.
- 2048 compression, merge order, invalid moves, spawning, win detection, and game-over detection.
- Obby rectangle collision, trigger activation, checkpoint reset, and level completion.

Manual browser verification covers:

- Homepage-to-game navigation and browser back behavior.
- All keyboard, touch-button, and swipe inputs.
- Pause, restart, game-over, win, and completion flows.
- Layouts at representative phone, tablet, and Chromebook sizes.
- Refresh behavior and saved best scores.
- Operation with reduced motion and storage unavailable.

## Acceptance Criteria

The project is complete when all three games can be selected from the homepage and played to their intended terminal state; both keyboard and touch controls work; navigation does not leave active timers behind; layouts remain usable on phone and Chromebook screens; best scores persist locally; and the site builds and runs using only HTML, CSS, and JavaScript.
