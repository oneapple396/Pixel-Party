import {createTetrisController} from './tetris.js';
import {create2048Controller} from './game2048.js';
import {createObbyController} from './obby.js';
import {createProgression} from './progression.js';
import {createStorage} from './storage.js';
import {mountPageShell} from './page-shell.js';

const preferenceStorage={get(key,fallback){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
const page=document.body.dataset.page;
const progression=createProgression({storage:createStorage(localStorage)});
mountPageShell({page,progression,preferenceStorage});
const factories={tetris:createTetrisController,game2048:create2048Controller,obby:createObbyController};
const roots={tetris:'tetris',game2048:'2048',obby:'obby'};
const controller=factories[page]?.({storage:preferenceStorage,progression});
if(controller){controller.mount(document.getElementById(roots[page]));document.addEventListener('visibilitychange',()=>document.hidden?controller.pause():controller.resume())}
