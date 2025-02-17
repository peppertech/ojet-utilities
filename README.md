# Utilities for Oracle JET VDOM (Preact) projects

When migrating from an MVVM project or component to VDOM and tsx, you need to convert the HTML attribute syntax to properties.  While this is a pretty simple task, it can become tedious if the attribute is rather long.

This extension will provide various utilities to help with the migration from MVVM based code syntax or samples to TSX/Preact syntax.


## Features

* Convert attribute to property
  * All aria-* and data-* attributes remain as they are.
  * One attribute at a time is currently supported.  You cannot select multiple lines and process them at once.

* Convert a full custom element at a time
  * Select any JET custom element that does not have an inline template.


## How to use

### Convert Attribute
Select any attribute that does not start with `aria` or `data` and then right-click the mouse.  Select `Convert attribute to property` from the context menu.

The menu option will only be available if you have some text selected

### Convert Element
Select the full custom element from opening tag to closing tag. Right-click the mouse and select `Convert element` from the context menu.
> **Note**: Custom elements that have inline \<template> elements are not supported.

## Examples 
Attribute conversion
> `on-oj-action` becomes `onojAction` </br>
  `label-hint` becomes `labelHint` </br>
  `on-oj-before-row-edit-end` becomes `onojBeforeRowEditEnd`

Custom element conversion from this
```javascript
    <oj-input-text
        label-edge="inside"
        label-hint="[[getLabel]]"
        on-value-changed="[[changeHandler]]"
    ></oj-input-text>
```

to this
```javascript
    <oj-input-text
        labelEdge="inside"
        labelHint={getLabel}
        onvalueChanged={changeHandler}
    ></oj-input-text>
```

## Requirements

Any Oracle JET VDOM (Preact) based application or VComponent.


## Known Issues

* You can only select one attribute at a time.
* To process both the attribute name and value, use *Convert Element* feature.
* When converting an element, it cannot use inline \<template> elements.
* Attributes using dot-notation with multiple entires, will not be combined into the same object as they should be.
* If a property with an object for it's value, contains a key that starts with *data* it will not be processed property.
