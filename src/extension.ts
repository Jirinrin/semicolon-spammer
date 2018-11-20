'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "semicolon-spammer" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let toggleSemicolons = vscode.commands.registerCommand('extension.toggleSemicolons', () => {
    // The code you place here will be executed every time your command is executed

    // Check if there is an open editor
    let editor = vscode.window.activeTextEditor;
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
                              .some(text => !isRemoveOrder(text));

    // Map the line numbers to a bunch of TextEdits for adding/removing semicolons
    let textEdits: vscode.TextEdit[] = selectionLines.map((lineNo: number) => {
      const currentLine: string = editor.document.lineAt(lineNo).text;
      const endPosition: vscode.Position = new vscode.Position(lineNo, currentLine.length);
      
      if (currentLine.length === 0) {
        return addSemicolon(endPosition);
      }
      else {
        if (isRemoveOrder(currentLine)) {
          if (!onlyAdd) {
            return removeSemicolon(endPosition);
          }
        }
        else {
          return addSemicolon(endPosition);
        }
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


function isRemoveOrder(lineText: string): boolean {
  return lineText.charAt(lineText.length-1) === ';';
}

function addSemicolon(endPosition: vscode.Position): vscode.TextEdit {
  return new vscode.TextEdit(new vscode.Range(endPosition, endPosition), ';');
}

function removeSemicolon(endPosition: vscode.Position): vscode.TextEdit {
  const beginPosition: vscode.Position = endPosition.translate(0, -1);
  return new vscode.TextEdit(new vscode.Range(beginPosition, endPosition), '');
}

function applyEdits(textEdits: Array<vscode.TextEdit | null>, editor: vscode.TextEditor) {
  const realEdits = textEdits.filter(edit => !!edit);
  
  const newEdits = new vscode.WorkspaceEdit();
  newEdits.set(editor.document.uri, realEdits);
  vscode.workspace.applyEdit(newEdits);
}