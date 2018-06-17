# TreeJS

TreeJS is a simple JavaScript librarie, to display a TreeView like in the windows filebrowser.
It implements partially the Java Swing TreeModel etc.

## Installation
1. Download the .zip-File and put it in your project-folder.
2. Add this script-tag to the head of the file
```html
<script src="path/to/js/file.js"></script>
```
3. Add this link-tag to the head of the file, to include the styles
```html
<link rel="stylesheet" href="path/to/css/file.css" />
```
4. Start using the librarie!

## Usage
### Create new TreeView
```javascript
var root = new TreeNode("root"); // Create the root-node
var tree = new TreeView(root);   // Create the tree
```

### Set a container to display the tree
```javascript
tree.setContainer("#container"); // Uses document.querySelector, but you can also just put in a DOM-Element
```
or
```javascript
tree.setContainer(document.getElementById("container"));
```

### Load the tree
```javascript
tree.reload(); // Always use this, when you change the TreeView or any of its nodes
```
