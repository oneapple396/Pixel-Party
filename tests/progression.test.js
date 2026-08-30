import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProgression, rewardFor, createProgression } from '../js/progression.js';

test('normalization rejects malformed and negative wallet values', () => {
  assert.deepEqual(normalizeProgression(null), {version:1,points:0,inventory:{slowTime:0,undo:0,shield:0,doublePoints:0},active:{tetris:null,game2048:null,obby:null}});
  assert.equal(normalizeProgression({points:-9,inventory:{shield:2.8}}).inventory.shield,2);
});
test('reward table maps game accomplishments', () => {
  assert.equal(rewardFor({game:'tetris',rows:4}),50);
  assert.equal(rewardFor({game:'game2048',tile:512}),40);
  assert.equal(rewardFor({game:'obby',level:1,noDeath:true}),45);
});
test('wallet purchases, reserves, refunds and consumes boosts', () => {
  const memory={value:{version:1,points:100,inventory:{slowTime:0,undo:0,shield:0,doublePoints:0},active:{tetris:null,game2048:null,obby:null}},get(){return this.value},set(k,v){this.value=v}};
  const p=createProgression({storage:memory});
  assert.equal(p.purchase('shield'),true); assert.equal(p.snapshot().points,50);
  assert.equal(p.activate('obby','shield'),true); assert.equal(p.snapshot().inventory.shield,0);
  assert.equal(p.refund('obby'),true); assert.equal(p.snapshot().inventory.shield,1);
  p.activate('obby','shield'); assert.equal(p.consume('obby','shield'),true); assert.equal(p.snapshot().active.obby,null);
});
test('double points applies to the next positive reward once', () => {
  const memory={value:{version:1,points:100,inventory:{slowTime:0,undo:0,shield:0,doublePoints:1},active:{tetris:null,game2048:null,obby:null}},get(){return this.value},set(k,v){this.value=v}};
  const p=createProgression({storage:memory}); p.activate('tetris','doublePoints');
  assert.equal(p.earn({game:'tetris',rows:1},{}),10);
  assert.equal(p.earn({game:'tetris',rows:1},{}),5);
});
test('run state prevents duplicate milestone and level rewards', () => {
  const memory={value:null,get(k,f){return this.value??f},set(k,v){this.value=v}}; const p=createProgression({storage:memory}); const run={paid:new Set()};
  assert.equal(p.earn({game:'game2048',tile:128},run),10); assert.equal(p.earn({game:'game2048',tile:128},run),0);
  assert.equal(p.earn({game:'obby',level:1,noDeath:false},run),30); assert.equal(p.earn({game:'obby',level:1,noDeath:true},run),0);
});

