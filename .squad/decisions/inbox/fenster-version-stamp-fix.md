### Fix: squad.agent.md excluded from TEMPLATE_MANIFEST upgrade loop
**By:** Fenster (Core Dev)
**PR:** #212 (Closes #195)
**What:** `squad.agent.md` is now excluded from the `TEMPLATE_MANIFEST.filter(f => f.overwriteOnUpgrade)` loop in `upgrade.ts`. It is already handled explicitly with copy + `stampVersion()` earlier in the function.
**Why:** The manifest loop overwrites the version-stamped file with the raw template, resetting the version to `0.0.0-source`. This caused `isAlreadyCurrent` to never pass and all 30+ files to be re-copied on every upgrade.
**Impact:** Any future manifest entries that require post-copy transformation must also be excluded from the bulk loop and handled individually.
