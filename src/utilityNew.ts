import * as vsc from 'vscode';
import { getLine } from './functions';
import f from './filterInfo';

type ClosureChar  = '[' | '(' | '{';
type StringChar   = `'` | `"` | '`';

type SpecialStuff = null | string;

class TextScanner {
  inString: StringChar|null  = null;
  inComment: boolean         = false;
  closures: ClosureChar[]    = [];
  specialStuff: SpecialStuff = null;

  shouldPutSemicolon() {
    return (
      !this.inString &&
      !this.inComment &&
      this.closures[0] !== '[' &&
      this.closures[0] !== '('
      // should be extended or sth
    );
  }
}

interface SemicolonMapping {
  [line: number]: boolean;
}

export function scanLines(endLine: number, linesToCheck: number[], editor: vsc.TextEditor): SemicolonMapping {
  const t = new TextScanner();
  let mapping: SemicolonMapping = {};

  let lastNonEmptyLine: number = null;


  console.log('endline', endLine, linesToCheck);

  for (let i = 0; i <= endLine; i++) {
    let currentLine: string = getLine(i, editor.document);
    
    if (currentLine.trim().length !== 0)
      lastNonEmptyLine = i;

    if (t.inString !== '`')
      t.inString = null;

    if (f.nextLineStartBad.includes(currentLine.trim()[0]))
      mapping[lastNonEmptyLine] = false;

    try {
      currentLine.split('').forEach((char: string, j: number) => {
        
        if (t.inComment && j > 0 && currentLine.slice(j - 1, j + 1) === '*/')
        t.inComment = false;
        
        if (t.inString && char === t.inString)
        t.inString = null;
        
        if (t.inComment || t.inString)
          return;
        
        if (j > 0 && currentLine.slice(j - 1, j + 1) === '//')
          throw j;
  
        if (f.possibleStringChars.includes(char))
          t.inString = char as StringChar;
        else if (f.possibleOpeningChars.includes(char))
          t.closures.unshift(char as ClosureChar);
        else if (f.possibleClosingChars.includes(char) && f.newClosurePairs[char] === t.closures[0])
          t.closures.shift();
        else if (currentLine.slice(j - 1, j + 1) === '/*')
          t.inComment = true;
  
      });
    }
    catch (e) {}
    
    if (linesToCheck.includes(i))
      if (f.endLineBad.findIndex(str => currentLine.trim().endsWith(str)) >= 0)
        mapping[i] = false;
      else
        mapping[i] = t.shouldPutSemicolon();
  }

  console.log(mapping);

  return mapping;
}

/*

Things to account for:
- in comment
- in certain closures etc
- within if statement etc., handle bunch of edge cases

Procedure:
- move through each character in each line
- per line

Unclear:
- in ifstatement / other things how to do exactly
  - if
  - decorator
  - try
  - for certain closures slash e.g. between a return/export/default-word and what follows you can have multiple lines etc.
- also other things like calculation moves on on next line etc.

*/