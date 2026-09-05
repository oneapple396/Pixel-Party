import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const allowed=new Set(['.html','.css','.js','.json','.md']);
const skipped=new Set(['.git','outputs','work','node_modules']);
const forbidden=new RegExp(String.fromCharCode(68,97,110,105,101,108)+'\\s+'+String.fromCharCode(66,114,111,119,110),'i');

async function projectText(directory){
 let text='';
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(skipped.has(entry.name))continue;
  const path=join(directory,entry.name);
  if(entry.isDirectory())text+=await projectText(path);
  else if(allowed.has(extname(entry.name)))text+=await readFile(path,'utf8');
 }
 return text;
}

test('project-owned content excludes the instructor-reported personal name',async()=>{
 assert.equal(forbidden.test(await projectText(root)),false);
});
