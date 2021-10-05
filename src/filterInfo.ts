export default {
  // It is currently assumed that these all have to be one character long
  "twoSidedOperators": [
    /// these are all like 2 sided things they must have a thing before and after (doesn't have to have a space) => so possible that a plus ends up on a line and you have to backtrack to the line before it doesn't get semicolonised
    "<",  
    ">",
    /// and how do you then check the 2-sidedness of double characters like ">=" => hmm or I guess it doesn't matter that much: in the end it will check both sides from both anyway (???)
    "|",
    "=",
    "+", /// oh but these two will go wrong because 'not if two'
    "-",
    "/",
    "%",
    "&",
    "*",
  ],
  "endLineBad": [
    ...this.twoSidedOperators,
    "{",
    "(",
    "[",
    "#", /// what does this do then...
    "@",
    ":",
    "?",
    ",",
    "*/",
    "/*",
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
    ...this.twoSidedOperators,
    ".",
    ":",
    "?",

    "[",
    "(",
    "{"
  ],
  "inLineComment": [
    "//"
  ],
  "closurePairs": {
    "[": "]",
    "(": ")",
    "{": "}"
  },
  "newClosurePairs": {
    "]": "[",
    ")": "(",
    "}": "{"
  },
  "possibleOpeningChars": "[({",
  "possibleClosingChars": "])}",
  "possibleStringChars": ['"', "'", '`'],
  /// for this look which words also apply when they were at the previous line (slash skipped with comments and stuff)
  /// or wait it should be okay because if nothing is before it then it sees it as object...?
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
  ],
  "keywords": {
    "simple": [ // something should 'come behind it'
      "return", "export", "default", "delete", "case", "import",
      "const", "let", "var", "new", "typeof", "instanceof", "of", "in", "enum", "extends", "implements", "static", "public", "private", "protected", "class", "interface", "as"
    ],
    "curly": [ // should ...
      "try", "else", "do", "finally"
    ],
    "parentheses": [
      "if", "for", "while" // and could have curly but you only have to check that there's "something" after the ()
    ],
    "parenthesesAndCurly": [
      "catch", "function", "switch" // also make thing with arrow syntax; wait should function even have curly?
    ],
    "ternary": [":", "?"] // so is question mark => something => ":" => something => and on
    /// can't this happen through twosided operators? neh
  }
};