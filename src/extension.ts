// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const processAttribute = (attr) => {
  let isAriaOrData = false;
  let isAction = false;
  let resultStr = "";
  const temp = attr.split("-");
  temp.map((item, idx) => {
    if (item.includes("aria") || item.includes("data") || isAriaOrData) {
      isAriaOrData = true;
      return;
    }
    //   always leave on and oj string as lowercase
    if (item === "on" && idx == 0) {
      resultStr += item;
      isAction = true;
      return;
    }
    //  always leave the first word lowercase
    else if (idx == 0 || isAction) {
      resultStr += item;
      isAction = false;
      return;
    }

    // need to handle attributes with dot notation and nested objects like dnd in table.
    // This:  dnd.drag.rows.data-types='["application/ojtablerows+json"]'
    // should become this
    // dnd = {
    //   drag: {
    //     rows: {
    //       dataTypes: '["application/ojtablerows+json"]'
    //     }
    //   },
    // };

    //   everything else, remove the - and uppercase the first letter of the next word
    if (idx > 0) {
      resultStr += String(item).charAt(0).toUpperCase() + String(item).slice(1);
    }
  });
  return isAriaOrData ? attr : resultStr;
};

const processDotNotation = (str) => {
  let tempStr = "";
  let matchCount = -1;
  const temp = str.split(".");
  temp.map((item, idx) => {
    if (item.includes("=")) {
      let attrSplit = item.split("=");
      item = "{" +
        processAttribute(attrSplit[0]) +
        ":" +
        processBinding(attrSplit[1]) + "}";
    }
    if (idx == 0) {
      tempStr += item+"=";
      matchCount++;
    } else {
      tempStr += "{ " + item+":";
      matchCount++;
    }
  });
  tempStr = tempStr.slice(0,-1);
  while (matchCount > 0) {
    tempStr += "}";
    matchCount--;
  }
  //  console.log(tempStr);
  return tempStr;
};

const processElement = (elem) => {
  let tempArray = [];
  elem.map((item, idx) => {
    if (item.includes(".")) {
      tempArray.push(processDotNotation(item));
      return;
    }
    if (idx == 0) {
      tempArray.push(item);
      return;
    }
    if (item.length <= 1) {
      tempArray.push(item);
      return;
    }
    if (item.includes("=")) {
      let attrSplit = item.split("=");
      tempArray.push(
        processAttribute(attrSplit[0]) + "=" + processBinding(attrSplit[1])
      );
    } else {
      tempArray.push(item);
    }
  });
  return tempArray.join("\r\n");
};

const processBinding = (str) => {
  let tempStr = "";
  if (str.includes('"[[')) {
    tempStr = str.replace('"[[', "{").replace(']]"', "}");
    return tempStr;
  } else if (str.includes('"{{')) {
    tempStr = str.replace('"{{', "{").replace('}}"', "}");
    return tempStr;
  } else if (str.includes("'{")) {
    tempStr = str.replace("'{", "{{").replace("}'", "}}");
    return tempStr;
  } else {
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
        let splitArray = startStr.split("\r\n");
        const updatedArray = processElement(splitArray);
        //        processDotNotation("dnd.drag.rows.data-types='[\"application/ojtablerows+json\"]'");

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
