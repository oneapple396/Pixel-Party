# Public GitHub Pages Arcade Design

## Goal

Publish Pixel Party as a public, framework-free browser arcade that satisfies the instructor's checklist. The finished project will expose two different public links:

- Repository: `https://github.com/oneapple396/Pixel-Party`
- Website: `https://oneapple396.github.io/Pixel-Party/`

## Success Criteria

1. The GitHub repository is public and can be opened while signed out.
2. GitHub Pages serves the project from the repository's `main` branch.
3. Tetris, 2048, and Troll Obby each have a distinct HTML URL and are reachable from the home page.
4. Every page can return to the home page and open the shared shop.
5. Points, high scores, purchased inventory, and consumable counts persist with `localStorage` across page loads.
6. Players can earn points in each game, buy consumable boosts with those points, and successfully use at least one relevant boost in each game.
7. The published project contains no unwanted personal-name reference, including visible content and repository-authored project files.
8. Automated tests cover routing/links, persistence, purchases, insufficient-funds behavior, and boost consumption.
9. A signed-out check confirms both public URLs are accessible after deployment.

## Architecture

The site remains plain HTML, CSS, and JavaScript. It will use four real documents instead of relying only on hash routes:

- `/index.html` — game grid, points balance, inventory summary, and shop.
- `/games/tetris.html` — Tetris game and Tetris-specific boost controls.
- `/games/2048.html` — 2048 game and 2048-specific boost controls.
- `/games/troll-obby.html` — Troll Obby game and Obby-specific boost controls.

All four documents load shared styles and a shared progression module. Paths will be relative so the site works both from a local static server and under the GitHub Pages `/Pixel-Party/` project prefix.

## Shared Progression and Storage

A single progression module owns the storage schema and exposes a small API for pages and games. The initial schema is versioned and contains:

- `points`: non-negative integer, initially `0`.
- `highScores`: Tetris and 2048 values, initially `0`.
- `inventory`: non-negative counts for Slow Time, Undo, Shield, and Double Points.
- `milestones`: identifiers for one-time rewards, preventing duplicate payouts.
- `version`: schema version for safe normalization of older saved data.

The module will read from and write to one documented `localStorage` key. Missing, malformed, negative, or non-numeric values will be normalized to safe defaults. A first-time player therefore sees a 2048 high score of `0`, while legitimate saved progress remains intact.

Game code will not edit stored JSON directly. It will call progression functions to award points, purchase an item, consume an item, record a high score, or read the current state. Each mutation saves immediately and emits an update event so the visible balance and inventory stay synchronized.

## Shop and Working Consumables

The home-page shop displays each item's price, owned count, purpose, and purchase button. Purchases are rejected without changing state when the player lacks points. A successful purchase deducts the price and increments exactly one inventory count.

Consumables have observable effects and are deducted only when activation succeeds:

- **Slow Time — Tetris:** temporarily slows automatic falling.
- **Undo — 2048:** restores the board and score from immediately before the latest valid move.
- **Shield — Troll Obby:** prevents one otherwise-fatal collision or fall, then respawns the player safely.
- **Double Points — any game:** doubles the next eligible point reward, then expires.

Disabled buttons and short status messages explain why an item cannot be bought or used. Reloading a page preserves unused inventory but not a partially active timed effect.

## Points and Game Integration

Rewards will be meaningful and guarded against trivial repetition:

- Tetris awards points for cleared rows, with larger clears worth more.
- 2048 awards milestone points only the first time a qualifying tile or score threshold is reached.
- Troll Obby awards a modest amount once per completed level milestone, rather than on deaths or repeated contact with the finish trigger.

Double Points applies through the shared reward function, which prevents individual games from implementing inconsistent multipliers. Each game updates its high score through the same shared module.

## Navigation and UX

The home game cards will use ordinary links to the three game documents, so opening in a new tab, browser back/forward, and direct URLs all work. Each game page shows:

- A clear game title and concise controls.
- Current points and relevant consumables.
- A visible Home link.
- Keyboard controls plus on-screen controls suitable for younger students.
- Status feedback for purchases, boost activation, level completion, game over, and invalid actions.

Existing pixel-art styling is retained. The Troll Obby keeps its restricted black-and-red palette and readable pixelated detail.

## Cleanup and Attribution

The implementation will search case-insensitively for the unwanted personal-name reference identified in the instructor feedback. Any project-owned occurrence will be removed. Git history or GitHub account metadata will not be rewritten or falsified; if the reference exists only in external account metadata, it must be corrected through the owning GitHub account rather than hidden in source code.

## Testing and Verification

Automated tests will verify:

- All four HTML documents exist and game links target real pages.
- Each game page loads its required scripts and has a Home link.
- First-run defaults include a 2048 high score of `0`.
- Progress survives a simulated reload.
- Valid purchases deduct points and add inventory.
- Invalid purchases leave points and inventory unchanged.
- Slow Time, Undo, and Shield each consume inventory and change game behavior.
- Double Points doubles one eligible reward and is then consumed.
- Reward guards prevent repeat farming where specified.
- No project source contains the unwanted name.

Manual verification will run the site through a local static server and exercise navigation, purchases, reload persistence, and each boost. After pushing, GitHub Pages will be enabled for `main` and both public URLs will be checked while unauthenticated.

## Publishing Workflow

1. Implement and verify the multi-page site locally.
2. Commit the verified source to `main` and push it to `oneapple396/Pixel-Party`.
3. Change repository visibility to public.
4. Configure GitHub Pages to deploy from the root of `main`.
5. Wait for the Pages deployment and verify the repository and website links independently.

Publishing requires an authenticated GitHub session with administrator access to the repository. No access token or password will be stored in project files.

## Out of Scope

- Frameworks, third-party game libraries, accounts, servers, or cloud databases.
- Paid hosting or a custom domain.
- Rewriting unrelated Git history or changing GitHub profile identity.
- Downloads or installable game clients.
