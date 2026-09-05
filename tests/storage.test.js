import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, STORAGE_KEY } from '../js/storage.js';

test('storage survives a new adapter instance', () => {
  const values = new Map();
  const local = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key,value) { values.set(key,value); }
  };
  createStorage(local).save({points:42});
  assert.equal(createStorage(local).load({points:0}).points,42);
  assert.equal(values.has(STORAGE_KEY),true);
});

test('storage falls back safely when saved JSON is invalid', () => {
  const local={getItem(){return '{oops';},setItem(){throw new Error('blocked');}};
  const storage=createStorage(local);
  assert.deepEqual(storage.load({points:0}),{points:0});
  assert.equal(storage.save({points:2}),false);
});
