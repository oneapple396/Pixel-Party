# Pixel Playground Progression and Obby Repair Design

## Purpose

Add a shared, device-local points economy and consumable boost inventory across Pixel Playground while repairing Troll Obby Level 2 so its intended route is reliably achievable with keyboard and touch controls.

## Scope

This change adds one shared wallet, a homepage shop, four consumable boosts, game reward events, and active-boost indicators. It does not add accounts, cloud storage, purchases, advertisements, multiplayer features, daily rewards, or additional games.

## Shared Progression Architecture

A new `js/progression.js` module owns progression state and rules. It exposes a single progression service to the application and game controllers. The service persists a versioned record in `localStorage`:

```js
{
  version: 1,
  points: 0,
  inventory: {
    slowTime: 0,
    undo: 0,
    shield: 0,
    doublePoints: 0
  },
  active: {
    tetris: null,
    game2048: null,
    obby: null
  }
}
```

Malformed or unavailable storage falls back to a new empty wallet without blocking play. Counts are non-negative integers. Unknown inventory keys are ignored. The service emits a `progressionchange` event after every successful earn, purchase, activation, consumption, or reset so the header, shop, and active game remain synchronized.

## Points and Anti-Farming Rules

Points are awarded for observable game accomplishments:

- Tetris: 5 points for one cleared row, 15 for two, 30 for three, and 50 for four cleared at once. Row rewards may repeat throughout a run.
- 2048: 10 points when first reaching 128 in a run, 20 for 256, 40 for 512, 80 for 1024, and 160 for 2048. Each milestone pays once per run.
- Troll Obby: 30 points on the first completion of each level in a run, plus 15 points when that level is completed without a death. Replaying or respawning within the same run cannot repay that level.

The Double Points boost multiplies the next positive reward event by two and is then consumed. It never doubles refunds or purchases. Reward notifications identify the accomplishment and awarded amount.

## Shop and Inventory UX

The global header displays a coin icon and current point balance. The homepage adds a Power-Up Shop below the game grid. Each shop card includes the boost name, game association, short effect, cost, owned count, and Buy button. Buy is disabled when the wallet lacks enough points.

Boost costs are:

- Slow Time: 60 points.
- Undo: 50 points.
- Shield: 50 points.
- Double Points: 75 points.

Each game page includes a compact boost tray. Owned compatible boosts show an Activate button. Only one boost can be active for a game at a time. Activating a boost reserves one owned item; the item is consumed when its effect first applies. Leaving or restarting before application returns the reserved item to inventory. Universal Double Points is compatible with every game and is consumed on the next reward from any game.

## Boost Effects

### Tetris: Slow Time

When activated, Slow Time begins on the next spawned piece. For 30 seconds, the automatic fall interval is multiplied by 1.6, subject to the existing minimum interval. A visible countdown appears beside the score. Once the countdown expires, normal level speed resumes.

### 2048: Undo

When active, the controller stores the board and score immediately before the next valid move. After that move finishes, an Undo button appears. Using it restores that exact board and score, removes the tile spawned by the move, and consumes the boost. Undo does not reverse points already awarded by a newly reached milestone; milestones remain paid for the run.

### Troll Obby: Shield

The next collision with a hazard or fall below the world is blocked. The player returns to the current level spawn without adding a death, the shield is consumed, and a short “Shield saved you!” message appears.

### Universal: Double Points

Double Points remains active until the next positive reward from any game. The reward toast shows both the base reward and doubled total. If the user restarts or navigates away, the boost remains active because it is not tied to a single run.

## Troll Obby Level 2 Repair

The previous Level 2 surprise block spans from the route platform upward, leaving only a fall-under-and-redirect maneuver. This is removed.

The repaired level uses four platforms:

- Start platform: `x 0–280`, top `y 420`.
- Upper platform: `x 325–520`, top `y 350`.
- Recovery platform: `x 545–740`, top `y 390`.
- Finish platform: `x 755–940`, top `y 330`.

Horizontal gaps are 45, 25, and 15 pixels. Upward rises are 70 pixels from start to upper and 60 pixels from recovery to finish, both within the 96-pixel theoretical jump rise. The surprise obstacle is a 34×32 pop-up block anchored on the upper platform at `x 455`; it can be jumped over or avoided by taking the recovery route. The pit begins below platform height so it does not intersect a valid landing surface.

## Playability Validation

A pure route validator checks every required transition for:

- Upward rise no greater than the calculated maximum jump rise.
- Horizontal gap no greater than the conservative horizontal travel available during the jump.
- A landing width at least twice the player width.
- No active hazard spanning the full vertical corridor between source and destination.

The validator is applied to all three levels in automated tests. Level 2 additionally has a deterministic simulation test that applies a recorded sequence of left/right/jump inputs through the same physics step used by the game controller and asserts that the goal is reached without collisions.

## Game Integration

Each controller receives the progression service through its factory options and reports only game-domain events:

- Tetris reports cleared row count.
- 2048 reports the largest newly reached tile.
- Troll Obby reports level index and whether deaths occurred during that level.

The progression module converts those events to point rewards. This keeps currency rules out of game physics and makes the economy independently testable.

## Accessibility and Feedback

- Point balance uses text and an icon rather than color alone.
- Shop buttons expose cost, ownership, and disabled state to assistive technology.
- Reward and boost messages use a polite live region.
- Active boosts include a text label and remaining duration or use count.
- Reduced-motion mode disables toast and purchase animations without hiding state changes.

## Verification

Automated tests cover state migration, safe storage fallback, earning, anti-farming, insufficient funds, purchasing, reserving, refunding, consuming, Double Points, all three game reward adapters, boost-specific state changes, route validation, and the deterministic Level 2 completion path.

Manual verification covers buying and activating every boost, refreshing with saved state, earning from each game, reward notifications, insufficient funds, restart/navigation refund behavior, keyboard and touch completion of Level 2, and layouts at phone, tablet, and Chromebook widths.

## Acceptance Criteria

The change is complete when Level 2 can be completed reliably with keyboard and touch controls; all three games award points according to the specified tables without duplicate milestone or level rewards; players can purchase, activate, consume, and retain the defined boosts; the wallet and inventory survive refresh locally; storage failures do not block games; and the complete automated suite passes.

