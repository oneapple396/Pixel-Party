import test from 'node:test';
import assert from 'node:assert/strict';
import { collides, rotate, clearRows, lineScore, rotationReady, slowInterval } from '../js/tetris.js';

test('rotation turns a matrix clockwise', () => assert.deepEqual(rotate([[1,0],[1,1]]), [[1,1],[1,0]]));
test('collision catches walls, floor and settled cells', () => {
  const board = Array.from({length: 4}, () => Array(4).fill(0)); board[3][1] = 2;
  assert.equal(collides(board, [[1]], -1, 0), true);
  assert.equal(collides(board, [[1]], 1, 4), true);
  assert.equal(collides(board, [[1]], 1, 3), true);
  assert.equal(collides(board, [[1]], 2, 2), false);
});
test('full rows clear and empty rows appear above', () => {
  const result = clearRows([[0,1,0],[1,1,1],[1,1,1]]);
  assert.equal(result.cleared, 2); assert.deepEqual(result.board, [[0,0,0],[0,0,0],[0,1,0]]);
});
test('line score uses standard table and level', () => assert.equal(lineScore(4, 3), 2400));
test('rotation input is blocked until 500ms has elapsed', () => {
  assert.equal(rotationReady(1000, 1499), false);
  assert.equal(rotationReady(1000, 1500), true);
});
test('slow time multiplies the current fall interval', () => {
  assert.equal(slowInterval(800,true),1280);
  assert.equal(slowInterval(120,false),120);
});
