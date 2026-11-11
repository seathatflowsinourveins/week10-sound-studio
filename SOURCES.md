# Sources and version decisions

Checked 10 November 2026. Explanations, diagrams and practice programs are original teaching material. Class programs stay linked and credited, rather than being republished wholesale. User-provided worksheet/CSV originals and unrelated starred-repository metadata are excluded from this public repository.

## Class scope

- [Homework Mimi 07, Week 10](https://github.com/ITPNYU/ICM-2026-Media/wiki/Homework-Mimi-07#week-10), wiki snapshot `7196d13d1b1532c8fde61990a66118cfb6c52591`.
- [Sound Part 1](https://github.com/ITPNYU/ICM-2026-Media/blob/main/weeks/03_sound.md), captured blob `044b8a74a026f16873d1c24a65879b48c0c125d6`.
- [Worksheet 10](https://docs.google.com/document/d/1lFOTCPj9W_nhhzu7qmO7m69KnZg1nSGAjhjukylsCJk/edit) and [scale table](https://docs.google.com/spreadsheets/d/1uX-SM9GPBZFAGpAV5AId7f66OlZipWzIfmG-ubiqdWc/edit). Direct exports returned HTTP401 and the browser showed “You need access.” Learner-supplied text/CSV then resolved the missing content. The five tasks are paraphrased. No private student answers are included.
- The table supplies tonic **131 Hz** and rounded ratios `[1, 1.125, 1.25, 1.34, 1.5, 1.67, 1.875, 2]`. These are the class values, not an assertion of exact equal temperament or exact just intonation.
- Notes and Neurons viewing is **26:00–1:14:00**, approximately 48 minutes. The reading/viewing cards are preparation prompts, not invented firsthand observations or a summary of an inaccessible article.
- [Next assignment, Week 11](https://github.com/ITPNYU/ICM-2026-Media/wiki/Next-Assignment#week-11) supplies the 60-second composition requirement; it is labeled as a bridge beyond this week.

## Runtime pins and contrary evidence

The modern class loadSound example uses **p5 2.3.4 + p5.sound 0.4.1**. This studio uses the same pair. Upstream p5 latest was still 2.3.4 at verification; p5.sound main identified 0.4.2 at revision `3071d5b3d51d76823092ff1928c1153422db037b`. **Hold 0.4.1** to preserve the verified class pair. Recheck when an observed compatibility problem or class change warrants updating, and rerun the browser/audio checks before adopting it.

The maintained sound source is [processing/p5.sound.js](https://github.com/processing/p5.sound.js). The older [processing/p5.js-sound](https://github.com/processing/p5.js-sound) README marks that implementation as sunset. These packages are not interchangeable without checking APIs.

Captured class sketches mix versions:

| Example | Actual p5 version in its HTML |
| --- | --- |
| Single loadSound `ihHM4sthU` | 2.3.4 + sound 0.4.1 |
| Mic Amp `6XCqY2UbS` | 0.9.0, despite the title saying “v2” |
| Mic FFT `Xs5E9gPoG` | 0.9.0 |
| Hearing test `cc1d9pqXA` | 0.9.0 |
| Melody/ratios `2RUsbuNNo` | 1.5.0 |
| Official ear trainer `ugARgFTL7` | 0.8.0 |

Pinned implementation checks: `getAudioContext()` returns a native AudioContext; new FFT bins use 0–1 and waveform values use −1–1. AudioIn `.start()` returns undefined and handles permission asynchronously; awaiting it does not prove success. Microphone routing disconnects the default speaker route before connecting the amplitude analyzer. The UI distinguishes practice, pending/unavailable, and a live stream.

Primary references: [p5.sound](https://p5js.org/reference/p5.sound/), [Oscillator](https://p5js.org/reference/p5.sound/p5.Oscillator/), [loadSound](https://p5js.org/reference/p5/loadSound/), and the unmodified pinned package implementation. A first attempt at the old oscillator reference URL returned 404; the official sound index supplied the current path. The npm tarball has distribution code, not a `src/` directory; implementation checks used its unminified distribution instead.

## Selected starred design/workflow references

A bounded scan of 300 starred repositories informed this shortlist; it was not an exhaustive survey or an objective “state of the art” ranking. No external skill scripts were executed and no model, provider, authentication or global configuration was changed.

| Primary source | Inspected revision | Adapted idea |
| --- | --- | --- |
| [Diagram Design](https://github.com/cathrynlavery/diagram-design) | `f2496acbde9f45ccb55c24d4f75210c8a1355df8` | Low-density semantic SVG diagrams, readable labels and explicit controls. |
| [Hallmark](https://github.com/Nutlope/hallmark) | `7e213cb6feb4ef82733bd66a0600b2e54ca0994c` | Shared dark tokens, focus states, contrast and responsive working layouts. |
| [Waza](https://github.com/tw93/Waza) | `6095341ad46b063619f4d0a5afc1c6fa8f1b4696` | Scoped independent review, exact evidence and source/build parity. |

Native HTML/CSS/SVG avoids a framework installation, extra dependencies and iframe login problems. Illustrations identify when they show a concept rather than measured sound; the p5 previews perform the actual exercises. The previous Week 9 site and saved sketch remain separate.
