/**
 * TreeJS is a JavaScript library for displaying TreeViews
 * on the web.
 *
 * @author Matthias Thalmann
 * @copyright Matthias Thalmann
 */

/*
 * Util-Methods
 */
const TreeUtil = {
  default_leaf_icon: '<span>&#128441;</span>',
  default_parent_icon: '<span>&#128449;</span>',
  default_open_icon: '<span>&#9698;</span>',
  default_close_icon: '<span>&#9654;</span>',

  isDOM(obj) {
    try {
      return obj instanceof HTMLElement;
    } catch {
      return (
        typeof obj === 'object' &&
        obj.nodeType === 1 &&
        typeof obj.style === 'object' &&
        typeof obj.ownerDocument === 'object'
      );
    }
  },

  getProperty(options, opt, def) {
    if (typeof options[opt] === 'undefined') {
      return def;
    }

    return options[opt];
  },

  expandNode(node) {
    node.setExpanded(true);

    if (!node.isLeaf()) {
      node.getChildren().forEach((child) => {
        TreeUtil.expandNode(child);
      });
    }
  },

  collapseNode(node) {
    node.setExpanded(false);

    if (!node.isLeaf()) {
      node.getChildren().forEach((child) => {
        TreeUtil.collapseNode(child);
      });
    }
  },
};

const TreeConfig = {
  leaf_icon: TreeUtil.default_leaf_icon,
  parent_icon: TreeUtil.default_parent_icon,
  open_icon: TreeUtil.default_open_icon,
  close_icon: TreeUtil.default_close_icon,
  context_menu: undefined,
};

function TreeNode(nodeUserObject, nodeOptions) {
  const children = new Array();
  const events = new Array();

  let userObject = nodeUserObject;
  let options = nodeOptions;

  let expanded = true;
  let enabled = true;
  let selected = false;

  /*
   * Konstruktor
   */
  if (userObject) {
    if (typeof userObject !== 'string' && typeof userObject.toString !== 'function') {
      throw new Error('Parameter 1 must be of type String or Object, where it must have the function toString()');
    }
  } else {
    userObject = '';
  }

  if (!options || typeof options !== 'object') {
    options = {};
  } else {
    expanded = TreeUtil.getProperty(options, 'expanded', true);
    enabled = TreeUtil.getProperty(options, 'enabled', true);
    selected = TreeUtil.getProperty(options, 'selected', false);
  }

  /*
   * Methods
   */
  this.addChild = function (node) {
    if (!TreeUtil.getProperty(options, 'allowsChildren', true)) {
      console.warn('Option allowsChildren is set to false, no child added');
      return;
    }

    if (node instanceof TreeNode) {
      children.push(node);

      //Konstante hinzufügen (workaround)
      Object.defineProperty(node, 'parent', {
        value: this,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    } else {
      throw new Error('Parameter 1 must be of type TreeNode');
    }
  };

  this.removeChildPos = function (pos) {
    if (typeof children[pos] !== 'undefined') {
      if (typeof children[pos] !== 'undefined') {
        children.splice(pos, 1);
      }
    }
  };

  this.removeChild = function (node) {
    if (!(node instanceof TreeNode)) {
      throw new Error('Parameter 1 must be of type TreeNode');
    }

    this.removeChildPos(this.getIndexOfChild(node));
  };

  this.getChildren = function () {
    return children;
  };

  this.getChildCount = function () {
    return children.length;
  };

  this.getIndexOfChild = function (node) {
    for (let i = 0; i < children.length; i++) {
      if (children[i].equals(node)) {
        return i;
      }
    }

    return -1;
  };

  this.getRoot = function () {
    let node = this;

    while (typeof node.parent !== 'undefined') {
      node = node.parent;
    }

    return node;
  };

  this.setUserObject = function (_userObject) {
    if (!(typeof _userObject === 'string') || typeof _userObject.toString !== 'function') {
      throw new Error('Parameter 1 must be of type String or Object, where it must have the function toString()');
    } else {
      userObject = _userObject;
    }
  };

  this.getUserObject = function () {
    return userObject;
  };

  this.setOptions = function (_options) {
    if (typeof _options === 'object') {
      options = _options;
    }
  };

  this.changeOption = function (option, value) {
    options[option] = value;
  };

  this.getOptions = function () {
    return options;
  };

  this.isLeaf = function () {
    return children.length === 0;
  };

  this.setExpanded = function (_expanded) {
    if (this.isLeaf()) {
      return;
    }

    if (typeof _expanded === 'boolean') {
      if (expanded === _expanded) {
        return;
      }

      expanded = _expanded;

      if (_expanded) {
        this.on('expand')(this);
      } else {
        this.on('collapse')(this);
      }

      this.on('toggle_expanded')(this);
    }
  };

  this.toggleExpanded = function () {
    if (expanded) {
      this.setExpanded(false);
    } else {
      this.setExpanded(true);
    }
  };

  this.isExpanded = function () {
    if (this.isLeaf()) {
      return true;
    }
    return expanded;
  };

  this.setEnabled = function (_enabled) {
    if (typeof _enabled === 'boolean') {
      if (enabled === _enabled) {
        return;
      }

      enabled = _enabled;

      if (_enabled) {
        this.on('enable')(this);
      } else {
        this.on('disable')(this);
      }

      this.on('toggle_enabled')(this);
    }
  };

  this.toggleEnabled = function () {
    if (enabled) {
      this.setEnabled(false);
    } else {
      this.setEnabled(true);
    }
  };

  this.isEnabled = function () {
    return enabled;
  };

  this.setSelected = function (_selected) {
    if (typeof _selected !== 'boolean') {
      return;
    }

    if (selected === _selected) {
      return;
    }

    selected = _selected;

    if (_selected) {
      this.on('select')(this);
    } else {
      this.on('deselect')(this);
    }

    this.on('toggle_selected')(this);
  };

  this.toggleSelected = function () {
    if (selected) {
      this.setSelected(false);
    } else {
      this.setSelected(true);
    }
  };

  this.isSelected = function () {
    return selected;
  };

  this.open = function () {
    if (!this.isLeaf()) {
      this.on('open')(this);
    }
  };

  // eslint-disable-next-line consistent-return
  this.on = function (ev, callback) {
    if (typeof callback === 'undefined') {
      if (typeof events[ev] !== 'function') {
        return function () {
          /* noop function */
        };
      }
      return events[ev];
    }

    if (typeof callback !== 'function') {
      throw new Error('Argument 2 must be of type function');
    }

    events[ev] = callback;
  };

  this.getListener = function (ev) {
    return events[ev];
  };

  this.equals = function (node) {
    if (node instanceof TreeNode) {
      if (node.getUserObject() === userObject) {
        return true;
      }
    }

    return false;
  };

  this.toString = function () {
    if (typeof userObject === 'string') {
      return userObject;
    }
    return userObject.toString();
  };
}

function TreePath(root, node) {
  let nodes = new Array();

  this.setPath = function (pathRoot, pathNode) {
    nodes = new Array();

    let _pathNode = pathNode;

    while (typeof _pathNode !== 'undefined' && !_pathNode.equals(pathRoot)) {
      nodes.push(_pathNode);
      _pathNode = _pathNode.parent;
    }

    if (_pathNode.equals(pathRoot)) {
      nodes.push(pathRoot);
    } else {
      nodes = new Array();
      throw new Error('Node is not contained in the tree of root');
    }

    nodes = nodes.reverse();

    return nodes;
  };

  this.getPath = function () {
    return nodes;
  };

  this.toString = function () {
    return nodes.join(' - ');
  };

  if (root instanceof TreeNode && node instanceof TreeNode) {
    this.setPath(root, node);
  }
}

// eslint-disable-next-line no-unused-vars
function TreeView(treeRoot, treeContainer, treeOptions) {
  const self = this;

  let root = treeRoot;
  let container = treeContainer;
  let options = treeOptions;

  /*
   * Konstruktor
   */
  if (typeof root === 'undefined') {
    throw new Error('Parameter 1 must be set (root)');
  }

  if (!(root instanceof TreeNode)) {
    throw new Error('Parameter 1 must be of type TreeNode');
  }

  if (container) {
    if (!TreeUtil.isDOM(container)) {
      container = document.querySelector(container);

      if (container instanceof Array) {
        container = container[0];
      }

      if (!TreeUtil.isDOM(container)) {
        throw new Error('Parameter 2 must be either DOM-Object or CSS-QuerySelector (#, .)');
      }
    }
  } else {
    container = null;
  }

  if (!options || typeof options !== 'object') {
    options = {};
  }

  /*
   * Methods
   */
  this.setRoot = function (_root) {
    if (root instanceof TreeNode) {
      root = _root;
    }
  };

  this.getRoot = function () {
    return root;
  };

  this.expandAllNodes = function () {
    root.setExpanded(true);

    root.getChildren().forEach((child) => {
      TreeUtil.expandNode(child);
    });
  };

  this.expandPath = function (path) {
    if (!(path instanceof TreePath)) {
      throw new Error('Parameter 1 must be of type TreePath');
    }

    path.getPath().forEach((node) => {
      node.setExpanded(true);
    });
  };

  this.collapseAllNodes = function () {
    root.setExpanded(false);

    root.getChildren().forEach((child) => {
      TreeUtil.collapseNode(child);
    });
  };

  this.setContainer = function (_container) {
    if (TreeUtil.isDOM(_container)) {
      container = _container;
    } else {
      let queriedContainer = document.querySelector(_container);

      if (queriedContainer instanceof Array) {
        queriedContainer = queriedContainer[0];
      }

      if (!TreeUtil.isDOM(queriedContainer)) {
        throw new Error('Parameter 1 must be either DOM-Object or CSS-QuerySelector (#, .)');
      }

      container = queriedContainer;
    }
  };

  this.getContainer = function () {
    return container;
  };

  this.setOptions = function (_options) {
    if (typeof _options === 'object') {
      options = _options;
    }
  };

  this.changeOption = function (option, value) {
    options[option] = value;
  };

  this.getOptions = function () {
    return options;
  };

  this.getSelectedNodesForNode = function (node) {
    if (!(node instanceof TreeNode)) {
      throw new Error('Parameter 1 must be of type TreeNode');
    }

    const ret = new Array();

    if (node.isSelected()) {
      ret.push(node);
    }

    node.getChildren().forEach((child) => {
      if (child.isSelected()) {
        if (ret.indexOf(child) === -1) {
          ret.push(child);
        }
      }

      if (!child.isLeaf()) {
        self.getSelectedNodesForNode(child).forEach((_node) => {
          if (ret.indexOf(_node) === -1) {
            ret.push(_node);
          }
        });
      }
    });

    return ret;
  };

  // TODO: set selected key: up down; expand right; collapse left; enter: open;
  this.getSelectedNodes = function () {
    return self.getSelectedNodesForNode(root);
  };

  function renderNode(node) {
    const li_outer = document.createElement('li');
    const span_desc = document.createElement('span');
    span_desc.className = 'tj_description';
    span_desc.tj_node = node;

    if (!node.isEnabled()) {
      li_outer.setAttribute('disabled', '');
      node.setExpanded(false);
      node.setSelected(false);
    }

    if (node.isSelected()) {
      span_desc.classList.add('selected');
    }

    span_desc.addEventListener('click', (e) => {
      let cur_el = e.target;

      while (typeof cur_el.tj_node === 'undefined' || cur_el.classList.contains('tj_container')) {
        cur_el = cur_el.parentElement;
      }

      const node_cur = cur_el.tj_node;

      if (typeof node_cur === 'undefined') {
        return;
      }

      if (node_cur.isEnabled()) {
        if (e.ctrlKey === false) {
          if (node_cur.isLeaf()) {
            node_cur.open();
          } else {
            node_cur.toggleExpanded();
            self.reload();
          }

          node_cur.on('click')(e, node_cur);
        }

        if (e.ctrlKey === true) {
          node_cur.toggleSelected();
          self.reload();
        } else {
          const rt = node_cur.getRoot();

          if (rt instanceof TreeNode) {
            self.getSelectedNodesForNode(rt).forEach((_nd) => {
              _nd.setSelected(false);
            });
          }
          node_cur.setSelected(true);

          self.reload();
        }
      }
    });

    span_desc.addEventListener('contextmenu', (e) => {
      let cur_el = e.target;

      while (typeof cur_el.tj_node === 'undefined' || cur_el.classList.contains('tj_container')) {
        cur_el = cur_el.parentElement;
      }

      const node_cur = cur_el.tj_node;

      if (typeof node_cur === 'undefined') {
        return;
      }

      if (typeof node_cur.getListener('contextmenu') !== 'undefined') {
        node_cur.on('contextmenu')(e, node_cur);
        e.preventDefault();
      } else if (typeof TreeConfig.context_menu === 'function') {
        TreeConfig.context_menu(e, node_cur);
        e.preventDefault();
      }
    });

    if (node.isLeaf() && !TreeUtil.getProperty(node.getOptions(), 'forceParent', false)) {
      let ret = '';
      let icon = TreeUtil.getProperty(node.getOptions(), 'icon', '');
      if (icon !== '') {
        ret += `<span class="tj_icon">${icon}</span>`;
      } else if ((icon = TreeUtil.getProperty(options, 'leaf_icon', '')) === '') {
        ret += `<span class="tj_icon">${TreeConfig.leaf_icon}</span>`;
      } else {
        ret += `<span class="tj_icon">${icon}</span>`;
      }

      span_desc.innerHTML = `${ret + node.toString()}</span>`;
      span_desc.classList.add('tj_leaf');

      li_outer.appendChild(span_desc);
    } else {
      let ret = '';
      if (node.isExpanded()) {
        ret += `<span class="tj_mod_icon">${TreeConfig.open_icon}</span>`;
      } else {
        ret += `<span class="tj_mod_icon">${TreeConfig.close_icon}</span>`;
      }

      let icon = TreeUtil.getProperty(node.getOptions(), 'icon', '');
      if (icon !== '') {
        ret += `<span class="tj_icon">${icon}</span>`;
      } else if ((icon = TreeUtil.getProperty(options, 'parent_icon', '')) === '') {
        ret += `<span class="tj_icon">${TreeConfig.parent_icon}</span>`;
      } else {
        ret += `<span class="tj_icon">${icon}</span>`;
      }

      span_desc.innerHTML = `${ret + node.toString()}</span>`;

      li_outer.appendChild(span_desc);

      if (node.isExpanded()) {
        const ul_container = document.createElement('ul');

        node.getChildren().forEach((child) => {
          ul_container.appendChild(renderNode(child));
        });

        li_outer.appendChild(ul_container);
      }
    }

    return li_outer;
  }

  this.reload = function () {
    if (container === null) {
      console.warn('No container specified');
      return;
    }

    container.classList.add('tj_container');

    const cnt = document.createElement('ul');

    if (TreeUtil.getProperty(options, 'show_root', true)) {
      cnt.appendChild(renderNode(root));
    } else {
      root.getChildren().forEach((child) => {
        cnt.appendChild(renderNode(child));
      });
    }

    container.innerHTML = '';
    container.appendChild(cnt);
  };

  if (typeof container !== 'undefined') this.reload();
}
