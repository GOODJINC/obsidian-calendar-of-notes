# Changelog

All notable changes to Calendar of Notes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-07-30

### Added

- Built-in filename date formats for `YYYY-MM-DD`, `YYYY.MM.DD`, `YYYY_MM_DD`, and `YYYYMMDD`.
- Multiple configurable frontmatter date properties.
- Included and excluded folder and tag filters with hierarchical matching.
- Note opening options for the current tab, a new tab, or a new split.

### Changed

- Separated filename date format and position into simpler settings.
- Added automatic migration for legacy single-property and custom-pattern settings.
- Expanded automated coverage for matching, filters, settings migration, and note opening behavior.

## [0.1.1] - 2026-07-30

### Fixed

- Made tagged releases work when `RELEASE_NOTES.md` is absent by using GitHub-generated notes.
- Made release retries update an existing release and replace its assets instead of failing.
- Updated the release workflow to GitHub Actions running on Node.js 24.

## [0.1.0] - 2026-07-30

### Added

- Month, week, and year calendar views.
- Direct date navigation with compact eight-digit input.
- Smart note opening and configurable note list placement.
- Filename and frontmatter date matching with property-first fallback.
- Simple filename date-position presets and advanced custom patterns.
- Note count markers, excluded folders, sorting, and optional paths.
- English and Korean localization.
- Responsive desktop and mobile layouts.
- Incremental metadata index and keyboard navigation.

[Unreleased]: https://github.com/goodjinc/obsidian-calendar-of-notes/compare/0.2.0...HEAD
[0.2.0]: https://github.com/goodjinc/obsidian-calendar-of-notes/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/goodjinc/obsidian-calendar-of-notes/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/goodjinc/obsidian-calendar-of-notes/releases/tag/0.1.0
