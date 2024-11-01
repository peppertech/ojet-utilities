// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "attr-to-props.convertAttr",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // Get the word within the selection
        const word = document.getText(selection);
        let resultStr = "";
        let isAriaOrData = false;
        const temp = word.split("-");
        temp.map((item, idx) => {
          // if this is an aria or data attribute, leave it alone
          if (item == "aria" || item == "data" || isAriaOrData) {
            isAriaOrData = true;
            return;
          }
		//   always leave on and oj string as lowercase
          if (item === "on" || item == "oj") {
            resultStr += item;
            return;
          } 
		//  always leave the first word lowercase 
		  else if (idx == 0) {
            resultStr += item;
            return;
          }
		//   everything else, remove the - and uppercase the first letter of the word
          if (idx > 0) {
            resultStr +=
              String(item).charAt(0).toUpperCase() + String(item).slice(1);
          }
        });
        editor.edit((editBuilder) => {
          if (!isAriaOrData) editBuilder.replace(selection, resultStr);
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
