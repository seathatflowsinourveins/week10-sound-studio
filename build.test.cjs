const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const D=require('./course-data.js'),root=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
test('build is deterministic, complete and excludes private inputs',()=>{
 const build=()=>execFileSync(process.execPath,['scripts/build.cjs'],{cwd:root,encoding:'utf8'}),first=JSON.parse(build()),release=fs.readFileSync(path.join(root,'dist/release.json'));assert.equal(build().trim(),JSON.stringify(first));assert.deepEqual(fs.readFileSync(path.join(root,'dist/release.json')),release);
 const manifest=JSON.parse(release);assert.equal(manifest.lessons,9);assert.equal(manifest.lines,304);assert.equal(manifest.resources,42);
 for(const file of manifest.files){const b=fs.readFileSync(path.join(root,'dist',file.path));assert.equal(b.length,file.bytes);assert.equal(sha(b),file.sha256,file.path);assert(!/Worksheet 10|Diatonic Scale|progress\.json|evidence\/|docs\//.test(file.path));}
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');assert(html.includes('build '+first.release));
 for(const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:\?[^"#]*)?(?:#[^"]*)?"/g))assert(fs.existsSync(path.join(root,'dist',match[1])),match[1]);
 for(const lesson of D.lessons){assert.equal(fs.readFileSync(path.join(root,'dist/lessons',lesson.id,'sketch.js'),'utf8'),lesson.lines.map(x=>x.code).join('\n')+'\n');assert(fs.statSync(path.join(root,'dist/lessons',lesson.id,'files.zip')).size>200000);for(let i=0;i<5;i++)assert.deepEqual(fs.readFileSync(path.join(root,'dist/lessons',lesson.id,'sound-'+i+'.wav')),fs.readFileSync(path.join(root,'dist/sound-'+i+'.wav')));}
 assert.equal(sha(fs.readFileSync(path.join(root,'vendor/p5.min.js'))),'bb8b82b97fcbcd5bb2d5475d1b6a3904f3ab4ed01b821134fd8f1e7710fce559');assert.equal(sha(fs.readFileSync(path.join(root,'vendor/p5.sound.min.js'))),'a1ab1dcac4b5cfa68c077fee2a8d43deb630d20498fc3f54f56c9ee90ab7d5b1');
});
