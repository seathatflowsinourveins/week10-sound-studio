(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SoundRuntime=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 // Runs before the sketch. It observes; it never unlocks audio or requests a microphone.
 function observe(token){
  const origin=new URL(document.baseURI).origin,streams=new Set();let epoch=0,dead=false,failed=false,ready=false,lastState='';
  const tell=(kind,data={})=>parent.postMessage({kind,token,...data},origin);
  const state=document.createElement('p');state.setAttribute('role','status');state.className='runtime-status';
  function status(text){state.textContent=text;if(!state.isConnected)document.body?.append(state);}
  function stop(){
   dead=true;epoch++;for(const stream of streams)for(const track of stream.getTracks())track.stop();streams.clear();
   try{const context=typeof getAudioContext==='function'?getAudioContext():null;context?.close()?.catch?.(()=>{});if(typeof noLoop==='function')noLoop();}catch{}
   for(const button of document.querySelectorAll('button,input,select'))button.disabled=true;
   status('Sound stopped. Press Run my code above to prepare the sketch again.');tell('audio',{state:'stopped'});
  }
  window.soundPreview={stop};
  for(const type of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','touchstart','touchend','keydown','keyup','keypress'])window.addEventListener(type,event=>{if(dead){if(event.key!=='Tab'&&!event.metaKey&&!event.ctrlKey)event.preventDefault();event.stopImmediatePropagation();}},true);
  const media=navigator.mediaDevices;
  if(media?.getUserMedia){const original=media.getUserMedia.bind(media);media.getUserMedia=async constraints=>{
   if(dead)throw Error('Preview stopped. Press Run to prepare it again.');
   const requestedAt=epoch,stream=await original(constraints);
   if(dead||requestedAt!==epoch||document.hidden){for(const track of stream.getTracks())track.stop();}
   else streams.add(stream);return stream;
  };}
  function fail(message){failed=true;status('Sketch error: '+String(message));tell('error',{message:String(message)});}
  window.addEventListener('error',event=>{if(event.message)fail(event.message);else if(event.target?.tagName==='SCRIPT')fail('A drawing or sound library did not load. Reload the page.');},true);
  window.addEventListener('unhandledrejection',event=>fail(event.reason?.message||event.reason||'Sound could not start.'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',()=>{dead=true;stop();clearInterval(timer);});
  document.addEventListener('input',event=>{
   const node=event.target,name=node.getAttribute?.('aria-label');
   if(['Frequency','Volume','Waveform','Base frequency','Threshold','Practice level','Ear pitch'].includes(name))tell('control',{name,value:node.value});
  });
  let checks=0;const timer=setInterval(()=>{
   if(dead)return;
   const canvas=document.querySelector('canvas');
   if(!dead&&!failed&&!ready&&canvas?.width&&window.p5&&window.frameCount>0&&typeof getAudioContext==='function'){
    ready=true;status('Ready. Use the sketch controls. Sound requires your press.');tell('ready',{p5:p5.VERSION,width:window.width||canvas.width,height:window.height||canvas.height,sampleRate:getAudioContext()?.sampleRate});
   }
   if(!ready&&++checks>160){clearInterval(timer);if(!failed)fail('No ready p5 canvas yet. Run again, or open the lesson files in the full p5 editor.');}
   if(ready&&!failed&&!dead){try{const current=getAudioContext()?.state;if(current&&current!==lastState){lastState=current;tell('audio',{state:current});}}catch{}}
  },150);
 }
 function frameHTML({code,token}){
  const literal=value=>JSON.stringify(String(value)).replace(/</g,'\\u003c');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="./">'+
   '<style>:root{color-scheme:dark;--bg:#111b21;--text:#edf4f3;--line:#40535c;--accent:#c5efac}html,body{margin:0;background:var(--bg);color:var(--text);font:12px/1.6 system-ui}body{padding:10px}canvas{display:block;width:100%!important;height:auto!important;max-height:240px;object-fit:contain;margin:0 0 9px}button,input,select{font:12px system-ui;margin:4px;padding:7px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--text)}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent)}input[type=range]{max-width:90%;accent-color:var(--accent)}p{margin:5px}a{color:var(--accent)}.runtime-status{font:10px/1.6 monospace;color:var(--accent)}</style>'+
   '<script>('+observe.toString()+')('+literal(token)+');</script><script src="./vendor/p5.min.js"></script><script src="./vendor/p5.sound.min.js"></script></head><body><main></main><script>(()=>{const source=document.createElement("script");source.textContent='+literal(code)+';document.body.append(source);})();</script></body></html>';
 }
 return {frameHTML,observe};
});
