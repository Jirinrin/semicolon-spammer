# semicolon-spammer README

This is the README of ;;;;;;;;. :)
Because everyone (or at least me) loves using semicolons over... *not* using them... (like is allowed in JavaScript)

## Features

;;;;;;;; only has 1 feature: use a command (called `toggleSemicolons` // `Toggle Semicolons`) to add/remove semicolons to the ends of all currently selected lines (or the current line that the cursor is at).

(Will only remove if *all* selected lines already have a semicolon at the end)

Will *not* place a semicolon when:
- the current line is empty;

## Known Issues

No known issues as of version 1.0.1.

- Still need to look into whether pages at beginning/end are properly (not) parsed.

## Planned Features

Smarter detection to not place a semicolon when:
    (and for `}`: should intelligently know whether it delimits and object or e.g. an if statement)
- the current line is part of a `(...)` / `[...]` / `<...>` (with commas or sth / direct so not e.g. `({})`)
- if the current line is part of a `{}`
- the current line is the last part of a list of commas that still needs to receive a `}`/`)`/`]`/`>`
- the current

Functions to turn such filters on/off / change which characters are affected by them;

## Release Notes

### 1.0.0

Initial release of ;;;;;;;;

### 1.0.1

Expanded Readme slightly