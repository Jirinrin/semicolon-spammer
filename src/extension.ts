'use strict';
import * as vsc from 'vscode';
import filterInfo from './filterInfo';


export function activate(context: vsc.ExtensionContext) {

  let toggleSemicolons = vsc.commands.registerCommand('extension.toggleSemicolons', () => {
    // Check if there is an open editor
    let editor = vsc.window.activeTextEditor;
    if (!editor || !editor.selection) {
      return;
    }

    // Make sure there is an array of selection lines
    let selectionLines: number[] = [];

    const selectionLineRange: number[] = [editor.selection.start.line, editor.selection.end.line];
    if (selectionLineRange[0] === selectionLineRange[1]) {
      selectionLines = [selectionLineRange[0]];
    }
    else {
      for (let i = selectionLineRange[0]; i <= selectionLineRange[1]; i++) {
        selectionLines.push(i);
      }
    }

    // If there is any thing 'add semicolon' action, it should not remove any semicolon
    const onlyAdd: boolean = selectionLines.some((lineNo: number) => shouldAdd(lineNo, editor));

    // Map the line numbers to a bunch of TextEdits for adding/removing semicolons
    let textEdits: vsc.TextEdit[] = selectionLines.map((lineNo: number) => {
      const currentLine: string = getLine(lineNo, editor.document);
      const endPosition: vsc.Position = new vsc.Position(lineNo, getEndPos(currentLine));
      
      switch (shouldAdd(lineNo, editor)) {
        case false:
          if (!onlyAdd) return removeSemicolon(endPosition);
          else return null;
        case true:
          return  addSemicolon(endPosition);
        default:
          return null;
      }
    });

    applyEdits(textEdits, editor.document);
  });

  context.subscriptions.push(toggleSemicolons);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function shouldAdd(lineNo: number, editor: vsc.TextEditor): boolean|null {
  const line: string = getLine(lineNo, editor.document);

  // Actions involving just the current line
  if (checkLastChar(line, ';')) {
    return shouldRemoveSemicolon(lineNo, editor.document) ? false : null;
  }
  if (line.trim().length === 0) return null;
  if (filterInfo.endLineBad.some(char => checkLastChar(line, char))) return null;
  if (filterInfo.endLineBadLonger.some(chars => checkLastXChars(line, chars))) return null;
  if (filterInfo.endLineBadButNotIfTwo.some(char => checkLastChar(line, char) && 
                                                    !checkLastXChars(line, char.repeat(2)) )) {
    return null;
  }
  if (filterInfo.startLineBad.some(char => checkFirstChar(line, char))) return null;
  if (filterInfo.startLineBadLonger.some(chars => checkFirstXChars(line, chars))) return null;
  
  // Action(s) involving the next line
  if (! (lineNo >= editor.document.lineCount-2)) {
    const nextLine = getLine(lineNo+1, editor.document);
    if (filterInfo.nextLineStartBad.some(char => checkFirstChar(nextLine, char))) return null;
  }

  // More complicated actions
  if (isInComment(lineNo, editor.document)) return null;
  if (isInSimpleMultilineClosure('`', new vsc.Position(lineNo, getEndPos(getLine(lineNo, editor.document))), editor.document)) return null;
  if (isInBadClosure(lineNo, editor.document)) return null;
  if (checkLastChar(line, '}')) {
    if (!isInBadClosure(lineNo, editor.document, true)) return null;
  }

  return true;
}

function shouldRemoveSemicolon(lineNo: number, doc: vsc.TextDocument): boolean {
  if (isInComment(lineNo, doc)) return false;

  if (isInSimpleMultilineClosure('`', new vsc.Position(lineNo, getEndPos(getLine(lineNo, doc))), doc)) {
    return false;
  }
  return true;
}

function isInString(lineNo: number, doc: vsc.TextDocument, chars: string): boolean|null {
  const currentLine = getLine(lineNo, doc);
  const positions: vsc.Position[]|null = getPosOfCharsInLine(chars, lineNo, currentLine);
  if (!positions) return null;

  for (let pos of positions) {
    if (isInSimpleClosure(`'`, pos.character, currentLine) === false) return false;
    if (isInSimpleClosure(`"`, pos.character, currentLine) === false) return false;
    if (isInSimpleMultilineClosure('`', pos, doc) === false) return false;
  }
  return (currentLine.includes(`'`) || currentLine.includes(`"`));
}

function isInSimpleClosure(delimitChar: string, charPos: number, lineText: string, inString:boolean=null): boolean|null {
  let isInString = inString;
  if (isInString === null) {
    if (!lineText.includes(delimitChar)) return null;
    isInString = false;
  }

  try {
    [...lineText].forEach((char, i) => {
      if (char === delimitChar) {
        isInString = !isInString;
      }
      if (i >= charPos) throw isInString;
    });
  }
  catch (bool) {
    return bool;
  }
  return isInString;
}

function isInSimpleMultilineClosure(delimitChar: string, pos: vsc.Position, doc: vsc.TextDocument): boolean|null {
  let countBeforeCheckLine = 0;
  for (let i = 0; i < pos.line; i++) {
    countBeforeCheckLine += (getLine(i, doc).split(delimitChar).length - 1);
  }
  let isInString = !(countBeforeCheckLine % 2 === 0);
  if (!countBeforeCheckLine) isInString = null;
  return isInSimpleClosure('`', pos.character, getLine(pos.line, doc), isInString);
}

function getPosOfCharsInLine(chars: string, lineNo: number, lineText: string): vsc.Position[]|null {
  const indices = [];
  let currentString = lineText;
  let searchStartIndex = 0;
  while (true) {
    const newIndex = currentString.indexOf(chars, searchStartIndex);
    if (newIndex < 0) break;
    else {
      indices.push(newIndex);
      /// nog kijken of dit idd werkt
      searchStartIndex = newIndex + 1;
    }
  }
  if (!indices[0] && indices[0] !== 0) return null;
  else return indices.map(char => new vsc.Position(lineNo, char));
}

function isInComment(lineNo: number, doc: vsc.TextDocument): boolean {
  if (isInSinglelineComment(lineNo, doc)) return true;
  if (isInMultilineComment(lineNo, doc)) return true;
  return false;
}

function isInSinglelineComment(lineNo: number, doc: vsc.TextDocument): boolean {
  if (filterInfo.inLineComment.some(chars => getLine(lineNo, doc).includes(chars))) {
    for (let chars of filterInfo.inLineComment) {
      if (isInString(lineNo, doc, chars) === false) return true;
    }
  }
  return false;
}

function isInMultilineComment(lineNo: number, doc: vsc.TextDocument): boolean {
  let openLine = null;
  
  for (let i = lineNo; i >= 0; i--) {
    if (lastOpeningWasNotClosed(getLine(i, doc), '/*', '*/')) {
      openLine = i;
      break;
    }
    else if (i <= 0) return false;
  }

  for (let i = openLine; i < doc.lineCount; i++) {
    if (i >= lineNo) return true;
    else if (getLine(i, doc).includes('*/')) return false;
  }
  
  return false;
}

function isInBadClosure(lineNo: number, doc: vsc.TextDocument, trimLast:boolean=false): boolean {
  const closureInfo = getCurrentClosure(lineNo, doc, trimLast);
  if (!closureInfo) return false;
  if (closureInfo.char === '{') {
    const bracePrefix = getLine(closureInfo.pos.line, doc).slice(0, closureInfo.pos.character).trim();
    // If it seems like this closure is an object...
    if ((bracePrefix[bracePrefix.length-1] === ':' || 
        bracePrefix[bracePrefix.length-1] === '=' ||
        bracePrefix === '' ||
        wordBeforeObject(bracePrefix)) &&
        bracePrefix[bracePrefix.length-1] !== ')' ) {
      return true;
    }
    else return false;
  }
  if (filterInfo.possibleOpeningChars.includes(closureInfo.char)) return true;
  else return false;
}

function wordBeforeObject(bracePrefix: string): boolean {
  for (let word of filterInfo.possibleWordsBeforeObject) {
    if (bracePrefix.slice(-1 * word.length) === word) return true;
  }
  return false;
}

interface CharInfo {
  char: string;
  pos: vsc.Position;
}

/// should possibly optimise so that this only has to be ran once for all lines in the selection...?
function getCurrentClosure(lineNo: number, doc: vsc.TextDocument, trimLast:boolean=false): CharInfo|null {
  let openClosures: string[] = [];

  try {
    for (let i = lineNo; i >= 0; i--) {
      [...getLine(i, doc)]
        .slice(0, (trimLast && i === lineNo) ? getEndPos(getLine(i, doc)) - 1 : getLine(i, doc).length)
        .reverse()
        .forEach((char, j) => {
          if (filterInfo.possibleClosingChars.includes(char)) {
            openClosures.unshift(char);
          }
          else if (filterInfo.possibleOpeningChars.includes(char)) {
            if (filterInfo.closurePairs[char] === openClosures[0]) {
              openClosures.shift();
            }
            else {
              throw {char, pos: new vsc.Position(i, getLine(i, doc).length - j - 1 )};
            }
          }
        });
    }
  }
  catch (charInfo) {
    return charInfo;
  }
  return null;
}

function lastOpeningWasNotClosed(line: string, opening: string, closing: string): boolean|null {
  const segments: string[] = line.split(opening);
  if (segments.length === 1) return null;
  return (segments[segments.length-1].split(closing).length - 1) - 1 < 0;
}

function getEndPos(lineText: string): number {
  return lineText.trimRight().length;
}

function getStartPos(lineText: string): number {
  return lineText.length - lineText.trimLeft().length;
}

function checkFirstChar(line: string, char: string): boolean {
  return line[getStartPos(line)] === char;
}

function checkFirstXChars(line: string, chars: string): boolean {
  const length = chars.length;
  return line.substring(getStartPos(line), getStartPos(line)+length) === chars;
}

function checkLastChar(line: string, char: string): boolean {
  return line[getEndPos(line)-1] === char;
}

function checkLastXChars(line: string, chars: string): boolean {
  const length = chars.length;
  return line.substring(getEndPos(line)-length, getEndPos(line)) === chars;
}

function addSemicolon(endPosition: vsc.Position): vsc.TextEdit {
  return new vsc.TextEdit(new vsc.Range(endPosition, endPosition), ';');
}

function removeSemicolon(endPosition: vsc.Position): vsc.TextEdit {
  const beginPosition: vsc.Position = endPosition.translate(0, -1);
  return new vsc.TextEdit(new vsc.Range(beginPosition, endPosition), '');
}

function applyEdits(textEdits: Array<vsc.TextEdit | null>, doc: vsc.TextDocument) {
  const realEdits = textEdits.filter(edit => !!edit);
  
  const newEdits = new vsc.WorkspaceEdit();
  newEdits.set(doc.uri, realEdits);
  vsc.workspace.applyEdit(newEdits);
}

function getLine(lineNo: number, doc: vsc.TextDocument): string {
  return doc.lineAt(lineNo).text;
}