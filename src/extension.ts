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
      const currentLine: string = editor.document.lineAt(lineNo).text;
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
  const line: string = editor.document.lineAt(lineNo).text;

  // Actions involving just the current line
  if (checkLastChar(line, ';')) return false;
  if (line.trim().length === 0) return null;
  if (filterInfo.endLineBad.some(char => checkLastChar(line, char))) return null;
  if (filterInfo.endLineBadLonger.some(chars => checkLastXChars(line, chars))) return null;
  if (filterInfo.endLineBadButNotIfTwo.some(char => checkLastChar(line, char) && 
                                                    !checkLastXChars(line, char.repeat(2)) )) {
    return null;
  }
  if (filterInfo.startLineBad.some(char => checkFirstChar(line, char))) return null;
  if (filterInfo.startLineBadLonger.some(chars => checkFirstXChars(line, chars))) return null;
  if (filterInfo.inLineBad.some(chars => line.includes(chars))) return null;
  
  // Action(s) involving the next line
  if (! (lineNo >= editor.document.lineCount-2)) {
    const nextLine = editor.document.lineAt(lineNo+1).text;
    if (filterInfo.nextLineStartBad.some(char => checkFirstChar(nextLine, char))) return null;
  }

  // More complicated actions
  if (isInComment(lineNo, editor.document)) return null;
  if (filterInfo.possibleOpeningChars.includes(getCurrentClosure(lineNo, editor.document))) return null;

  return true;
}

// function closingOpeningDiff(line: string, opening: string, closing: string) {
//   return line.split(opening).length-1 - (line.split(closing).length-1);
// }

/// wil eigenlijk overal dit editor refactoren naar document: vsc.TextDocument
function isInComment(lineNo: number, doc: vsc.TextDocument): boolean {
  let openLine = null;
  
  for (let i = lineNo; i >= 0; i--) {
    if (lastOpeningWasNotClosed(doc.lineAt(i).text, '/*', '*/')) {
      openLine = i;
      break;
    }
    else if (i <= 0) return false;
  }

  for (let i = openLine; i < doc.lineCount; i++) {
    if (i >= lineNo) return true;
    else if (doc.lineAt(i).text.includes('*/')) return false;
  }
  
  return false;
}

// should probably optimise so that this only has to be ran once for all lines in the selection...?
function getCurrentClosure(lineNo: number, doc: vsc.TextDocument): string|null {
  let openClosures: string[] = [];

  try {
    for (let i = lineNo; i >= 0; i--) {
      [...doc.lineAt(i).text]
        .reverse()
        .forEach(char => {
          if (filterInfo.possibleClosingChars.includes(char)) {
            openClosures.unshift(char);
          }
          else if (filterInfo.possibleOpeningChars.includes(char)) {
            if (filterInfo.closurePairs[char] === openClosures[0]) openClosures.shift();
            else throw char;
          }
        });
    }
  }
  catch (char) {
    console.log(char);
    return char;
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