(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SoundCore=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const IDS=['unlock','single','bank','pitch','scales','mic','fft','ear','prepare'];
 const RATIOS=[1,1.125,1.25,1.34,1.5,1.67,1.875,2],CHECKS=['worksheet','ear','upload','panel','reflection','repetition','article','solfege'];
 function clamp(value,min,max,fallback=min){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;}
 function frequency(base,ratio){return Math.round(clamp(base,20,2000,131)*clamp(ratio,.1,8,1)*100000)/100000;}
 function beatSeconds(bpm){return 60/clamp(bpm,20,300,90);}
 function wave(type,phase){const p=((phase%1)+1)%1;return type==='square'?(p<.5?1:-1):type==='triangle'?1-4*Math.abs(p-.5):type==='sawtooth'?2*p-1:Math.sin(2*Math.PI*p);}
 function crossed(previous,level,threshold){return previous<=threshold&&level>threshold;}
 function normalize(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid progress object.');
  if(value.version!==1)throw Error('Unsupported progress version.');
  const out={version:1,lesson:IDS.includes(value.lesson)?value.lesson:'unlock',notes:{},links:{},checks:{},drafts:{},positions:{}};
  for(const key of ['notes','drafts'])if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))for(const id of IDS)if(typeof value[key][id]==='string')out[key][id]=value[key][id].slice(0,key==='drafts'?100000:16000);
  if(value.links&&typeof value.links==='object')for(const id of ['1','2','3','4','5'])if(typeof value.links[id]==='string')out.links[id]=value.links[id].slice(0,2000);
  if(value.checks&&typeof value.checks==='object')for(const id of CHECKS)if(typeof value.checks[id]==='boolean')out.checks[id]=value.checks[id];
  if(value.positions&&typeof value.positions==='object')for(const id of IDS)if(value.positions[id]&&typeof value.positions[id]==='object')out.positions[id]={line:Math.floor(clamp(value.positions[id].line,0,999)),step:Math.floor(clamp(value.positions[id].step,0,99))};
  return out;
 }
 function merge(a,b){const current=normalize(a),incoming=normalize(b);return normalize({...current,lesson:incoming.lesson,notes:{...current.notes,...incoming.notes},links:{...current.links,...incoming.links},checks:{...current.checks,...incoming.checks},drafts:{...current.drafts,...incoming.drafts},positions:{...current.positions,...incoming.positions}});}
 return {IDS,RATIOS,CHECKS,clamp,frequency,beatSeconds,wave,crossed,normalize,merge};
});
