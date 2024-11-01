# attr-to-props For Oracle JET VDOM (Preact)

When migrating from an MVVM project or component to VDOM and tsx, you need to convert the HTML attribute syntax to properties.  While this is a pretty simple task, it can become tedious if the attribute is rather long.

This extension will convert any attribute that you select in the editor to use the proper camel-case style of properties.

## How to use

Select any attribute that does not start with `aria` or `data` and then right-click the mouse.  Select `Convert attr to prop` from the context menu.

The menu option will only be available if you have some text selected

## Examples 
> on-oj-action becomes onojAction

> label-hint becomes labelHint

> on-oj-before-row-edit-end becomes onojBeforeRowEditEnd

## Features

* All aria-* and data-* attributes remain as they are.
* One attribute at a time is currently supported.  You cannot select an entire element and process it at this time.

## Requirements

Any Oracle JET VDOM (Preact) based application or VComponent.


## Known Issues

* You can only select one attribute at a time currently.

## Release Notes


### 0.0.1

Initial release of the attr-to-props extension.


