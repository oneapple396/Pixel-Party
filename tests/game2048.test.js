import test from 'node:test';
import assert from 'node:assert/strict';
import { slideLine, moveBoard, canMove, traceMove, milestonesCrossed, restoreUndo } from '../js/game2048.js';

test('a tile merges only once per move', () => {
  assert.deepEqual(slideLine([2,2,2,2]), {line:[4,4,0,0], score:8});
  assert.deepEqual(slideLine([4,4,8,0]), {line:[8,8,0,0], score:8});
});
test('board moves in horizontal and vertical directions', () => {
  const b=[[2,0,0,0],[2,0,0,0],[0,0,0,0],[0,0,0,0]];
  assert.deepEqual(moveBoard(b,'up').board[0], [4,0,0,0]);
  assert.deepEqual(moveBoard([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],'left').board[0], [4,0,0,0]);
});
test('move availability detects blocked and mergeable boards', () => {
  assert.equal(canMove([[2,4],[8,16]]), false);
  assert.equal(canMove([[2,2],[8,16]]), true);
});
test('movement trace carries tiles from source cells to destination cells', () => {
  const board=[[0,2,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  assert.deepEqual(traceMove(board,'left').motions, [
    {from:[0,1],to:[0,0],value:2,result:4},
    {from:[0,3],to:[0,0],value:2,result:4}
  ]);
});
test('milestones report only newly crossed reward tiles', () => {
  assert.deepEqual(milestonesCrossed(64,512),[128,256,512]);
  assert.deepEqual(milestonesCrossed(512,512),[]);
});
test('undo restores an exact board and score snapshot', () => {
  const snap={board:[[2,0],[0,0]],score:18};
  assert.deepEqual(restoreUndo(snap),{board:[[2,0],[0,0]],score:18});
  assert.notEqual(restoreUndo(snap).board,snap.board);
});

