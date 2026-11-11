const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const course = require('./course-data.js');
const filename = path.join(__dirname, 'lesson-guide.js');

function guide() {
  assert.ok(fs.existsSync(filename), 'lesson-guide.js must provide the lesson teaching guide');
  return require(filename);
}

test('every course route receives the teaching fields rendered by the lesson view', () => {
  const { lessons } = guide();
  assert.deepEqual(Object.keys(lessons).sort(), course.lessons.map(lesson => lesson.id).sort());
  assert.equal(Object.keys(lessons).length, 9);
  for (const lesson of course.lessons) {
    for (const field of ['goal', 'before', 'success']) {
      assert.equal(typeof lessons[lesson.id][field], 'string', `${lesson.id}: ${field}`);
      assert.ok(lessons[lesson.id][field].trim(), `${lesson.id}: empty ${field}`);
    }
  }
});

test('browser script and CommonJS expose the same guide without requiring a DOM', () => {
  const exported = guide();
  const browser = { window: {} };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), browser);
  assert.ok(browser.window.SoundGuide, 'the lesson view reads window.SoundGuide');
  assert.deepEqual(JSON.parse(JSON.stringify(browser.window.SoundGuide)), exported);
});

test('each lesson step points to an exact code line available for highlighting', () => {
  const { lessons } = guide();
  for (const lesson of course.lessons) {
    const focus = lessons[lesson.id].focus;
    assert.equal(focus.length, 3, `${lesson.id}: three guided steps`);
    assert.equal(focus.length, lesson.steps.length, `${lesson.id}: step alignment`);
    const code = new Set(lesson.lines.map(line => line.code.trim()));
    for (const anchor of focus) {
      assert.equal(anchor, anchor.trim(), `${lesson.id}: trimmed anchor`);
      assert.ok(code.has(anchor), `${lesson.id}: missing code anchor ${anchor}`);
    }
  }
});

test('lesson source cards resolve to existing resources for the relevant activity', () => {
  const { lessons } = guide();
  const expected = {
    unlock: ['p5-sound-reference', 'oscillator-reference', 'audio-context-resume'],
    single: ['class-load', 'tutorial-load'],
    bank: ['worksheet', 'tutorial-load'],
    pitch: ['class-hearing', 'oscillator-reference'],
    scales: ['scale-sheet', 'class-melodies'],
    mic: ['class-mic', 'tutorial-amplitude'],
    fft: ['class-fft', 'fft-reference'],
    ear: ['do-a-deer', 'class-ear'],
    prepare: ['notes-neurons', 'speech-song', 'freytag', 'amadeus']
  };
  const resourceIds = new Set(course.resources.map(resource => resource.id));
  for (const [id, sources] of Object.entries(expected)) {
    assert.deepEqual(lessons[id].sources, sources, `${id}: source cards`);
    for (const resource of lessons[id].sources) assert.ok(resourceIds.has(resource), `${id}: broken resource ${resource}`);
  }
});

test('self-checks have three distinct choices and one usable answer with feedback', () => {
  for (const [id, lesson] of Object.entries(guide().lessons)) {
    const { question, options, answer, why } = lesson.check;
    assert.ok(typeof question === 'string' && question.trim(), `${id}: question`);
    assert.equal(options.length, 3, `${id}: choice count`);
    assert.ok(options.every(option => typeof option === 'string' && option.trim()), `${id}: blank choice`);
    assert.equal(new Set(options.map(option => option.trim().toLowerCase())).size, 3, `${id}: duplicate choice`);
    assert.ok(Number.isInteger(answer) && answer >= 0 && answer < options.length, `${id}: answer index`);
    assert.ok(typeof why === 'string' && why.trim(), `${id}: explanatory feedback`);
  }
});

test('syntax help covers the requested reading tools with valid JavaScript examples', () => {
  const { syntax } = guide();
  assert.deepEqual(syntax.map(entry => entry.term).sort(), ['=', '()', '{}', '[]', ';', '.', 'new', '=>', '!', '&&', 'true / false', 'if', 'for', 'scope', '++', '!==', 'try / catch'].sort());
  for (const entry of syntax) {
    assert.ok(typeof entry.meaning === 'string' && entry.meaning.trim(), `${entry.term}: explanation`);
    assert.ok(typeof entry.example === 'string' && entry.example.trim(), `${entry.term}: example`);
    assert.doesNotThrow(() => new vm.Script(entry.example), `${entry.term}: example must compile`);
  }
});
