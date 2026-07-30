# Calendar of Notes

English | [한국어](https://github.com/GOODJINC/obsidian-calendar-of-notes/blob/main/README.ko.md)

A fast, compact, and local-first calendar for browsing existing Obsidian notes by date.

Requires Obsidian 1.7.2 or later.

Calendar of Notes indexes dates from filenames, note properties, or both. Select a day to open its note directly or review every matching note without leaving the sidebar.

> [!NOTE]
> Calendar of Notes is currently an early public beta. Test it in a separate vault before using it with important data.

## Highlights

- Month, week, and year views designed for sidebars and mobile drawers
- Previous/next navigation, month and year picker, direct date jump, and Today action
- Compact date entry: type `20260730` and it becomes `2026-07-30`
- Smart open: open one matching note immediately or show a list when several notes match
- Note lists below the calendar, in a popup, or completely hidden
- Up to three activity dots and a `+` indicator for dates with more notes
- Dates from filenames, frontmatter properties, property-first fallback, or both sources
- Four filename date formats, simple position choices, and advanced custom patterns
- Multiple frontmatter date properties
- Included and excluded folder or tag filters
- Configurable note opening in the current tab, a new tab, or a new split
- Note sorting, optional paths, and configurable week start
- English and Korean interface with automatic locale detection
- Responsive desktop and mobile layouts with keyboard navigation
- Incremental in-memory indexing using Obsidian's Vault and Metadata Cache events

Calendar of Notes only reads metadata and opens notes. It does not create, rename, edit, or delete your notes.

## Installation

### Community Plugins

Once Calendar of Notes is accepted into the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for **Calendar of Notes**.
3. Install and enable the plugin.

### Manual installation or beta testing

1. Download `main.js`, `manifest.json`, and `styles.css` from the matching GitHub Release.
2. Create this folder inside your vault:

   ```text
   <vault>/.obsidian/plugins/calendar-of-notes/
   ```

3. Copy the three files into that folder.
4. Reload Obsidian, then enable **Calendar of Notes** under **Settings → Community plugins**.

You can also install a released beta through [BRAT](https://github.com/TfTHacker/obsidian42-brat) by adding this repository URL.

## Getting started

Open Calendar of Notes from the ribbon calendar icon or the command palette. Use the compact view switcher at the top:

| Button | View |
| --- | --- |
| `M` | Month |
| `W` | Week |
| `Y` | Year |

Use the arrow buttons to move through the current period. Select the heading to choose a month or year, use the target button to return to today, or use the calendar-search button to jump directly to a date.

The date jump accepts either `YYYY-MM-DD` or eight digits such as `20260730`.

## Date matching

The default strategy is **Property, then filename**:

1. Use valid dates from the configured frontmatter properties.
2. If none of those properties contains a valid date, extract a date from the filename.

### Property example

```yaml
---
date: 2026-07-30
created: 2026-07-29
published:
  - 2026-08-01
---
```

Enter one property name per line. Valid dates from every configured property are included. ISO date-time values such as `2026-07-30T15:30:00+09:00` use the written calendar date without UTC conversion.

### Filename examples

| Date format | Matching example |
| --- | --- |
| `YYYY-MM-DD` | `2026-07-30 Note title.md` |
| `YYYY.MM.DD` | `2026.07.30 Note title.md` |
| `YYYY_MM_DD` | `2026_07_30 Note title.md` |
| `YYYYMMDD` | `20260730 Note title.md` |
| Custom pattern | Advanced regular expression with an ISO-date capture |

For built-in formats, choose whether the date appears at the beginning, anywhere, or as the entire filename. Every matched date is normalized to `YYYY-MM-DD`. Invalid dates such as `2026-02-29` are ignored.

## Filters

You can optionally include or exclude notes by vault-relative folder and tag. Enter one value per line. Folder rules include descendants, and a tag such as `project` also matches `project/calendar`. Exclusions take priority over inclusions.

## Date click behavior

| Mode | Behavior |
| --- | --- |
| Smart open | Opens one matching note directly; shows a list when several notes match |
| Always show list | Selects the date and displays its note list |
| Select only | Selects the date without opening a note or list |

The note list can appear below the calendar, in a popup, or remain hidden. On mobile, popup lists use a bottom-sheet layout.

Notes opened directly or from a list can use the current tab, a new tab, or a new split. Ctrl-click or Command-click always opens a new tab.

## Settings

Settings are grouped into five sections:

- **General:** language, default view, and startup date
- **Date matching:** date source, multiple property names, filename format, and date position
- **Filters:** included and excluded folders or tags
- **Behavior:** date click action, list placement, note sorting, and note opening location
- **Display:** week start, adjacent-month dates, and note paths

## Privacy and permissions

Calendar of Notes works locally inside your vault.

- No network requests
- No analytics or telemetry
- No accounts or payments
- No access to files outside the vault
- No note content modification or deletion

When the calendar is first opened or restored, the plugin enumerates Markdown files to build its date index. It reads filenames and cached frontmatter/tag metadata, not note bodies. After the initial index, Vault and Metadata Cache events update only the changed files. Folder and tag filters are applied locally.

Plugin settings are stored through Obsidian's standard plugin data API.

Release assets are built and cryptographically attested by GitHub Actions. For example, downloaded assets can be verified with `gh attestation verify main.js -R GOODJINC/obsidian-calendar-of-notes`.

## Development

Requirements:

- Node.js 24 or later
- npm
- A separate Obsidian development vault

```bash
npm install
npm run dev
```

Verification:

```bash
npm run build
npm test
npm run lint
```

The production build generates `main.js` locally. This generated file is intentionally excluded from Git and attached to GitHub Releases by the release workflow.

## License

[MIT](LICENSE)
