const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const C=require('./core.js'),D=require('./course-data.js'),R=require('./runtime.js'),G=require('./lesson-guide.js'),I=require('./illustrations.js');
function desk(hash='#unlock',saved){
 const source=fs.readFileSync('index.html','utf8'),nodes=new Map(),all=[],events={},writes=[];
 class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.attributes={};this.handlers={};this.value='';this.hidden=false;this.className='';this.clientHeight=220;this.scrollTop=0;this.selectionStart=0;this.classList={add(){},remove(){}};all.push(this);}append(...children){this.children.push(...children);}replaceChildren(...children){this.children=children;}setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}getAttribute(k){return this.attributes[k];}addEventListener(k,f){this.handlers[k]=f;}setSelectionRange(a){this.selectionStart=a;}click(){this.onclick?.();}showModal(){this.open=true;}close(){this.open=false;}}
 for(const match of source.matchAll(/<([\w-]+)[^>]*\bid="([^"]+)"/g)){assert(!nodes.has(match[2]),'duplicate DOM id '+match[2]);nodes.set(match[2],new Element(match[1]));}
 const menus=['learn','materials','worksheet','notes'].map(view=>{const el=new Element('button');el.dataset.view=view;return el;});
 const frame=nodes.get('live-frame');let stops=0;frame.contentWindow={soundPreview:{stop(){stops++;}}};
 const select=selector=>selector==='.lesson-link'?all.filter(e=>e.className==='lesson-link'):selector==='[data-view]'?menus:selector==='[data-filter]'?all.filter(e=>e.dataset.filter):[];
 const doc={getElementById(id){assert(nodes.has(id),'missing DOM id '+id);return nodes.get(id);},createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),createElementNS:(_,tag)=>new Element(tag),querySelectorAll:select,addEventListener:(k,f)=>events['doc:'+k]=f};
 for(const el of all)el.ownerDocument=doc;const originalCreate=doc.createElement;doc.createElement=tag=>{const el=originalCreate(tag);el.ownerDocument=doc;return el;};doc.createElementNS=(_,tag)=>doc.createElement(tag);
 const location={hash,origin:'https://test.example',href:'https://test.example/week10/'},storage=new Map(saved?[['icm-week10-sound-v1',JSON.stringify(saved)]]:[]),win={SoundCore:C,soundCourse:D,SoundRuntime:R,SoundGuide:G,SoundIllustrations:I,addEventListener:(k,f)=>events[k]=f};
 vm.runInNewContext(fs.readFileSync('studio.js','utf8'),{window:win,document:doc,location,URL,Blob,localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){storage.set(k,v);writes.push(v);}},history:{replaceState(_,__,value){location.hash=value;}},getComputedStyle:()=>({lineHeight:'24px'}),setTimeout,Date,navigator:{clipboard:{writeText:async()=>{}}}});
 return {nodes,events,location,store:()=>JSON.parse(storage.get('icm-week10-sound-v1')),stops:()=>stops,route(id){location.hash='#'+id;events.hashchange();},input(id,value){const n=nodes.get(id);n.value=value;n.handlers.input({target:n});}};
}
test('all nine routes load the matching editable source, explanations and prepared files',()=>{
 const h=desk();for(const l of D.lessons){h.route(l.id);assert.equal(h.nodes.get('practice-code').value,l.lines.map(x=>x.code).join('\n'));assert.equal(h.nodes.get('selected-code').textContent,l.lines[0].code);assert.equal(h.nodes.get('line-meaning').textContent,l.lines[0].meaning);assert.equal(h.nodes.get('lesson-files').href,'./lessons/'+l.id+'/files.zip');assert(h.nodes.get('live-frame').srcdoc.includes('vendor/p5.sound.min.js'));}assert(h.stops()>8);
});
test('every lesson exposes its own goal, concept check, interactive controls and exact class sources',()=>{
 const h=desk();for(const l of D.lessons){h.route(l.id);assert.equal(h.nodes.get('lesson-goal').textContent,G.lessons[l.id].goal);assert.equal(h.nodes.get('quick-question').textContent,G.lessons[l.id].check.question);assert.equal(h.nodes.get('lesson-sources').children.length,G.lessons[l.id].sources.length);assert(h.nodes.get('diagram-controls').children.length>0);}assert.equal(h.nodes.get('course-map').children.length,9);
});
test('practice navigation focuses the correct guide line while retaining edited code',()=>{
 const h=desk('#bank');h.nodes.get('next-step').click();assert.equal(h.nodes.get('selected-code').textContent.trim(),G.lessons.bank.focus[1]);h.input('practice-code','// keep my experiment');h.nodes.get('next-step').click();assert.equal(h.nodes.get('practice-code').value,'// keep my experiment');assert.equal(h.nodes.get('selected-code').textContent.trim(),G.lessons.bank.focus[2]);assert.match(h.nodes.get('practice-focus-status').textContent,/draft/i);
});
test('a wrong answer never completes a lesson; a correct concept check stays separate from class submission',()=>{
 const h=desk(),check=G.lessons.unlock.check,buttons=h.nodes.get('quick-options').children;buttons[(check.answer+1)%3].click();assert.notEqual(h.store().learned.unlock,true);buttons[check.answer].click();assert.equal(h.store().learned.unlock,true);assert.notEqual(h.store().checks.worksheet,true);h.route('single');assert.notEqual(h.store().learned.single,true);
});
test('line navigation follows code; draft reset is reversible and edits restore paused',()=>{
 const h=desk();h.nodes.get('next-line').click();assert.equal(h.nodes.get('selected-code').textContent,D.lessons[0].lines[1].code);assert.equal(h.store().positions.unlock.line,1);
 h.input('practice-code','// my experiment');assert.equal(h.store().drafts.unlock,'// my experiment');h.nodes.get('reset-code').click();assert(!h.nodes.get('practice-code').value.includes('my experiment'));h.nodes.get('undo-code').click();assert.equal(h.nodes.get('practice-code').value,'// my experiment');assert.equal(h.nodes.get('live-frame').srcdoc,'');
 const restored=desk('#unlock',h.store());assert.equal(restored.nodes.get('practice-code').value,'// my experiment');assert.equal(restored.nodes.get('live-frame').srcdoc,'');assert.match(restored.nodes.get('preview-status').textContent,/paused/);
});
test('notes are kept per lesson and only matching-frame messages can update the UI',()=>{
 const h=desk();h.input('lesson-note','I changed the pitch.');h.route('pitch');h.input('lesson-note','Higher frequency.');h.route('unlock');assert.equal(h.nodes.get('lesson-note').value,'I changed the pitch.');assert.equal(h.store().notes.pitch,'Higher frequency.');
 const before=h.nodes.get('preview-status').textContent;h.events.message({origin:'https://other.example',source:h.nodes.get('live-frame').contentWindow,data:{kind:'ready',token:'wrong'}});assert.equal(h.nodes.get('preview-status').textContent,before);
 h.route('materials');assert.equal(h.nodes.get('materials-view').hidden,false);assert.equal(h.nodes.get('learn-view').hidden,true);
});
