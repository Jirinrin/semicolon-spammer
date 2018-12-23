'use strict';
import * as vsc from 'vscode';
import * as f from './functions';

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
    const onlyAdd: boolean = selectionLines.some((lineNo: number) => f.shouldAdd(lineNo, editor));

    // Map the line numbers to a bunch of TextEdits for adding/removing semicolons
    let textEdits: vsc.TextEdit[] = selectionLines.map((lineNo: number) => {
      const currentLine: string = f.getLine(lineNo, editor.document);
      const endPosition: vsc.Position = new vsc.Position(lineNo, f.getEndPos(currentLine));
      
      switch (f.shouldAdd(lineNo, editor)) {
        case false:
          if (!onlyAdd) return f.removeSemicolon(endPosition);
          else return null;
        case true:
          return f.addSemicolon(endPosition);
        default:
          return null;
      }
    });

    f.applyEdits(textEdits, editor.document);
  });

  context.subscriptions.push(toggleSemicolons);
}

// this method is called when your extension is deactivated
export function deactivate() {
}