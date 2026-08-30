import {createTetrisController} from './tetris.js';
import {create2048Controller} from './game2048.js';
import {createObbyController} from './obby.js';
import {BOOSTS,createProgression} from './progression.js';

export const storage={get(k,f){try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const reward=document.querySelector('[data-reward]');let toastTimer;
function toast(text){reward.textContent=text;reward.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>reward.classList.remove('show'),2200)}
const progression=createProgression({storage,notify:event=>{if(event.type==='earn')toast(`+${event.amount} points!`);if(event.type==='purchase')toast(`${BOOSTS[event.boost].name} added!`)}});
const games={tetris:createTetrisController({storage,progression}),game2048:create2048Controller({storage,progression}),obby:createObbyController({storage,progression})};let active=null;
export function registerGame(hash,controller){games[hash.replace('#','')]=controller}
function gameKey(route){return route==='2048'?'game2048':route}
function route(){const raw=location.hash.slice(1),id=['tetris','2048','obby'].includes(raw)?raw:'home',key=gameKey(id);if(active){games[active].destroy();active=null}document.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.id!==id);if(id!=='home'){active=key;games[key].mount(document.getElementById(id))}document.title=id==='home'?'Pixel Playground':`${id==='obby'?'Troll Obby':id} · Pixel Playground`;scrollTo(0,0);renderProgression()}
function boostButton(game,id,state){const b=BOOSTS[id],owned=state.inventory[id],activeBoost=state.active[game];return `<button data-activate="${id}" data-game="${game}" ${!owned||activeBoost?'disabled':''}>${b.icon} ${activeBoost===id?'Active':`${b.name} · ${owned} owned`}</button>`}
function renderProgression(){const state=progression.snapshot();document.querySelector('[data-points]').textContent=state.points;const shop=document.querySelector('[data-shop]');shop.innerHTML=Object.entries(BOOSTS).map(([id,b])=>`<article class="power-card"><span>${b.icon}</span><div><h3>${b.name}</h3><p>${b.effect}</p><small>Owned: ${state.inventory[id]}</small></div><button data-buy="${id}" ${state.points<b.cost?'disabled':''}>● ${b.cost}</button></article>`).join('');for(const game of ['tetris','game2048','obby']){const tray=document.querySelector(`[data-boost-tray="${game}"]`);const compatible=Object.keys(BOOSTS).filter(id=>BOOSTS[id].game===game||BOOSTS[id].game==='any');tray.innerHTML='<b>BOOSTS</b>'+compatible.map(id=>boostButton(game,id,state)).join('')}}
document.addEventListener('click',event=>{const buy=event.target.closest('[data-buy]')?.dataset.buy;if(buy&&!progression.purchase(buy))toast('Earn more points first!');const button=event.target.closest('[data-activate]');if(button){if(progression.activate(button.dataset.game,button.dataset.activate))toast(`${BOOSTS[button.dataset.activate].name} ready!`);else toast('That boost is not ready.')}renderProgression()});progression.subscribe(renderProgression);
let sound=storage.get('sound',false);const btn=document.getElementById('sound');function soundUI(){btn.textContent=sound?'🔊':'🔇';btn.setAttribute('aria-label',sound?'Turn sound off':'Turn sound on')}btn.addEventListener('click',()=>{sound=!sound;storage.set('sound',sound);soundUI()});soundUI();window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',()=>{if(active)document.hidden?games[active].pause():games[active].resume()});route();

