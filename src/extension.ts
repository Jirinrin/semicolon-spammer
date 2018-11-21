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

    applyEdits(textEdits, editor);
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
  if (filterInfo.endLineBadButNotIfTwo.some(char => checkLastChar(line, char) && 
                                                    !checkLast2Chars(line, char.repeat(2)) )) {
    return null;
  }
  if (filterInfo.startLineBad.some(char => checkFirstChar(line, char))) return null;
  if (filterInfo.nextLineStartBadLonger.some(chars => checkFirstXChars(line, chars))) return null;
  
  // Action(s) involving the next line
  if (! (lineNo >= editor.document.lineCount-1)) {
    const nextLine = editor.document.lineAt(lineNo+1).text;
    if (filterInfo.nextLineStartBad.some(char => checkFirstChar(nextLine, char))) return null;
  }

  // More complicated actions

  return true;
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

function checkLast2Chars(line: string, chars: string): boolean {
  return line.substring(getEndPos(line)-2, getEndPos(line)) === chars;
}

function addSemicolon(endPosition: vsc.Position): vsc.TextEdit {
  return new vsc.TextEdit(new vsc.Range(endPosition, endPosition), ';');
}

function removeSemicolon(endPosition: vsc.Position): vsc.TextEdit {
  const beginPosition: vsc.Position = endPosition.translate(0, -1);
  return new vsc.TextEdit(new vsc.Range(beginPosition, endPosition), '');
}

function applyEdits(textEdits: Array<vsc.TextEdit | null>, editor: vsc.TextEditor) {
  const realEdits = textEdits.filter(edit => !!edit);
  
  const newEdits = new vsc.WorkspaceEdit();
  newEdits.set(editor.document.uri, realEdits);
  vsc.workspace.applyEdit(newEdits);
}