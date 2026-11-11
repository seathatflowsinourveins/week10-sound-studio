const test=require('node:test'),assert=require('node:assert/strict');
const C=require('./core.js');
test('progress preserves bounded per-lesson line and practice positions',()=>{
 const result=C.normalize({version:1,positions:{pitch:{line:11,step:2},unknown:{line:1},mic:{line:-2,step:1e5}}});
 assert.deepEqual(result.positions,{pitch:{line:11,step:2},mic:{line:0,step:99}});
 assert.equal(C.merge(result,{version:1,positions:{pitch:{line:15,step:1}}}).positions.pitch.line,15);
});
test('class ratios produce the supplied CSV frequencies and octave',()=>{
 assert.deepEqual(C.RATIOS,[1,1.125,1.25,1.34,1.5,1.67,1.875,2]);
 assert.deepEqual(C.RATIOS.map(r=>C.frequency(131,r)),[131,147.375,163.75,175.54,196.5,218.77,245.625,262]);
 assert.equal(C.frequency(220,2),440);assert.equal(C.beatSeconds(120),.5);
});
test('wave and threshold diagrams keep amplitude and pitch distinct',()=>{
 assert.equal(C.wave('sine',.25),1);assert.equal(C.wave('triangle',0),-1);
 for(const type of ['sine','triangle','square','sawtooth'])for(let i=0;i<64;i++)assert(Math.abs(C.wave(type,i/64))<=1);
 assert.equal(C.crossed(.01,.08,.05),true);assert.equal(C.crossed(.08,.09,.05),false);
 assert.equal(C.crossed(.08,.02,.05),false);
});
test('progress imports accept only known fields and bounded learner text',()=>{
 const clean=C.normalize({version:1,lesson:'single',notes:{single:'my note',foreign:'bad'},links:{1:'https://editor.p5js.org/me/sketches/abc'},checks:{worksheet:true,unexpected:true},drafts:{single:'let sound;',bad:'x'},evil:'drop'});
 assert.equal(clean.lesson,'single');assert.deepEqual(clean.notes,{single:'my note'});assert.deepEqual(clean.drafts,{single:'let sound;'});assert.equal(clean.evil,undefined);assert.equal(clean.checks.unexpected,undefined);
 assert.throws(()=>C.normalize({version:7}),/version/);assert.throws(()=>C.normalize([]),/progress/);
 assert.equal(C.normalize({version:1,lesson:'unknown'}).lesson,'unlock');
});
test('merging transfer retains unrelated local work and applies intentional imported fields',()=>{
 const a=C.normalize({version:1,notes:{single:'old',pitch:'keep'},drafts:{bank:'keep'},checks:{worksheet:true}}),b=C.normalize({version:1,notes:{single:''},drafts:{ear:'new'},checks:{ear:true}});
 const merged=C.merge(a,b);assert.equal(merged.notes.single,'');assert.equal(merged.notes.pitch,'keep');assert.equal(merged.drafts.bank,'keep');assert.equal(merged.drafts.ear,'new');assert.equal(merged.checks.worksheet,true);assert.equal(merged.checks.ear,true);
});
