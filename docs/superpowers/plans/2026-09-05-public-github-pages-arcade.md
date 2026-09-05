# Public GitHub Pages Arcade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Pixel Party into a tested multi-page arcade and publish distinct public GitHub repository and GitHub Pages links.

**Architecture:** Four static HTML documents share one versioned progression module and page-shell module. Each game controller stays isolated in its existing JavaScript file, while ordinary relative links and paths make direct URLs work under both localhost and the GitHub Pages `/Pixel-Party/` prefix.

**Tech Stack:** HTML5, CSS, browser JavaScript ES modules, Canvas, `localStorage`, Node.js built-in test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-05-public-github-pages-arcade-design.md`

## Global Constraints

- Use only HTML, CSS, and JavaScript; no frameworks or third-party game libraries.
- Provide distinct documents at `/index.html`, `/games/tetris.html`, `/games/2048.html`, and `/games/troll-obby.html`.
- Store no credentials or access tokens in project files.
- Preserve the existing pixel-art visual direction and black/red Troll Obby palette.
- Remove the unwanted personal-name reference from all project-owned content.
- A first-time player must see `0` for the 2048 high score.

---

### Task 1: Versioned Persistent Progression

**Files:**
- Modify: `js/progression.js`
- Create: `js/storage.js`
- Modify: `tests/progression.test.js`
- Create: `tests/storage.test.js`

**Interfaces:**
- Produces: `createStorage(localStorageLike, key = 'pixelPartyProgression')` with `load(fallback): object` and `save(value): boolean`.
- Produces: `normalizeProgression(value): ProgressionState`, `createProgression({storage, notify})`, and state fields `points`, `highScores`, `inventory`, `active`, `milestones`, `version`.
- Consumes: a storage adapter whose `load` and `save` methods do not throw.

- [ ] **Step 1: Write failing persistence and defaults tests**

```js
test('first run starts both high scores at zero', () => {
  assert.deepEqual(normalizeProgression(null).highScores, {tetris: 0, game2048: 0});
});

test('storage survives a new adapter instance', () => {
  const local = new Map();
  const api = {getItem:k=>local.get(k) ?? null,setItem:(k,v)=>local.set(k,v)};
  createStorage(api).save({points: 42});
  assert.equal(createStorage(api).load({points: 0}).points, 42);
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test tests/progression.test.js tests/storage.test.js`
Expected: FAIL because `highScores` and `createStorage` do not exist.

- [ ] **Step 3: Implement normalized state and safe storage**

```js
export const STORAGE_KEY = 'pixelPartyProgression';
export function createStorage(local, key = STORAGE_KEY) {
  return {
    load(fallback) { try { const raw=local.getItem(key); return raw===null?fallback:JSON.parse(raw); } catch { return fallback; } },
    save(value) { try { local.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  };
}
```

Update progression defaults to include `highScores:{tetris:0,game2048:0}` and `milestones:[]`; add `recordHighScore(game, score)` and persist earned milestone identifiers in state rather than only in a run-local set.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/progression.test.js tests/storage.test.js`
Expected: PASS.

- [ ] **Step 5: Commit the progression unit**

```powershell
git add js/progression.js js/storage.js tests/progression.test.js tests/storage.test.js
git commit -m "feat: persist shared arcade progression"
```

### Task 2: Real Home and Game Documents

**Files:**
- Modify: `index.html`
- Create: `games/tetris.html`
- Create: `games/2048.html`
- Create: `games/troll-obby.html`
- Modify: `styles.css`
- Modify: `enhancements.css`
- Replace: `js/app.js`
- Create: `js/page-shell.js`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: `createStorage(window.localStorage)` and `createProgression({storage, notify})`.
- Produces: `mountPageShell({page, progression})`, home shop markup using `data-buy`, and game boost trays using `data-activate` and `data-game`.

- [ ] **Step 1: Replace hash-route tests with document-link tests**

```js
test('home links to three real game documents', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const path of ['games/tetris.html','games/2048.html','games/troll-obby.html'])
    assert.match(html, new RegExp(`href="${path}"`));
});

test('each game document has home navigation and module entrypoint', async () => {
  for (const name of ['tetris','2048','troll-obby']) {
    const html=await readFile(new URL(`../games/${name}.html`,import.meta.url),'utf8');
    assert.match(html,/href="\.\.\/index\.html"/);
    assert.match(html,/type="module"/);
  }
});
```

- [ ] **Step 2: Run the app test and confirm failure**

Run: `node --test tests/app.test.js`
Expected: FAIL because the three game documents do not exist and home still uses hash links.

- [ ] **Step 3: Build the four documents and shared shell**

Move each existing game section from `index.html` to its corresponding page. Use `../styles.css`, `../enhancements.css`, and `../js/<entry>.js` on game pages. Replace routing code with page-specific bootstrapping and retain shop, toast, wallet, sound, visibility pause/resume, and mobile controls through `page-shell.js`.

- [ ] **Step 4: Verify document tests and all relative resources**

Run: `node --test tests/app.test.js`
Expected: PASS with no external `src` or `href` resources.

- [ ] **Step 5: Commit the multi-page shell**

```powershell
git add index.html games js/app.js js/page-shell.js styles.css enhancements.css tests/app.test.js
git commit -m "feat: add separate arcade game pages"
```

### Task 3: Working Shop and Consumable Integrations

**Files:**
- Modify: `js/page-shell.js`
- Modify: `js/tetris.js`
- Modify: `js/game2048.js`
- Modify: `js/obby.js`
- Modify: `tests/progression.test.js`
- Modify: `tests/tetris.test.js`
- Modify: `tests/game2048.test.js`
- Modify: `tests/obby.test.js`

**Interfaces:**
- Consumes: `progression.purchase(id)`, `activate(game,id)`, `consume(game,id)`, `earn(event)`, `recordHighScore(game,score)`, and `subscribe(fn)`.
- Produces: `slowInterval(base, active)`, `restoreUndo(snapshot)`, and `deathOutcome(shielded, deaths)` as observable boost behaviors.

- [ ] **Step 1: Add integration-focused failing tests**

```js
test('purchase persists and insufficient funds are unchanged', () => {
  const p = progressionWithPoints(60);
  assert.equal(p.purchase('slowTime'), true);
  assert.equal(p.snapshot().inventory.slowTime, 1);
  const before=p.snapshot();
  assert.equal(p.purchase('shield'), false);
  assert.deepEqual(p.snapshot(), before);
});

test('double points is consumed by one positive reward', () => {
  const p=progressionWithInventory({doublePoints:1});
  p.activate('tetris','doublePoints');
  assert.equal(p.earn({game:'tetris',rows:1}),10);
  assert.equal(p.snapshot().active.tetris,null);
});
```

Extend each game test with one activation/behavior/consumption assertion for Slow Time, Undo, or Shield.

- [ ] **Step 2: Run game and progression tests and confirm failure**

Run: `node --test tests/progression.test.js tests/tetris.test.js tests/game2048.test.js tests/obby.test.js`
Expected: FAIL where the new persistent API and page-specific activation wiring are absent.

- [ ] **Step 3: Wire purchases and boost effects**

Render price, owned count, disabled state, and feedback from `page-shell.js`. Consume Slow Time after its timed duration, consume Undo only after restoring a valid snapshot, and consume Shield only when it prevents a death. Route all point awards through `earn` so Double Points is applied exactly once.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/progression.test.js tests/tetris.test.js tests/game2048.test.js tests/obby.test.js`
Expected: PASS.

- [ ] **Step 5: Commit shop behavior**

```powershell
git add js/page-shell.js js/tetris.js js/game2048.js js/obby.js tests
git commit -m "feat: connect purchasable consumable boosts"
```

### Task 4: Rewards, Name Cleanup, and Full Local Verification

**Files:**
- Modify: `js/progression.js`
- Modify: `tests/progression.test.js`
- Create: `tests/content.test.js`
- Modify: project-owned source files only if the unwanted reference is found.

**Interfaces:**
- Consumes: persistent `milestones` and `highScores` from Task 1.
- Produces: guarded rewards for Tetris rows, 2048 milestones, and Troll Obby level completions.

- [ ] **Step 1: Add failing anti-farming and content tests**

```js
test('an obby level reward can be earned only once per saved profile', () => {
  const p=emptyProgression();
  assert.ok(p.earn({game:'obby',level:1})>0);
  assert.equal(p.earn({game:'obby',level:1}),0);
});

test('project content excludes the instructor-reported personal name', async () => {
  const text=await readProjectOwnedText();
  assert.equal(forbiddenNamePattern.test(text),false);
});
```

The test helper will enumerate HTML, CSS, JavaScript, JSON, and Markdown project files while excluding `.git`, `outputs`, and generated coverage.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/progression.test.js tests/content.test.js`
Expected: FAIL until rewards use persistent milestone keys and any project-owned reference is removed.

- [ ] **Step 3: Implement durable reward guards and cleanup**

Use milestone keys `2048:<tile>` and `obby:<level>` in saved state. Keep Troll Obby completion rewards below the previous 30-point base reward while preserving larger achievements for later levels. Remove every project-owned forbidden-name match discovered by the test.

- [ ] **Step 4: Run the complete automated suite**

Run: `npm test`
Expected: all tests PASS with zero failures.

- [ ] **Step 5: Run local browser smoke checks**

Run: `npx --yes http-server . -p 4173 -c-1`
Expected: home and all three direct game URLs load; points survive reload; one item can be purchased and used; browser console has no errors.

- [ ] **Step 6: Commit verified cleanup**

```powershell
git add -A
git commit -m "fix: guard rewards and remove unwanted attribution"
```

### Task 5: Public GitHub Repository and Pages Deployment

**Files:**
- Create: `.github/workflows/pages.yml` only if branch-based Pages cannot be configured directly.
- Modify: `README.md` to include both public URLs and concise run instructions.

**Interfaces:**
- Consumes: verified static site from Tasks 1–4 and authenticated administrator access to `oneapple396/Pixel-Party`.
- Produces: public repository URL and independently accessible GitHub Pages URL.

- [ ] **Step 1: Add deployment-facing documentation**

```md
## Links

- Website: https://oneapple396.github.io/Pixel-Party/
- Source repository: https://github.com/oneapple396/Pixel-Party

## Run locally

Serve this directory with any static HTTP server, then open `index.html` through that server.
```

- [ ] **Step 2: Re-run verification before publishing**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 3: Commit and push**

```powershell
git add README.md .github
git commit -m "docs: add public arcade links"
git push -u origin main
```

- [ ] **Step 4: Make the repository public and enable Pages**

With authenticated repository-admin access, set visibility to public and set Pages source to the root of `main`. If branch publishing is unavailable, add GitHub's official static Pages Actions workflow and push it.

- [ ] **Step 5: Verify both links without authentication**

Open `https://github.com/oneapple396/Pixel-Party` and `https://oneapple396.github.io/Pixel-Party/` in a signed-out/private session. Expected: repository files are visible, the home page loads, and direct URLs `/games/tetris.html`, `/games/2048.html`, and `/games/troll-obby.html` return successful pages.

- [ ] **Step 6: Record final evidence**

Run: `git status --short`
Expected: no uncommitted project changes. Record the final test count, commit hash, repository URL, and website URL in the handoff.
