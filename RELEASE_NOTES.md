# Calendar of Notes 0.3.0

This release addresses the automated Community Plugins review and strengthens compatibility, privacy, and release provenance.

## Review fixes

- Calendar leaves are no longer detached when the plugin unloads, so users keep their chosen sidebar location.
- The declared minimum Obsidian version now matches every API used by the plugin.
- Settings are searchable through Obsidian's declarative settings API on 1.13+, with the same settings available on older supported versions.
- The unnecessary frontmatter type assertion and the `builtin-modules` dependency were removed.
- All `!important` declarations were replaced with scoped selectors.

## Privacy and performance

- Vault-wide Markdown enumeration now starts only when the calendar is opened or restored.
- After initial indexing, only changed files are updated through Vault and Metadata Cache events.
- The README now clearly explains the metadata access required to build the calendar.

## Release security

- GitHub Actions now creates cryptographic provenance attestations for `main.js`, `manifest.json`, and `styles.css`.
- CI now runs the Obsidian submission validator and dedicated CSS compatibility checks.
- The configured note opening location now also applies to week-view previews.

The Obsidian submission validator passes with 0 errors and 0 warnings. Calendar of Notes remains local-only and read-only.
