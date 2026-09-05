import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('home links to three real game documents', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const path of ['games/tetris.html','games/2048.html','games/troll-obby.html'])
    assert.match(html,new RegExp(`href="${path}"`));
  assert.doesNotMatch(html,/href="#(?:tetris|2048|obby)"/);
});

test('each game document has home navigation and a module entrypoint', async () => {
  for(const name of ['tetris','2048','troll-obby']){
    const html=await readFile(new URL(`../games/${name}.html`,import.meta.url),'utf8');
    assert.match(html,/href="\.\.\/index\.html"/);
    assert.match(html,/type="module"/);
    assert.match(html,/name="viewport"/);
  }
});

test('documents contain no external application resources', async () => {
  for(const path of ['../index.html','../games/tetris.html','../games/2048.html','../games/troll-obby.html']){
    const html=await readFile(new URL(path,import.meta.url),'utf8');
    assert.doesNotMatch(html,/(?:src|href)="https?:\/\//);
  }
});
