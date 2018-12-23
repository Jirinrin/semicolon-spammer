export default {
  "endLineBad": [
    "{",
    "(",
    "[",
    "<",
    "|",
    "=",
    "+",
    "/",
    ":",
    "@",
    "#",
    "%",
    "&",
    ",",
    "*",
    "*/",
    "/*",
    "?",
    "=>"
  ],
  "endLineBadButNotIfTwo": [
    "+",
    "-"
  ],
  "startLineBad": [
    "@"
  ],
  "nextLineStartBad": [
    ".",
    "|",
    "&",
    "/",
    "*",
    "=",
    "+ ",
    "- ",
    "%",
    ":",
    "?"
  ],
  "inLineComment": [
    "//"
  ],
  "closurePairs": {
    "[": "]",
    "(": ")",
    "{": "}"
  },
  "possibleOpeningChars": "[({",
  "possibleClosingChars": "])}",
  /// bij dit kijken welke woorden ook gelden als ze op de vorige regel (slash geskipt met comments enzo) stonden
  /// of wacht het is natuurlijk al goed zeker want als niks ervoor dan ziet hij het ook als object...?
  "possibleWordsBeforeObject": [
    "const",
    "let",
    "var",
    "throw",
    "default",
    "export",
    ";",
    "return",
    "typeof",
    "instanceof",
    "extends",
    "case",
    "implements",
    "private",
    "public",
    "protected",
    "static",
    "import",
    "(",
    "[",
    "<",
    "{",
    ",",
    "as"
  ]
};