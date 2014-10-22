/**
 * Module dependencies
 */

var Store = require('hyper-store');
var merge = require('utils-merge');

/**
 * Create a template
 *
 * @param {Object|String} template
 * @param {HyperClient} client
 * @param {Object} resources
 * @return {Template}
 */

module.exports = exports = function() {
  var i = function Template() {
    return i.render.apply(i, arguments);
  }

  merge(i, Template.prototype);
  Template.apply(i, arguments);

  return i;
};

/**
 * Template constructor
 */

function Template(template, client, resources) {
  if (typeof template === 'string') template = JSON.parse(template);
  this._t = template;
  this.store = new Store(client, resources);
  this.fns = [];
  this.traverse(template, []);
}

/**
 * Render a template
 *
 * @param {Object} scope
 * @param {Object} opts
 * @param {Function} cb
 */

Template.prototype.render = function(scope, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var out;
  var store = this.store;
  var fns = this.fns;

  var isArray = Array.isArray(this._t);

  function fetch() {
    if (store.start) store.start();

    out = isArray ? [] : {};

    fns.forEach(function(fn) {
      fn(scope, out);
    });
  }

  store.on('change', fetch);

  store.once('complete', function() {
    cb(null, out);
  });
  fetch();

  return this;
};

/**
 * Get a path in the store
 *
 * @param {Array} path
 * @param {Object} scope
 * @return {Any}
 */

Template.prototype.get = function(path, scope) {
  return this.store.get(path, scope, this.delim);
};

/**
 * Traverse the template and register and handlers
 *
 * @param {Any} node
 * @param {Array} path
 */

Template.prototype.traverse = function(node, path) {
  var self = this;
  if (typeof node === 'string') return self.parse(node, path);

  if (Array.isArray(node)) return node.forEach(function(child, i) {
    self.traverse(child, append(path, i));
  });

  for (var key in node) {
    self.traverse(node[key], append(path, key));
  }
};

/**
 * Parse a string in the template and add it to the handlers
 *
 * @param {String} str
 * @param {Array} path
 */

Template.prototype.parse = function(str, path) {
  var self = this;
  // TODO add support for expressions and methods

  str = str.replace('@', path.join('.'));
  var input = str.split('.');

  self.fns.push(function(scope, out) {
    var req = self.get(input, scope);
    if (typeof req.value !== 'undefined') set(out, path, req.value);
  });
};

/**
 * Pretty print the template
 *
 * @return {String}
 */

Template.prototype.toString = function() {
  return 'Template(' + JSON.stringify(this._t, null, '  ') + ')';
};

/**
 * Immutably append an item to an array
 *
 * @param {Array} arr
 * @param {Any} item
 * @return {Array}
 */

function append(arr, item) {
  arr = arr.slice();
  arr.push(item);
  return arr;
}

/**
 * Set an object's properties recursivly
 *
 * @param {Object} obj
 * @param {Array} path
 * @param {Any} value
 * @param {Integer} i
 */

function set(obj, path, value, i) {
  i = i || 0;
  var key = path[i];

  if (i === path.length - 1) return obj[key] = value;

  obj[key] = obj[key] || (typeof path[i + 1] === 'number' ? [] : {});

  return set(obj[key], path, value, i + 1);
}
