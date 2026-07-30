# Calendar of Notes development checklist

This checklist covers the work needed after the initial implementation and before a public Obsidian Community Plugins release.

## Current status (2026-07-30)

- [x] Publish the repository at `GOODJINC/obsidian-calendar-of-notes`.
- [x] Publish the `0.1.0` pre-release with `main.js`, `manifest.json`, and `styles.css` attached.
- [x] Pass the build, test, and lint workflow on `main`.
- [x] Make the tagged release workflow tolerate a missing `RELEASE_NOTES.md` file.
- [x] Make the tagged release workflow safely update an existing release and replace its assets.
- [x] Update GitHub Actions and the release build to the Node.js 24 runtime.
- [x] Push the workflow fix and confirm it with the `0.1.1` patch-version tag.
- [ ] Finish the priority manual QA items below before submitting to Community Plugins.
- [x] Publish `0.1.1` as a non-pre-release after automated verification.
- [x] Add common filename date formats, multiple date properties, folder/tag filters, and note open locations.
- [x] Add migration coverage so existing `0.1.x` settings continue to work.
- [x] Publish and verify the `0.2.0` feature release.

## Local setup

- [ ] Run `npm install` on each new development machine.
- [ ] Create a dedicated test vault; do not develop in a primary vault.
- [ ] Link or copy `main.js`, `manifest.json`, and `styles.css` to `.obsidian/plugins/calendar-of-notes/`.
- [ ] Enable Community plugins and Calendar of Notes in the test vault.
- [ ] Add fixtures covering filename dates, property dates, conflicts, invalid dates, and excluded folders.

## Automated verification

- [x] Run `npm run build` without TypeScript errors.
- [x] Run `npm test` without failures.
- [x] Run `npm run lint` and address actionable warnings.
- [x] Add NoteDateIndex unit tests with mocked Vault and MetadataCache objects.
- [ ] Add interaction tests for smart open, popup, hidden, and below-calendar list modes.
- [x] Add regression tests for leap years, month boundaries, and time-zone-bearing date-time values.
- [ ] Measure initial index time with 1,000, 10,000, and 50,000 Markdown files.

## Desktop manual QA

- [ ] Verify month navigation across December and January.
- [ ] Verify week navigation and locale-specific weekday labels.
- [ ] Verify all 12 mini calendars in year view.
- [ ] Verify the month picker, year picker, direct date jump, and Today action.
- [ ] Verify dates with zero, one, two, three, and four or more notes.
- [ ] Verify Smart open opens one note and lists multiple notes.
- [ ] Verify Below calendar, Popup, and Hidden list settings.
- [ ] Verify filename-only, property-only, property-first, and both-source matching.
- [ ] Verify property arrays and ISO date-time values.
- [ ] Verify invalid regular expressions are not saved.
- [ ] Verify excluded folders and all their descendants are omitted.
- [ ] Verify name, modified time, created time, and path sorting.
- [ ] Verify duplicate basenames display enough path context when paths are enabled.
- [ ] Verify the current theme's light and dark variants.
- [ ] Verify several popular community themes.
- [ ] Verify reopening Obsidian restores the custom view and its state.
- [ ] Verify pop-out windows if supported by the target Obsidian version.

## Keyboard and accessibility QA

- [ ] Navigate dates with Left, Right, Up, and Down arrow keys.
- [ ] Activate dates and note links with Enter and Space.
- [ ] Close dialogs with Escape.
- [ ] Confirm focus remains visible after navigation and view changes.
- [ ] Inspect accessible names for icon buttons, dates, and note counts.
- [ ] Test at 200% zoom and with increased system font size.
- [ ] Check contrast in selected, today, adjacent-month, and disabled states.

## Mobile QA

- [ ] Test on current Obsidian Mobile for Android.
- [ ] Test on current Obsidian Mobile for iOS or iPadOS.
- [ ] Confirm the plugin loads with `isDesktopOnly: false`.
- [ ] Confirm the view opens from both the ribbon and command palette.
- [ ] Confirm popup lists render as a usable bottom sheet.
- [ ] Confirm all controls have comfortable touch targets.
- [ ] Verify portrait, landscape, split view, and narrow sidebar layouts.
- [ ] Verify the year view remains readable and scrollable.
- [ ] Verify no hover-only behavior is required.

## Documentation and repository

- [x] Confirm the author and author URL in `manifest.json`.
- [ ] Add screenshots for desktop month view, year view, and mobile list popup.
- [ ] Add a short animated demonstration.
- [ ] Document every setting and its default.
- [x] Add `CHANGELOG.md` and follow Semantic Versioning.
- [ ] Add contribution and issue templates if external contributions are welcome.
- [x] Configure GitHub Actions for build, test, lint, and tagged releases.
- [x] Make tagged releases recoverable when release notes are absent or a release already exists.
- [x] Confirm no vault data, local settings, logs, dependencies, or generated `main.js` are tracked by Git.
- [ ] Review the Git diff before every release.

## Release preparation

- [x] Confirm `id` remains `calendar-of-notes`; plugin IDs cannot be changed after release.
- [x] Confirm the display name and plugin ID are unique in the current community plugin registry.
- [x] Choose and document Obsidian `1.5.0` as the supported minimum version.
- [x] Keep `manifest.json`, `package.json`, and `versions.json` aligned through `0.2.0`.
- [x] Produce a minified production `main.js` with `npm run build`.
- [x] Create the GitHub `0.1.0` release with a tag matching the manifest version.
- [x] Attach `main.js`, `manifest.json`, and `styles.css` to the GitHub release.
- [x] Confirm the corrected release workflow on the `0.1.1` version tag.
- [x] Publish the regular `0.2.0` release with release notes and all required assets.
- [ ] Complete Obsidian's plugin self-critique checklist.
- [ ] Submit the repository through the Obsidian Community Plugins portal.
- [ ] Address automated and manual review feedback in a new patch release.

## Deferred features

- [ ] Gather feedback before adding note creation.
- [ ] If note creation is added, support templates, target folders, conflicts, and safe filename normalization.
- [x] Add multiple configurable date properties.
- [x] Add persistent folder/tag filters without requiring Dataview.
- [ ] Consider week numbers as an optional display feature.
- [ ] Consider per-source marker colors while preserving theme compatibility and accessibility.
- [ ] Consider an optional Bases calendar view after the standalone view is stable.
