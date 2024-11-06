// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const processAttribute = (attr) => {
  let isAriaOrData = false;
  let isAction = false;
  let resultStr = "";
  const temp = attr.split("-");
  temp.map((item, idx) => {
    if (item == "aria" || item == "data" || isAriaOrData) {
      isAriaOrData = true;
      return;
    }
    //   always leave on and oj string as lowercase
    if (item === "on" && idx==0) {
      resultStr += item;
      isAction = true;
      return;
    }
    //  always leave the first word lowercase
    else if (idx == 0 || isAction) {
      resultStr += item;
      isAction=false
      return;
    }
    //   everything else, remove the - and uppercase the first letter of the word
    if (idx > 0) {
      resultStr += String(item).charAt(0).toUpperCase() + String(item).slice(1);
    }
  });
  return isAriaOrData ? attr : resultStr;
};

const processElement = (elem) => {
  let tempArray = [];
  elem.map((item, idx) => {
    if (idx == 0) {
      tempArray.push(item);
      return;
    }
    if (item.length <= 1) {
      tempArray.push(item);
      return;
    }
    if (item.includes("=")) {
      console.log("We have an attribute: ", item);
      let attrSplit = item.split("=");
      console.log("parts: ", attrSplit);
      const partOne = processAttribute(attrSplit[0]);
      const partTwo = processBinding(attrSplit[1]);
      tempArray.push(partOne + "=" + partTwo);
    } else {
      tempArray.push(item);
    }
  });
  console.log("Result: ", tempArray.join(" "));
  return tempArray.join(" ");
};

const processBinding = (str) => {
  let tempStr1 = "";
  let tempStr2 = "";
  if (str.includes('"[[')) {
    tempStr1 = str.replace('"[[', "{");
    tempStr2 = tempStr1.replace(']]"', "}");
    console.log("binding: ", tempStr2);
    return tempStr2;
  } else if (str.includes('"{{')) {
    tempStr1 = str.replace('"{{', "{");
    tempStr2 = tempStr1.replace('}}"', "}");
    console.log("binding: ", tempStr2);
    return tempStr2;
  } else {
    console.log("binding: ", str);
    return str;
  }
};
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const convert_element = vscode.commands.registerCommand(
    "ojet-utilities.convertElement",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const startStr = document.getText(selection);
        console.log("Selection: ", startStr);
        let splitArray = startStr.split(" ");
        console.log("Str Array: ", splitArray);

        const startLine = selection.start.line;
        const endLine = selection.end.line;
        const totalLines = endLine - startLine;
        console.log(
          `start: ${startLine} | end: ${endLine} | total: ${totalLines}`
        );
        const updatedArray = processElement(splitArray);

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, updatedArray);
        });
      }
    }
  );
  const convert_attr = vscode.commands.registerCommand(
    "ojet-utilities.convertAttr",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // Get the word within the selection
        const word = document.getText(selection);

        // process the attribute into a property
        const resultStr = processAttribute(word);

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, resultStr);
        });
      }
    }
  );

  context.subscriptions.push(convert_attr);
  context.subscriptions.push(convert_element);
}

// This method is called when your extension is deactivated
export function deactivate() {}
