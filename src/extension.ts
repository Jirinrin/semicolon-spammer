'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "semicolon-spammer" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    // The code you place here will be executed every time your command is executed

    let editor = vscode.window.activeTextEditor;
    if (!editor || !editor.selection) {
      return; // No open text editor or no selection active (is that even possible?)
    }

    let selectionLines: number[] = [];

    // zorg dat selectionlines lines bevat
    const selectionLineRange: number[] = [editor.selection.start.line, editor.selection.end.line];
    
    if (selectionLineRange[0] === selectionLineRange[1]) {
      selectionLines = [selectionLineRange[0]];
    }
    else {
      for (let i = selectionLineRange[0]; i <= selectionLineRange[1]; i++) {
        selectionLines.push(i);
      }
    }

    // en dan nu doe alle logica per iedere line
    // wil uiteindelijk toch refactoren zodat het add en remove met aparte commands doet
    selectionLines.forEach((lineNo: number) => {
      const currentLine: string = editor.document.lineAt(lineNo).text;
      const currentLineLength: number = currentLine.length;
      const endPosition: vscode.Position = new vscode.Position(lineNo, currentLineLength);
      
      if (currentLineLength === 0) {
        addSemicolon(endPosition, editor);
      }
      else {
        if (currentLine.charAt(currentLineLength-1) === ';') {
          removeSemicolon(endPosition, editor);
        }
        else {
          addSemicolon(endPosition, editor);
        }
      }
    });

    // Display a message box to the user
    // vscode.window.showInformationMessage('Selected characters: ' + text.length);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}


function addSemicolon(endPosition: vscode.Position, editor: vscode.TextEditor) {
  // console.log('adding');
  // console.log(endPosition);
  applyEdit(new vscode.Range(endPosition, endPosition), ';', editor);
  // return;
}

function removeSemicolon(endPosition: vscode.Position, editor: vscode.TextEditor) {
  const beginPosition: vscode.Position = endPosition.translate(0, -1);
  applyEdit(new vscode.Range(beginPosition, endPosition), '', editor);
  // return;
}

function applyEdit(range: vscode.Range, newText: string, editor: vscode.TextEditor) {
  const textEdit = new vscode.TextEdit(range, newText);
  /// kan beter nml kan beter steeds spul toevoegen aan array totdat eindhandeling klaar is en dan in 1x alles applyen
  const newEdit = new vscode.WorkspaceEdit();
  newEdit.set(editor.document.uri, [textEdit]);
  vscode.workspace.applyEdit(newEdit);
}