'use strict';
import * as vsc from 'vscode';

export function activate(context: vsc.ExtensionContext) {

  let toggleSemicolons = vsc.commands.registerCommand('extension.toggleSemicolons', () => {
    // The code you place here will be executed every time your command is executed

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
    const onlyAdd: boolean = selectionLines
                              .map((lineNo: number) => editor.document.lineAt(lineNo).text)
                              .some(text => shouldAdd(text) && !checkLastChar(text, ';'));

    // Map the line numbers to a bunch of TextEdits for adding/removing semicolons
    let textEdits: vsc.TextEdit[] = selectionLines.map((lineNo: number) => {
      const currentLine: string = editor.document.lineAt(lineNo).text;
      const endPosition: vsc.Position = new vsc.Position(lineNo, currentLine.length);
      
      if (checkLastChar(currentLine, ';')) {
        if (!onlyAdd) return removeSemicolon(endPosition);
      }
      else if (shouldAdd(currentLine)) {
        return addSemicolon(endPosition);
      }
      else return null;
    });

    applyEdits(textEdits, editor);
  });

  context.subscriptions.push(toggleSemicolons);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function shouldAdd(line: string): boolean {
  if (line.length === 0) return false;
  return true;
}

function checkLastChar(lineText: string, char: string): boolean {
  return lineText[lineText.length-1] === char;
}

function checkLast2Chars(lineText: string, chars: string): boolean {
  return lineText[lineText.length-2] + lineText[lineText.length-1] === chars;
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
  console.log(realEdits);
  
  const newEdits = new vsc.WorkspaceEdit();
  newEdits.set(editor.document.uri, realEdits);
  vsc.workspace.applyEdit(newEdits);
}