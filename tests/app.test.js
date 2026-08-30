import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('arcade shell exposes home and all three game destinations', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['home', 'tetris', '2048', 'obby']) assert.match(html, new RegExp(`id="${id}"`));
  for (const hash of ['#tetris', '#2048', '#obby']) assert.match(html, new RegExp(`href="${hash}"`));
  assert.match(html, /name="viewport"/);
  assert.match(html, /type="module"/);
});

test('shell contains no external application resources', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//);
});

