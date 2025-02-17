// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const processAttribute = (attr: string, inObject: boolean) => {
  let isAriaOrData = false;
  let isAction = false;
  let resultStr = "";
  const temp = attr.split("-");
  temp.map((item, idx) => {
    if (
      (item.includes("aria") || item.includes("data") || isAriaOrData) &&
      !inObject
    ) {
      isAriaOrData = true;
      return;
    }
    //   always leave on and oj string as lowercase
    if (item.startsWith("on") && idx == 0) {
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

    //   everything else, remove the - and uppercase the first letter of the next word
    if (idx > 0) {
      resultStr += String(item).charAt(0).toUpperCase() + String(item).slice(1);
    }
  });
  return isAriaOrData ? attr : resultStr;
};

const processBinding = (str: string, inObject: boolean, isClosed:boolean) => {
  let tempStr = "";
  if (str.includes('"[[')) {
    if (inObject) {
      tempStr = str.replace('"[[', "").replace(']]"', "");
      isClosed=true
    } else {
      tempStr = str.replace('"[[', "{").replace(']]"', "}");
    }
    return tempStr;
  } else if (str.includes('"{{')) {
    if (inObject) {
      tempStr = str.replace('"{{', "").replace('}}"', "");
    } else {
      tempStr = str.replace('"{{', "{").replace('}}"', "}");
    }
    return tempStr;
  } else if (str.includes("'{")) {
    if (inObject) {
      tempStr = str.replace("'{", "").replace("}'", "");
    } else {
      tempStr = str.replace("'{", "{{").replace("}'", "}}");
    }
    return tempStr;
  } else if (str.includes("'[")) {
    if (inObject) {
      tempStr = str.replace("'[", "[").replace("]'", "]");
    } else {
      tempStr = str.replace("'[", "{[").replace("]'", "]}");
    }
    return tempStr;
  } else if (str.includes("]'")) {
    if (inObject) {
      tempStr = str.replace("]'", "]");
    } else {
      tempStr = str.replace("]'", "]}");
    }
    return tempStr;
  } else {
    return str;
  }
};

const dotToNested = (obj, path, value:any) => {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (path.length > 1) {
    const key = path.shift();
    obj[key] = obj[key] || {};
    dotToNested(obj[key], path, value);
  } else {
    obj[path[0]] = value;
  }

  return obj;
};

const processDotNotation = (str) => {
  let tempStr = "";
  let matchCount = -1;
  const temp = str.split(".");
  if (temp.length == 2) {
    if (temp[1].includes("=")) {
      let attrSplit = temp[1].split("=");
      temp[1] =
        "{" +
        processAttribute(attrSplit[0].trimStart(), true) +
        ":" +
        processBinding(attrSplit[1], true,true) +
        "}";
    }
    return temp[0].trimStart() + "= {" + temp[1] + "}";
  } else {
    let testArr = temp.slice(1);
    let attrSplit = testArr[testArr.length - 1].split("=");
    testArr[testArr.length - 1] =
      processAttribute(attrSplit[0].trimStart(), true) +
      "=" +
      processBinding(attrSplit[1], true, true);
    let value = temp[temp.length - 1].split("=")[1].slice(1).slice(0, -1);
    console.log("dotToNested: ", dotToNested({}, testArr.join("."), value));

    temp.map((item, idx) => {
      if (item.includes("=")) {
        let attrSplit = item.split("=");
        item =
          processAttribute(attrSplit[0].trimStart(), true) +
          ":" +
          processBinding(attrSplit[1], true,true);
      }
      if (idx == 0) {
        tempStr += item + "=";
        matchCount++;
      } else {
        tempStr += "{ " + item + ":";
        matchCount++;
      }
    });

    tempStr = tempStr.slice(0, -1);
    while (matchCount > 0) {
      tempStr += "}";
      matchCount--;
    }
    console.log("Mybuilding: ", tempStr);
    return tempStr.trimStart();
  }
};

const handleDropRows = () => {};


// look for duplicate dot notation attributes using the same object.
// We want to convert these to use one property object.
const findDuplicates = async (arr) => {
  let tempArray = [];
  let tempObj = {};
  await arr.map((line: string) => {
    if (line.includes(".")) {
      tempArray.push(line.trimStart());
      // This is what the final dnd object should look like
      // const dnd = {
      //   drop: {
      //     rows: {
      //       dataTypes: ["application/ojtablerows+json"],
      //       drop: handleDropRows,
      //     },
      //   },
      // };
    }
  });
  tempArray.sort();
  tempArray.map(async (line: string, idx: number) => {
    if (line.split(".")[0] == tempArray[idx + 1]?.split(".")[0]) {
      console.log(`line1: ${line} | line2: ${tempArray[idx + 1]}`);
      const temp = await dotToNested(
        {},
        processAttribute(line.split("=")[0].trimStart(), true),
        processBinding(line.split("=")[1], true, true).slice(1).slice(0, -1)
      );
      //temp = JSON.parse(temp);
      const test = await dotToNested(
        temp,
        processAttribute(tempArray[idx + 1].split("=")[0].trimStart(), true),
        processBinding(tempArray[idx + 1].split("=")[1], true,true)
      );
      console.log("Merged: ", test[line.split(".")[0]]);
      tempObj = test;
    }
  });
  return tempObj;
};

const processElement = (elem) => {
  let tempArray = [];
  const dupNames = findDuplicates(elem);
  elem.map((item, idx) => {
    // if the item has a dot, process it as a dot notation
    if (item.includes(".")) {
      // TODO figure out how to turn duplicates into a single line to be returned
      tempArray.push(processDotNotation(item));
      return;
    }
    if (idx == 0 && item.startsWith("<")) {
      tempArray.push(item);
      return;
    }
    if (item.length <= 1) {
      tempArray.push(item);
      return;
    }
    if (item.includes("=")) {  // Need to handle the case where there isn't an = but we still have to close a binding.
      let attrSplit = item.split("=");
      tempArray.push(
        processAttribute(attrSplit[0].trimStart(), false) +
          "=" +
          processBinding(attrSplit[1], false,true)
      );
      return
    } else {
      tempArray.push(item);
    }
    // if(dupNames){
    //   tempArray.push(JSON.stringify(dupNames));
    //   //return;
    // }
  });
  return tempArray.join("\r\n");
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

        editor.edit(async (editBuilder) => {
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
        const resultStr = processAttribute(word, false);

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
