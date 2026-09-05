export const STORAGE_KEY='pixelPartyProgression';

export function createStorage(local,key=STORAGE_KEY){
 return{
  load(fallback){try{const raw=local.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}},
  save(value){try{local.setItem(key,JSON.stringify(value));return true}catch{return false}}
 };
}
