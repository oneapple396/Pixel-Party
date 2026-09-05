import test from 'node:test';
import assert from 'node:assert/strict';
import { overlaps, resolveVertical, activateTriggers, shouldContinueLoop, anchorHazard, jumpCanReach, validateRoute, getLevel, levelCount, deathOutcome } from '../js/obby.js';

test('rectangle overlap excludes separated edges', () => {
  assert.equal(overlaps({x:0,y:0,w:10,h:10},{x:9,y:9,w:2,h:2}), true);
  assert.equal(overlaps({x:0,y:0,w:10,h:10},{x:10,y:0,w:2,h:2}), false);
});
test('vertical resolution lands only while crossing from above', () => {
  const p={x:2,y:9,w:4,h:4,vy:5}; const plat={x:0,y:10,w:20,h:3};
  assert.equal(resolveVertical(p,plat,5), true); assert.equal(p.y,6); assert.equal(p.vy,0);
});
test('proximity triggers activate without mutating level definition', () => {
  const level={triggers:[{x:20,type:'spike',target:0}],hazards:[{active:false}]};
  const result=activateTriggers(level,{x:25});
  assert.equal(result.hazards[0].active,true); assert.equal(level.hazards[0].active,false);
});
test('a paused game does not schedule another animation frame', () => {
  assert.equal(shouldContinueLoop(true), false);
  assert.equal(shouldContinueLoop(false), true);
});
test('a spike is anchored with its base on top of a platform', () => {
  assert.deepEqual(anchorHazard({x:100,y:300,w:150,h:20},{offset:30,w:34,h:30}), {x:130,y:270,w:34,h:30});
});
test('level rises stay inside the player jump arc', () => {
  assert.equal(jumpCanReach(420,330,-500,1300), true);
  assert.equal(jumpCanReach(420,300,-500,1300), false);
});
test('route validation rejects a full-height obstacle in a required corridor', () => {
  const level={platforms:[{x:0,y:420,w:250,h:60},{x:300,y:350,w:180,h:20}],hazards:[{x:250,y:250,w:40,h:170,active:true,kind:'block'}],route:[0,1]};
  assert.deepEqual(validateRoute(level).failures, ['blocked-corridor:0-1']);
});
test('repaired level two has a valid route with reachable landings', () => {
  assert.deepEqual(validateRoute(getLevel(1)), {valid:true,failures:[]});
});
test('all ten levels have possible routes and increasing variety', () => {
  assert.equal(levelCount(),10);
  const levels=Array.from({length:levelCount()},(_,index)=>getLevel(index));
  for(const level of levels)assert.deepEqual(validateRoute(level),{valid:true,failures:[]});
  assert.ok(new Set(levels.map(level=>level.name)).size===10);
  assert.ok(levels.some(level=>level.platforms.some(platform=>platform.moving)));
  assert.ok(levels.some(level=>level.hazards.some(hazard=>hazard.kind==='block')));
});
test('shielded hazards preserve death count and show save feedback', () => {
  assert.deepEqual(deathOutcome(true,4),{deaths:4,message:'Shield saved you!'});
  assert.deepEqual(deathOutcome(false,4),{deaths:5,message:'Trolled! Try again 😈'});
});
