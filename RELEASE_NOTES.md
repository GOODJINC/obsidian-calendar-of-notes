# Calendar of Notes 0.2.0

This feature release makes date matching more flexible while keeping Calendar of Notes compact and local-first.

## What's new

- Choose `YYYY-MM-DD`, `YYYY.MM.DD`, `YYYY_MM_DD`, or `YYYYMMDD` for filename dates.
- Configure multiple frontmatter date properties, one per line.
- Include or exclude notes by vault-relative folder or tag.
- Match child folders and hierarchical child tags automatically.
- Open notes in the current tab, a new tab, or a new split.
- Use Ctrl-click or Command-click to override the setting and open a new tab.

## Compatibility and reliability

- Existing `0.1.x` single-property and custom-regex settings migrate automatically.
- Invalid calendar dates continue to be ignored.
- Exclusion filters take priority over inclusion filters.
- Automated coverage now includes 28 tests for date parsing, filename formats, multiple properties, filters, settings migration, opening behavior, and the note index.

Calendar of Notes remains read-only: it does not create, rename, edit, or delete notes.
