# First lesson reading pass · 11 November 2026

Outcome: make the existing Lesson 1 line reader usable by a first-time coder. Acceptance: each of its 29 exact source lines has a short meaning and a concrete word/symbol note; definition versus execution and delayed Play cancellation are explicit. The executable code, runtime pins, progress schema and lesson order remain identical.

Approach: fill the existing `meaning` and `detail` fields rather than introducing another tutorial panel or a separate application. The current reader, written guide and ZIP builder already consume these fields. This keeps one set of teaching notes beside the real code and in the downloads.

1. Root edits only Lesson 1 copy in course-data.js and the relevant README sentence. A read-only reviewer has identified the name/punctuation, definition/call and cancellation-example gaps.
2. Compare every lesson's executable source against the prior commit. Run the required native suite/build; check generated Lesson 1 guide and archive include the detail text. No new tests for prose that mirror its implementation.
3. Review the first, setup, ticket and cancellation lines in the browser, retaining the current layout. Publish through the existing Pages workflow, verify exact CI head and hosted hashes, and open the first line for one-step-at-a-time tutoring.

No dependency, configuration or upstream-pattern adoption is proposed. Retain the explicit runtime and design holds recorded in SOURCES.md at the earlier 11 November checkpoint. Source semantics are verified against the installed pinned pair, not inferred from newer tutorials.
