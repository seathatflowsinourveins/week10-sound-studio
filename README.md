# Week 10 · Sound Studio

[Open the illustrated guide](https://seathatflowsinourveins.github.io/week10-sound-studio/#unlock) · [Original Week 10 assignment](https://github.com/ITPNYU/ICM-2026-Media/wiki/Homework-Mimi-07#week-10)

A dark, beginner-friendly study desk. The selected code line aligns with its explanation; an interactive silent diagram sits beside the actual p5 preview below. On a phone the paired regions stack, with direct jump buttons. No account is needed to practice here. Use the full p5 editor to sign in and save your own submission sketches.

## Start here

1. Open **Lesson 1: Make one sound**. The drawing loads silently.
2. Click **Try in p5 ↓**, then press **Play** and **Stop** inside the sketch.
3. Use **Next line** to match an explanation to the highlighted code row. **Try in p5** jumps directly to the sound controls.
4. Follow the three small practices. Each has a button that focuses its exact guide line. Edited code is kept, and any mismatch is labeled.
5. Try the concept check, write your own observation and continue. The course map shows all nine goals; every lesson links its class sources. **Worksheet** connects practice to all five deliverables; **Materials** holds the complete source map, 14 syntax examples and the full glossary.

Silent diagram controls explore the model. Real p5 sliders also update the model, but the diagrams are not measured audio or microphone readings. Start sound only through the actual sketch controls.

The original sound assets are short synthesized tones, supplied as `sound-0.wav`–`sound-4.wav`. Every lesson ZIP includes `GUIDE.md` with its goal, practices, every line explained and class source links. Replace the tones with sounds you may use when making your own piece.

## Learning order

1. Audio activation, variables and event handlers.
2. One file: async loading, play and pause — worksheet 1.
3. Five files: arrays, loops and number keys — worksheet 2.
4. Frequency, amplitude and waveform shape.
5. Scale ratios and your own scale — worksheet 4.
6. Amplitude, microphone opt-in and threshold crossing — worksheet 3.
7. FFT bins and waveform — worksheet 3 challenge.
8. Touch-friendly ear training: quiet fixed tonic plus moving note, marks/reveal and image export — prepare for the official worksheet 5 trainer.
9. Listening notes, class discussion and a clearly marked Week 11 bridge.

Week 10 requires the worksheet and listening preparation. The 60-second algorithmic composition is the **next assignment**. This site does not invent a score, reflection or completed submission.

## Save your own p5 sketch

Get the lesson ZIP, unzip it, and create a **new** sketch in the [p5 editor](https://editor.p5js.org/). Replace `sketch.js` and `index.html`, and upload the five WAV files beside them. Run and press the sound control. Save your sketch and keep its URL in Worksheet. Older class examples use several p5 versions; the supplied HTML pins the versions used here.

## Continue on an iPhone or another computer

Open the same public guide link. Notes, edited drafts, worksheet links, concept checks and your current line save **in that browser**. They do not sync through GitHub. Use **My notes → Export my progress**, transfer that JSON file, and choose **Import progress** on the other device. Review the merge before applying it. Restored edited code stays paused until you press Run. Concept checks do not complete or submit class work. Earlier combined article/scene flags are preserved, while the current checklist tracks those two requirements separately.

Audio starts after a gesture. **Stop all sound**, changing lesson, hiding the page and leaving the guide stop the active preview; press **Run my code** to prepare a stopped preview again. Microphone access is optional, requested only by its button, and never recorded or uploaded. The default microphone lesson uses a visibly labeled simulated signal.

## Develop and verify

Node 22 or newer; no npm dependencies or install step.

```sh
npm test
npm run build
npm start
```

Open `http://127.0.0.1:8759/` after building. Build output is `dist/`; it contains an explicit public allowlist, generated WAVs, lesson ZIPs, a written `MANIFEST.md`, and `release.json` with every deployed file's SHA-256. Private worksheet originals, raw research and local progress are excluded.

Tests exercise lesson syntax/behavior, gesture gates, microphone routing, late permission cleanup, progress transfer, math, audio asset headers, archive contents and deployment parity. Native stubs do not establish audible playback, microphone permission or iPhone hardware behavior. Check those in an actual browser before claiming them.

See [source and design decisions](SOURCES.md) and [third-party notices](THIRD_PARTY.md). GitHub Actions tests and builds the same source before deploying Pages.
