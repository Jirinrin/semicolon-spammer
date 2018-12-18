# Semicolon-Spammer README;

This is the README of `;;;;;;;;`. :) <br>
Because everyone (or at least me) loves using semicolons over... *not* using them... and I'm of course referring to JavaScript, which is what this extension was originally built for. <br>
So yes, the extension is approaching a level where you can basically Ctrl+A and run this command to intelligently place semicolons wherever needed in your JavaScript file! >^<

## Features;

`;;;;;;;;` only has 1 feature: use a command (called `toggleSemicolons` // `Toggle Semicolons`) to add/remove semicolons to the ends of all currently selected lines (or the current line that the cursor is at);

Will only remove if *all* selected lines already have a semicolon at the end;

Will *not* place a semicolon when:
- the current line is empty;
- the current line ends with certain characters;
- the current line ends with a certain character (but does place when that character appears 2 times: e.g. ++/--);
- the current line starts with certain characters;
- the current line contains certain characters (provided they are not part of a string);
- the next line starts with certain characters;
- the (end of the) current line is part of a comment;
- the (end of the) current line is part of a `()`/`[]` closure;
- the (end of the) current line is part of a multi-line string;
- the current line is part of a `{}` closure that is an object;
- the current line ends with a `}` of a closure that is not an object;
<br>
In this, the 'certain characters' are defined in the file `filterInfo.ts` in the extension files;
Will eventually make this editable; <br>

Will not *remove* a semicolon if it's part of a comment / multi-line string;

## Known Issues;

The closures for `<>` aren't properly detected because of arrow syntax and less than / greater than;
(Which is why for the time being they have been removed;)

All the closure detecting has made the semicolon placing sometimes slightly too slow for my preference (esp. with larger quantities/documents);

## Planned Features;

(Maybe add a feature for a different command to basically do `Ctrl+;` and `Ctrl+Enter` in the same command?)

Make the thing intelligent about `<>` closures;

Functions to turn such filters on/off / change which characters/words are affected by them;

Make it so that most filters only work when working in a JS/TS/... file;

Built-in `Ctrl+;` shortcut;

Checking to what extent this works for TypeScript? (Though I think it should mostly be working already because of the intelligent closure detection!)
Maybe support for JSX? (For the time being, to make it work you can put your JSX in parentheses (`()`), and close your 'JS in JSX' (`{}`) elements on the line they were opened or start them on a new line);

## Release Notes;

### 1.2.6;

- Added some valid characters and words to the filterInfo;
- Made NextLineStartBad able to skip over comments and empty lines;
- Fixed bug with most `()` closures being ignored;
- Fixed bug with detecting inline `{}` closures;

### 1.2.5;

- Made it work for multi-line decorators; <br>
- Updated object recognition to also detect a comma in front of the closure;

### 1.2.3;

- Added `&` to characters that the next line should not start with to add a semicolon; <br>
- Fixed a bug where `//` comments without string-delimiting characters would not be recognised as comments; <br>
- Added following feature:
  - Will not *remove* a semicolon if it's part of a comment / multi-line string;

### 1.2.0;

- Added following features:
  - Will not place a semicolon when:
    - `updated` the current line contains certain characters *(provided they are not part of a string)*;
    - the (end of the) current line is part of a multi-line string;

### 1.1.1;

- Fixed a bug where closures were improperly detected by removing the detecting of `<>` closures;

### 1.1.0;

- Added following features:
  - Will *not* place a semicolon when:
    - the current line is empty;
    - the current line ends with certain characters;
    - the current line ends with a certain character (but does place when that character appears 2 times: e.g. ++/--);
    - the current line starts with certain characters;
    - the current line contains certain characters;
    - the next line starts with certain characters;
    - the (end of the) current line is part of a comment;
    - the (end of the) current line is part of a `()`/`[]`/`<>` closure;
    - the current line is part of a `{}` closure that is an object;
    - the current line ends with a `}` of a closure that is not an object;

### 1.0.0;

- Initial release of `;;;;;;;;`;