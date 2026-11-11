# Third-party libraries and credits

The studio's original code, teaching text, SVG illustrations and synthesized samples use the MIT license in `LICENSE`. Linked class resources keep their original ownership. Design repositories are credited in `SOURCES.md`; their implementation code was not copied.

## p5.js 2.3.4

- [Processing Foundation p5.js](https://github.com/processing/p5.js/tree/v2.3.4), LGPL 2.1.
- Unmodified minified distribution: `vendor/p5.min.js`.
- SHA-256: `bb8b82b97fcbcd5bb2d5475d1b6a3904f3ab4ed01b821134fd8f1e7710fce559`.
- License text: `vendor/p5-LICENSE.txt`. Corresponding upstream source and build instructions are available at the exact tag above and in the [versioned npm package](https://www.npmjs.com/package/p5/v/2.3.4).

## p5.sound 0.4.1

- [Maintained p5.sound](https://github.com/processing/p5.sound.js), LGPL 2.1.
- Unmodified npm distribution: `vendor/p5.sound.min.js`.
- SHA-256: `a1ab1dcac4b5cfa68c077fee2a8d43deb630d20498fc3f54f56c9ee90ab7d5b1`.
- Exact source distribution: [p5.sound 0.4.1 tarball](https://registry.npmjs.org/p5.sound/-/p5.sound-0.4.1.tgz), with both minified and unminified bundles. License: `vendor/p5.sound-LICENSE.txt`.
- npm integrity: `sha512-cOny1h9mjGl0TemaoN4WDfNkno4I2czveXtvaYDJrmyCfpVLsOQgDG6kyKqIOQeYrfMnaW2GbTO85o7t+UjSJQ==`.
- The bundle incorporates Tone.js (MIT, Yotam Mann), Microsoft TypeScript helpers (permissive notice retained upstream), and other dependencies. See `vendor/sound-bundled-notices.txt` for retained attribution and license texts. Oscillator coefficients additionally credit Alan deLespinasse under Apache 2.0 in the upstream bundle.

Libraries are separate replaceable browser scripts; no changes were made to their binaries. Their source/build links permit inspection and replacement. Lesson ZIPs reference the same exact versions on jsDelivr and contain only our own application/assets, not a relicensed copy of the libraries.
