
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-raf/index.js", Function("exports, require, module",
"\nmodule.exports = window.requestAnimationFrame\n  || window.webkitRequestAnimationFrame\n  || window.mozRequestAnimationFrame\n  || window.oRequestAnimationFrame\n  || window.msRequestAnimationFrame\n  || fallback;\n\nvar prev = new Date().getTime();\nfunction fallback(fn) {\n  var curr = new Date().getTime();\n  var ms = Math.max(0, 16 - (curr - prev));\n  setTimeout(fn, ms);\n  prev = curr;\n}\n//@ sourceURL=component-raf/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n\n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n\n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return el.removeChild(el.lastChild);\n  }\n\n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  var els = el.children;\n  if (1 == els.length) {\n    return el.removeChild(els[0]);\n  }\n\n  var fragment = document.createDocumentFragment();\n  while (els.length) {\n    fragment.appendChild(el.removeChild(els[0]));\n  }\n\n  return fragment;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\nmodule.exports = function(a, b){\n  var fn = function(){};\n  fn.prototype = b.prototype;\n  a.prototype = new fn;\n  a.prototype.constructor = a;\n};//@ sourceURL=component-inherit/index.js"
));
require.register("timoxley-assert/index.js", Function("exports, require, module",
"// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n//\n// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n//\n// Originally from narwhal.js (http://narwhaljs.org)\n// Copyright (c) 2009 Thomas Robinson <280north.com>\n//\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the 'Software'), to\n// deal in the Software without restriction, including without limitation the\n// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n// sell copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n//\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n// Adapted for browser components by Tim Oxley\n// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js\n\n// UTILITY\nvar inherit = require('inherit');\nvar pSlice = Array.prototype.slice;\n\n// 1. The assert module provides functions that throw\n// AssertionError's when particular conditions are not met. The\n// assert module must conform to the following interface.\n\nvar assert = module.exports = ok;\n\n// 2. The AssertionError is defined in assert.\n// new assert.AssertionError({ message: message,\n//                             actual: actual,\n//                             expected: expected })\n\nassert.AssertionError = function AssertionError(options) {\n  this.name = 'AssertionError';\n  this.message = options.message;\n  this.actual = options.actual;\n  this.expected = options.expected;\n  this.operator = options.operator;\n  var stackStartFunction = options.stackStartFunction || fail;\n\n  if (Error.captureStackTrace) {\n    Error.captureStackTrace(this, stackStartFunction);\n  }\n};\n\n// assert.AssertionError instanceof Error\ninherit(assert.AssertionError, Error);\n\nfunction replacer(key, value) {\n  if (value === undefined) {\n    return '' + value;\n  }\n  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n    return value.toString();\n  }\n  if (typeof value === 'function' || value instanceof RegExp) {\n    return value.toString();\n  }\n  return value;\n}\n\nfunction truncate(s, n) {\n  if (typeof s == 'string') {\n    return s.length < n ? s : s.slice(0, n);\n  } else {\n    return s;\n  }\n}\n\nassert.AssertionError.prototype.toString = function() {\n  if (this.message) {\n    return [this.name + ':', this.message].join(' ');\n  } else {\n    return [\n      this.name + ':',\n      truncate(JSON.stringify(this.actual, replacer), 128),\n      this.operator,\n      truncate(JSON.stringify(this.expected, replacer), 128)\n    ].join(' ');\n  }\n};\n\n// At present only the three keys mentioned above are used and\n// understood by the spec. Implementations or sub modules can pass\n// other keys to the AssertionError's constructor - they will be\n// ignored.\n\n// 3. All of the following functions must throw an AssertionError\n// when a corresponding condition is not met, with a message that\n// may be undefined if not provided.  All assertion methods provide\n// both the actual and expected values to the assertion error for\n// display purposes.\n\nfunction fail(actual, expected, message, operator, stackStartFunction) {\n  throw new assert.AssertionError({\n    message: message,\n    actual: actual,\n    expected: expected,\n    operator: operator,\n    stackStartFunction: stackStartFunction\n  });\n}\n\n// EXTENSION! allows for well behaved errors defined elsewhere.\nassert.fail = fail;\n\n// 4. Pure assertion tests whether a value is truthy, as determined\n// by !!guard.\n// assert.ok(guard, message_opt);\n// This statement is equivalent to assert.equal(true, !!guard,\n// message_opt);. To test strictly for the value true, use\n// assert.strictEqual(true, guard, message_opt);.\n\nfunction ok(value, message) {\n  if (!!!value) fail(value, true, message, '==', assert.ok);\n}\nassert.ok = ok;\n\n// 5. The equality assertion tests shallow, coercive equality with\n// ==.\n// assert.equal(actual, expected, message_opt);\n\nassert.equal = function equal(actual, expected, message) {\n  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n};\n\n// 6. The non-equality assertion tests for whether two objects are not equal\n// with != assert.notEqual(actual, expected, message_opt);\n\nassert.notEqual = function notEqual(actual, expected, message) {\n  if (actual == expected) {\n    fail(actual, expected, message, '!=', assert.notEqual);\n  }\n};\n\n// 7. The equivalence assertion tests a deep equality relation.\n// assert.deepEqual(actual, expected, message_opt);\n\nassert.deepEqual = function deepEqual(actual, expected, message) {\n  if (!_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n  }\n};\n\nfunction _deepEqual(actual, expected) {\n  // 7.1. All identical values are equivalent, as determined by ===.\n  if (actual === expected) {\n    return true;\n\n  // 7.2. If the expected value is a Date object, the actual value is\n  // equivalent if it is also a Date object that refers to the same time.\n  } else if (actual instanceof Date && expected instanceof Date) {\n    return actual.getTime() === expected.getTime();\n\n  // 7.3 If the expected value is a RegExp object, the actual value is\n  // equivalent if it is also a RegExp object with the same source and\n  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n  } else if (actual instanceof RegExp && expected instanceof RegExp) {\n    return actual.source === expected.source &&\n           actual.global === expected.global &&\n           actual.multiline === expected.multiline &&\n           actual.lastIndex === expected.lastIndex &&\n           actual.ignoreCase === expected.ignoreCase;\n\n  // 7.4. Other pairs that do not both pass typeof value == 'object',\n  // equivalence is determined by ==.\n  } else if (typeof actual != 'object' && typeof expected != 'object') {\n    return actual == expected;\n\n  // 7.5 For all other Object pairs, including Array objects, equivalence is\n  // determined by having the same number of owned properties (as verified\n  // with Object.prototype.hasOwnProperty.call), the same set of keys\n  // (although not necessarily the same order), equivalent values for every\n  // corresponding key, and an identical 'prototype' property. Note: this\n  // accounts for both named and indexed properties on Arrays.\n  } else {\n    return objEquiv(actual, expected);\n  }\n}\n\nfunction isUndefinedOrNull(value) {\n  return value === null || value === undefined;\n}\n\nfunction isArguments(object) {\n  return Object.prototype.toString.call(object) == '[object Arguments]';\n}\n\nfunction objEquiv(a, b) {\n  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n    return false;\n  // an identical 'prototype' property.\n  if (a.prototype !== b.prototype) return false;\n  //~~~I've managed to break Object.keys through screwy arguments passing.\n  //   Converting to array solves the problem.\n  if (isArguments(a)) {\n    if (!isArguments(b)) {\n      return false;\n    }\n    a = pSlice.call(a);\n    b = pSlice.call(b);\n    return _deepEqual(a, b);\n  }\n  try {\n    var ka = Object.keys(a),\n        kb = Object.keys(b),\n        key, i;\n  } catch (e) {//happens when one is a string literal and the other isn't\n    return false;\n  }\n  // having the same number of owned properties (keys incorporates\n  // hasOwnProperty)\n  if (ka.length != kb.length)\n    return false;\n  //the same set of keys (although not necessarily the same order),\n  ka.sort();\n  kb.sort();\n  //~~~cheap key test\n  for (i = ka.length - 1; i >= 0; i--) {\n    if (ka[i] != kb[i])\n      return false;\n  }\n  //equivalent values for every corresponding key, and\n  //~~~possibly expensive deep test\n  for (i = ka.length - 1; i >= 0; i--) {\n    key = ka[i];\n    if (!_deepEqual(a[key], b[key])) return false;\n  }\n  return true;\n}\n\n// 8. The non-equivalence assertion tests for any deep inequality.\n// assert.notDeepEqual(actual, expected, message_opt);\n\nassert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n  if (_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n  }\n};\n\n// 9. The strict equality assertion tests strict equality, as determined by ===.\n// assert.strictEqual(actual, expected, message_opt);\n\nassert.strictEqual = function strictEqual(actual, expected, message) {\n  if (actual !== expected) {\n    fail(actual, expected, message, '===', assert.strictEqual);\n  }\n};\n\n// 10. The strict non-equality assertion tests for strict inequality, as\n// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\nassert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n  if (actual === expected) {\n    fail(actual, expected, message, '!==', assert.notStrictEqual);\n  }\n};\n\nfunction expectedException(actual, expected) {\n  if (!actual || !expected) {\n    return false;\n  }\n\n  if (expected instanceof RegExp) {\n    return expected.test(actual);\n  } else if (actual instanceof expected) {\n    return true;\n  } else if (expected.call({}, actual) === true) {\n    return true;\n  }\n\n  return false;\n}\n\nfunction _throws(shouldThrow, block, expected, message) {\n  var actual;\n\n  if (typeof expected === 'string') {\n    message = expected;\n    expected = null;\n  }\n\n  try {\n    block();\n  } catch (e) {\n    actual = e;\n  }\n\n  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n            (message ? ' ' + message : '.');\n\n  if (shouldThrow && !actual) {\n    fail(actual, expected, 'Missing expected exception' + message);\n  }\n\n  if (!shouldThrow && expectedException(actual, expected)) {\n    fail(actual, expected, 'Got unwanted exception' + message);\n  }\n\n  if ((shouldThrow && actual && expected &&\n      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n    throw actual;\n  }\n}\n\n// 11. Expected to throw an error:\n// assert.throws(block, Error_opt, message_opt);\n\nassert.throws = function(block, /*optional*/error, /*optional*/message) {\n  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n};\n\n// EXTENSION! This is annoying to write outside this module.\nassert.doesNotThrow = function(block, /*optional*/message) {\n  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n};\n\nassert.ifError = function(err) { if (err) {throw err;}};\n//@ sourceURL=timoxley-assert/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\nfunction one(selector, el) {\n  return el.querySelector(selector);\n}\n\nexports = module.exports = function(selector, el){\n  el = el || document;\n  return one(selector, el);\n};\n\nexports.all = function(selector, el){\n  el = el || document;\n  return el.querySelectorAll(selector);\n};\n\nexports.engine = function(obj){\n  if (!obj.one) throw new Error('.one callback required');\n  if (!obj.all) throw new Error('.all callback required');\n  one = obj.one;\n  exports.all = obj.all;\n};\n//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar query = require('query');\n\n/**\n * Element prototype.\n */\n\nvar proto = Element.prototype;\n\n/**\n * Vendor function.\n */\n\nvar vendor = proto.matchesSelector\n  || proto.webkitMatchesSelector\n  || proto.mozMatchesSelector\n  || proto.msMatchesSelector\n  || proto.oMatchesSelector;\n\n/**\n * Expose `match()`.\n */\n\nmodule.exports = match;\n\n/**\n * Match `el` to `selector`.\n *\n * @param {Element} el\n * @param {String} selector\n * @return {Boolean}\n * @api public\n */\n\nfunction match(el, selector) {\n  if (vendor) return vendor.call(el, selector);\n  var nodes = query.all(selector, el.parentNode);\n  for (var i = 0; i < nodes.length; ++i) {\n    if (nodes[i] == el) return true;\n  }\n  return false;\n}\n//@ sourceURL=component-matches-selector/index.js"
));
require.register("overlay/index.js", Function("exports, require, module",
"\"use strict\"\n\nvar raf = require('raf')\n\nvar overlays = []\n\n/**\n * Convenience method.\n * Find or create an Overlay for `template`,\n * and add `target` to overlay, and return overlay.\n */\n\nmodule.exports = function(template, target) {\n  var overlay = findOrCreateOverlay(template)\n  if (target) overlay.addTarget(target)\n  return overlay\n}\n\nmodule.exports.element = module.exports\n\n/**\n * Create an overlay over the current page.\n */\n\nmodule.exports.page = function(template) {\n  var overlay = findOrCreateOverlay(template)\n  overlay.addTarget(document.body.parentElement)\n  return overlay\n}\n\n/**\n * Create an overlay.\n */\n\nfunction Overlay(template) {\n  this.template = template\n  this.targets = []\n  this.container = document.createElement('div')\n  document.body.appendChild(this.container)\n  stretch(this.container, document.body)\n  this.container.style.pointerEvents = 'none';\n}\n\n/**\n * Show overlay container.\n */\n\nOverlay.prototype.show = function show() {\n  this.container.style.display = 'block'\n  return this\n}\n\n/**\n * Hide overlay container.\n */\n\nOverlay.prototype.hide = function show() {\n  this.container.style.display = 'none'\n  return this\n}\n\n/**\n * Render overlays for each target.\n */\nOverlay.prototype.render = function() {\n  var self = this\n  this.targets.forEach(function(target) {\n    if (!target.el) {\n      target.el = self.template.cloneNode(true)\n      self.container.appendChild(target.el)\n    }\n    target.stretch()\n  })\n}\n\n\n/**\n * Add an overlay target. Next `render` call will draw an\n * overlay over the target element.\n */\n\nOverlay.prototype.addTarget = function(targetEl) {\n  var self = this\n  if (targetEl instanceof NodeList) {\n    [].slice.call(targetEl).forEach(function(el) {\n      self.addTarget(el)\n    })\n    return this\n  }\n  var foundTarget = this.targets.reduce(function(result, target) {\n    if (target.target == targetEl) result = target\n    return result\n  }, undefined)\n  if (!foundTarget) this.targets.push(new Target(targetEl))\n  return this\n}\n\n/**\n * Remove overlay target. Removes from container immediately.\n */\n\nOverlay.prototype.removeTarget = function(targetEl) {\n  var self = this\n  if (targetEl instanceof NodeList) {\n    [].slice.call(targetEl).forEach(function(el) {\n      self.removeTarget(el)\n    })\n    return this\n  }\n  this.targets.reduce(function(result, target) {\n    // find matching targets\n    if (target.target == targetEl) return result.concat(target)\n    return result\n  }, []).forEach(function(target) {\n    //remove them\n    self.targets.splice(self.targets.indexOf(target), 1)\n    target.el && self.container.removeChild(target.el)\n  })\n  return this\n}\n\n\n/**\n * Reference to an element to draw an overlay on top of.\n */\n\nfunction Target(targetEl) {\n  this.target = targetEl\n}\n\n/**\n * Function used to compare two targets.\n */\n\nTarget.prototype.equals = function(t) {\n  return this.target === t.target\n}\n\n/**\n * Stretch an overlay element (`this.el`) over this target.\n */\n\nTarget.prototype.stretch = function() {\n  stretch(this.el, this.target)\n  return this\n}\n\n/**\n * Find the overlay matching this `template`,\n * or create a new Overlay for the template.\n */\n\nfunction findOrCreateOverlay(template) {\n  var foundOverlay = findOverlay(template)\n  if (foundOverlay) return foundOverlay\n  var overlay = new Overlay(template)\n  overlays.push(overlay)\n  return overlay\n}\n\n/**\n * Find the overlay matching this `template`.\n */\n\nfunction findOverlay(template) {\n  var foundOverlay = overlays.filter(function(overlay) {\n    return overlay.template == template\n  })\n  if (!foundOverlay.length) return undefined\n  return foundOverlay[0]\n}\n\n/**\n * Render every overlay. This is the draw loop.\n */\n\nfunction draw() {\n  overlays.forEach(function(overlay) {\n    overlay.render()\n  })\n  raf(draw)\n}\n\ndraw()\n\n/**\n * Stretch an `el` over `target`.\n */\n\nfunction stretch(el, target) {\n  var pos = target.getBoundingClientRect()\n  el.style.position = 'fixed'\n\n  // handles 'elastic' over-scrolling at top.\n  // TODO figure out how to detect over-scrolling\n  // at bottom and sides\n  el.style.top = document.body.scrollTop < 0\n   ? pos.top + document.body.scrollTop + 'px'\n   : pos.top + 'px'\n\n  el.style.bottom = pos.bottom + 'px'\n  el.style.left = pos.left + 'px'\n  el.style.right = pos.right + 'px'\n  el.style.height = pos.height + 'px'\n  el.style.width = pos.width + 'px'\n}\n//@ sourceURL=overlay/index.js"
));
require.alias("component-raf/index.js", "overlay/deps/raf/index.js");
require.alias("component-raf/index.js", "raf/index.js");

require.alias("component-domify/index.js", "overlay/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("timoxley-assert/index.js", "overlay/deps/assert/index.js");
require.alias("timoxley-assert/index.js", "assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-matches-selector/index.js", "overlay/deps/matches-selector/index.js");
require.alias("component-matches-selector/index.js", "matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

