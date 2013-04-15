
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
  var index = path + '/index.js';

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
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
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
require.register("enyo-domready/index.js", Function("exports, require, module",
"/*!\n * Copyright (c) 2012 Matias Meno <m@tias.me>\n * \n * Original code (c) by Dustin Diaz 2012 - License MIT\n */\n\n\n/**\n * Expose `domready`.\n */\n\nmodule.exports = domready;\n\n\n/**\n *\n * Cross browser implementation of the domready event\n *\n * @param {Function} ready - the callback to be invoked as soon as the dom is fully loaded.\n * @api public\n */\n\nfunction domready(ready) {\n var fns = [], fn, f = false\n    , doc = document\n    , testEl = doc.documentElement\n    , hack = testEl.doScroll\n    , domContentLoaded = 'DOMContentLoaded'\n    , addEventListener = 'addEventListener'\n    , onreadystatechange = 'onreadystatechange'\n    , readyState = 'readyState'\n    , loaded = /^loade|c/.test(doc[readyState])\n\n  function flush(f) {\n    loaded = 1\n    while (f = fns.shift()) f()\n  }\n\n  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {\n    doc.removeEventListener(domContentLoaded, fn, f)\n    flush()\n  }, f)\n\n\n  hack && doc.attachEvent(onreadystatechange, fn = function () {\n    if (/^c/.test(doc[readyState])) {\n      doc.detachEvent(onreadystatechange, fn)\n      flush()\n    }\n  })\n\n  return (ready = hack ?\n    function (fn) {\n      self != top ?\n        loaded ? fn() : fns.push(fn) :\n        function () {\n          try {\n            testEl.doScroll('left')\n          } catch (e) {\n            return setTimeout(function() { ready(fn) }, 50)\n          }\n          fn()\n        }()\n    } :\n    function (fn) {\n      loaded ? fn() : fns.push(fn)\n    })\n}//@ sourceURL=enyo-domready/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\nmodule.exports = function(a, b){\n  var fn = function(){};\n  fn.prototype = b.prototype;\n  a.prototype = new fn;\n  a.prototype.constructor = a;\n};//@ sourceURL=component-inherit/index.js"
));
require.register("timoxley-assert/index.js", Function("exports, require, module",
"// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n//\n// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n//\n// Originally from narwhal.js (http://narwhaljs.org)\n// Copyright (c) 2009 Thomas Robinson <280north.com>\n//\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the 'Software'), to\n// deal in the Software without restriction, including without limitation the\n// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n// sell copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n//\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n// Adapted for browser components by Tim Oxley\n// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js\n\n// UTILITY\nvar inherit = require('inherit');\nvar pSlice = Array.prototype.slice;\n\n// 1. The assert module provides functions that throw\n// AssertionError's when particular conditions are not met. The\n// assert module must conform to the following interface.\n\nvar assert = module.exports = ok;\n\n// 2. The AssertionError is defined in assert.\n// new assert.AssertionError({ message: message,\n//                             actual: actual,\n//                             expected: expected })\n\nassert.AssertionError = function AssertionError(options) {\n  this.name = 'AssertionError';\n  this.message = options.message;\n  this.actual = options.actual;\n  this.expected = options.expected;\n  this.operator = options.operator;\n  var stackStartFunction = options.stackStartFunction || fail;\n\n  if (Error.captureStackTrace) {\n    Error.captureStackTrace(this, stackStartFunction);\n  }\n};\n\n// assert.AssertionError instanceof Error\ninherit(assert.AssertionError, Error);\n\nfunction replacer(key, value) {\n  if (value === undefined) {\n    return '' + value;\n  }\n  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n    return value.toString();\n  }\n  if (typeof value === 'function' || value instanceof RegExp) {\n    return value.toString();\n  }\n  return value;\n}\n\nfunction truncate(s, n) {\n  if (typeof s == 'string') {\n    return s.length < n ? s : s.slice(0, n);\n  } else {\n    return s;\n  }\n}\n\nassert.AssertionError.prototype.toString = function() {\n  if (this.message) {\n    return [this.name + ':', this.message].join(' ');\n  } else {\n    return [\n      this.name + ':',\n      truncate(JSON.stringify(this.actual, replacer), 128),\n      this.operator,\n      truncate(JSON.stringify(this.expected, replacer), 128)\n    ].join(' ');\n  }\n};\n\n// At present only the three keys mentioned above are used and\n// understood by the spec. Implementations or sub modules can pass\n// other keys to the AssertionError's constructor - they will be\n// ignored.\n\n// 3. All of the following functions must throw an AssertionError\n// when a corresponding condition is not met, with a message that\n// may be undefined if not provided.  All assertion methods provide\n// both the actual and expected values to the assertion error for\n// display purposes.\n\nfunction fail(actual, expected, message, operator, stackStartFunction) {\n  throw new assert.AssertionError({\n    message: message,\n    actual: actual,\n    expected: expected,\n    operator: operator,\n    stackStartFunction: stackStartFunction\n  });\n}\n\n// EXTENSION! allows for well behaved errors defined elsewhere.\nassert.fail = fail;\n\n// 4. Pure assertion tests whether a value is truthy, as determined\n// by !!guard.\n// assert.ok(guard, message_opt);\n// This statement is equivalent to assert.equal(true, !!guard,\n// message_opt);. To test strictly for the value true, use\n// assert.strictEqual(true, guard, message_opt);.\n\nfunction ok(value, message) {\n  if (!!!value) fail(value, true, message, '==', assert.ok);\n}\nassert.ok = ok;\n\n// 5. The equality assertion tests shallow, coercive equality with\n// ==.\n// assert.equal(actual, expected, message_opt);\n\nassert.equal = function equal(actual, expected, message) {\n  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n};\n\n// 6. The non-equality assertion tests for whether two objects are not equal\n// with != assert.notEqual(actual, expected, message_opt);\n\nassert.notEqual = function notEqual(actual, expected, message) {\n  if (actual == expected) {\n    fail(actual, expected, message, '!=', assert.notEqual);\n  }\n};\n\n// 7. The equivalence assertion tests a deep equality relation.\n// assert.deepEqual(actual, expected, message_opt);\n\nassert.deepEqual = function deepEqual(actual, expected, message) {\n  if (!_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n  }\n};\n\nfunction _deepEqual(actual, expected) {\n  // 7.1. All identical values are equivalent, as determined by ===.\n  if (actual === expected) {\n    return true;\n\n  // 7.2. If the expected value is a Date object, the actual value is\n  // equivalent if it is also a Date object that refers to the same time.\n  } else if (actual instanceof Date && expected instanceof Date) {\n    return actual.getTime() === expected.getTime();\n\n  // 7.3 If the expected value is a RegExp object, the actual value is\n  // equivalent if it is also a RegExp object with the same source and\n  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n  } else if (actual instanceof RegExp && expected instanceof RegExp) {\n    return actual.source === expected.source &&\n           actual.global === expected.global &&\n           actual.multiline === expected.multiline &&\n           actual.lastIndex === expected.lastIndex &&\n           actual.ignoreCase === expected.ignoreCase;\n\n  // 7.4. Other pairs that do not both pass typeof value == 'object',\n  // equivalence is determined by ==.\n  } else if (typeof actual != 'object' && typeof expected != 'object') {\n    return actual == expected;\n\n  // 7.5 For all other Object pairs, including Array objects, equivalence is\n  // determined by having the same number of owned properties (as verified\n  // with Object.prototype.hasOwnProperty.call), the same set of keys\n  // (although not necessarily the same order), equivalent values for every\n  // corresponding key, and an identical 'prototype' property. Note: this\n  // accounts for both named and indexed properties on Arrays.\n  } else {\n    return objEquiv(actual, expected);\n  }\n}\n\nfunction isUndefinedOrNull(value) {\n  return value === null || value === undefined;\n}\n\nfunction isArguments(object) {\n  return Object.prototype.toString.call(object) == '[object Arguments]';\n}\n\nfunction objEquiv(a, b) {\n  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n    return false;\n  // an identical 'prototype' property.\n  if (a.prototype !== b.prototype) return false;\n  //~~~I've managed to break Object.keys through screwy arguments passing.\n  //   Converting to array solves the problem.\n  if (isArguments(a)) {\n    if (!isArguments(b)) {\n      return false;\n    }\n    a = pSlice.call(a);\n    b = pSlice.call(b);\n    return _deepEqual(a, b);\n  }\n  try {\n    var ka = Object.keys(a),\n        kb = Object.keys(b),\n        key, i;\n  } catch (e) {//happens when one is a string literal and the other isn't\n    return false;\n  }\n  // having the same number of owned properties (keys incorporates\n  // hasOwnProperty)\n  if (ka.length != kb.length)\n    return false;\n  //the same set of keys (although not necessarily the same order),\n  ka.sort();\n  kb.sort();\n  //~~~cheap key test\n  for (i = ka.length - 1; i >= 0; i--) {\n    if (ka[i] != kb[i])\n      return false;\n  }\n  //equivalent values for every corresponding key, and\n  //~~~possibly expensive deep test\n  for (i = ka.length - 1; i >= 0; i--) {\n    key = ka[i];\n    if (!_deepEqual(a[key], b[key])) return false;\n  }\n  return true;\n}\n\n// 8. The non-equivalence assertion tests for any deep inequality.\n// assert.notDeepEqual(actual, expected, message_opt);\n\nassert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n  if (_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n  }\n};\n\n// 9. The strict equality assertion tests strict equality, as determined by ===.\n// assert.strictEqual(actual, expected, message_opt);\n\nassert.strictEqual = function strictEqual(actual, expected, message) {\n  if (actual !== expected) {\n    fail(actual, expected, message, '===', assert.strictEqual);\n  }\n};\n\n// 10. The strict non-equality assertion tests for strict inequality, as\n// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\nassert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n  if (actual === expected) {\n    fail(actual, expected, message, '!==', assert.notStrictEqual);\n  }\n};\n\nfunction expectedException(actual, expected) {\n  if (!actual || !expected) {\n    return false;\n  }\n\n  if (expected instanceof RegExp) {\n    return expected.test(actual);\n  } else if (actual instanceof expected) {\n    return true;\n  } else if (expected.call({}, actual) === true) {\n    return true;\n  }\n\n  return false;\n}\n\nfunction _throws(shouldThrow, block, expected, message) {\n  var actual;\n\n  if (typeof expected === 'string') {\n    message = expected;\n    expected = null;\n  }\n\n  try {\n    block();\n  } catch (e) {\n    actual = e;\n  }\n\n  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n            (message ? ' ' + message : '.');\n\n  if (shouldThrow && !actual) {\n    fail(actual, expected, 'Missing expected exception' + message);\n  }\n\n  if (!shouldThrow && expectedException(actual, expected)) {\n    fail(actual, expected, 'Got unwanted exception' + message);\n  }\n\n  if ((shouldThrow && actual && expected &&\n      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n    throw actual;\n  }\n}\n\n// 11. Expected to throw an error:\n// assert.throws(block, Error_opt, message_opt);\n\nassert.throws = function(block, /*optional*/error, /*optional*/message) {\n  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n};\n\n// EXTENSION! This is annoying to write outside this module.\nassert.doesNotThrow = function(block, /*optional*/message) {\n  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n};\n\nassert.ifError = function(err) { if (err) {throw err;}};\n//@ sourceURL=timoxley-assert/index.js"
));
require.register("timoxley-dom-support/index.js", Function("exports, require, module",
"var domready = require('domready')()\n\nmodule.exports = (function() {\n\n\tvar support,\n\t\tall,\n\t\ta,\n\t\tselect,\n\t\topt,\n\t\tinput,\n\t\tfragment,\n\t\teventName,\n\t\ti,\n\t\tisSupported,\n\t\tclickFn,\n\t\tdiv = document.createElement(\"div\");\n\n\t// Setup\n\tdiv.setAttribute( \"className\", \"t\" );\n\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\n\t// Support tests won't run in some limited or non-browser environments\n\tall = div.getElementsByTagName(\"*\");\n\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\tif ( !all || !a || !all.length ) {\n\t\treturn {};\n\t}\n\n\t// First batch of tests\n\tselect = document.createElement(\"select\");\n\topt = select.appendChild( document.createElement(\"option\") );\n\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\n\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\tsupport = {\n\t\t// IE strips leading whitespace when .innerHTML is used\n\t\tleadingWhitespace: ( div.firstChild.nodeType === 3 ),\n\n\t\t// Make sure that tbody elements aren't automatically inserted\n\t\t// IE will insert them into empty tables\n\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\n\t\t// Make sure that link elements get serialized correctly by innerHTML\n\t\t// This requires a wrapper element in IE\n\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\n\t\t// Get the style information from getAttribute\n\t\t// (IE uses .cssText instead)\n\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\n\t\t// Make sure that URLs aren't manipulated\n\t\t// (IE normalizes it by default)\n\t\threfNormalized: ( a.getAttribute(\"href\") === \"/a\" ),\n\n\t\t// Make sure that element opacity exists\n\t\t// (IE uses filter instead)\n\t\t// Use a regex to work around a WebKit issue. See #5145\n\t\topacity: /^0.5/.test( a.style.opacity ),\n\n\t\t// Verify style float existence\n\t\t// (IE uses styleFloat instead of cssFloat)\n\t\tcssFloat: !!a.style.cssFloat,\n\n\t\t// Make sure that if no value is specified for a checkbox\n\t\t// that it defaults to \"on\".\n\t\t// (WebKit defaults to \"\" instead)\n\t\tcheckOn: ( input.value === \"on\" ),\n\n\t\t// Make sure that a selected-by-default option has a working selected property.\n\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\t\toptSelected: opt.selected,\n\n\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\t\tgetSetAttribute: div.className !== \"t\",\n\n\t\t// Tests for enctype support on a form (#6743)\n\t\tenctype: !!document.createElement(\"form\").enctype,\n\n\t\t// Makes sure cloning an html5 element does not cause problems\n\t\t// Where outerHTML is undefined, this still works\n\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\n\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\t\tboxModel: ( document.compatMode === \"CSS1Compat\" ),\n\n\t\t// Will be defined later\n\t\tsubmitBubbles: true,\n\t\tchangeBubbles: true,\n\t\tfocusinBubbles: false,\n\t\tdeleteExpando: true,\n\t\tnoCloneEvent: true,\n\t\tinlineBlockNeedsLayout: false,\n\t\tshrinkWrapBlocks: false,\n\t\treliableMarginRight: true,\n\t\tboxSizingReliable: true,\n\t\tpixelPosition: false\n\t};\n\n\t// Make sure checked status is properly cloned\n\tinput.checked = true;\n\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\n\t// Make sure that the options inside disabled selects aren't marked as disabled\n\t// (WebKit marks them as disabled)\n\tselect.disabled = true;\n\tsupport.optDisabled = !opt.disabled;\n\n\t// Test to see if it's possible to delete an expando from an element\n\t// Fails in Internet Explorer\n\ttry {\n\t\tdelete div.test;\n\t} catch( e ) {\n\t\tsupport.deleteExpando = false;\n\t}\n\n\tif ( !div.addEventListener && div.attachEvent && div.fireEvent ) {\n\t\tdiv.attachEvent( \"onclick\", clickFn = function() {\n\t\t\t// Cloning a node shouldn't copy over any\n\t\t\t// bound event handlers (IE does this)\n\t\t\tsupport.noCloneEvent = false;\n\t\t});\n\t\tdiv.cloneNode( true ).fireEvent(\"onclick\");\n\t\tdiv.detachEvent( \"onclick\", clickFn );\n\t}\n\n\t// Check if a radio maintains its value\n\t// after being appended to the DOM\n\tinput = document.createElement(\"input\");\n\tinput.value = \"t\";\n\tinput.setAttribute( \"type\", \"radio\" );\n\tsupport.radioValue = input.value === \"t\";\n\n\tinput.setAttribute( \"checked\", \"checked\" );\n\n\t// #11217 - WebKit loses check when the name is after the checked attribute\n\tinput.setAttribute( \"name\", \"t\" );\n\n\tdiv.appendChild( input );\n\tfragment = document.createDocumentFragment();\n\tfragment.appendChild( div.lastChild );\n\n\t// WebKit doesn't clone checked state correctly in fragments\n\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\n\t// Check if a disconnected checkbox will retain its checked\n\t// value of true after appended to the DOM (IE6/7)\n\tsupport.appendChecked = input.checked;\n\n\tfragment.removeChild( input );\n\tfragment.appendChild( div );\n\n\t// Technique from Juriy Zaytsev\n\t// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/\n\t// We only care about the case where non-standard event systems\n\t// are used, namely in IE. Short-circuiting here helps us to\n\t// avoid an eval call (in setAttribute) which can cause CSP\n\t// to go haywire. See: https://developer.mozilla.org/en/Security/CSP\n\tif ( !div.addEventListener ) {\n\t\tfor ( i in {\n\t\t\tsubmit: true,\n\t\t\tchange: true,\n\t\t\tfocusin: true\n\t\t}) {\n\t\t\teventName = \"on\" + i;\n\t\t\tisSupported = ( eventName in div );\n\t\t\tif ( !isSupported ) {\n\t\t\t\tdiv.setAttribute( eventName, \"return;\" );\n\t\t\t\tisSupported = ( typeof div[ eventName ] === \"function\" );\n\t\t\t}\n\t\t\tsupport[ i + \"Bubbles\" ] = isSupported;\n\t\t}\n\t}\n\n\t// Run tests that need a body at doc ready\n\tdomready(function() {\n\t\tvar container, div, tds, marginDiv,\n\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\n\t\tif ( !body ) {\n\t\t\t// Return for frameset docs that don't have a body\n\t\t\treturn;\n\t\t}\n\n\t\tcontainer = document.createElement(\"div\");\n\t\tcontainer.style.cssText = \"visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px\";\n\t\tbody.insertBefore( container, body.firstChild );\n\n\t\t// Construct the test element\n\t\tdiv = document.createElement(\"div\");\n\t\tcontainer.appendChild( div );\n\n    //Check if table cells still have offsetWidth/Height when they are set\n    //to display:none and there are still other visible table cells in a\n    //table row; if so, offsetWidth/Height are not reliable for use when\n    //determining if an element has been hidden directly using\n    //display:none (it is still safe to use offsets if a parent element is\n    //hidden; don safety goggles and see bug #4512 for more information).\n    //(only IE 8 fails this test)\n\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\t\ttds = div.getElementsByTagName(\"td\");\n\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\n\t\ttds[ 0 ].style.display = \"\";\n\t\ttds[ 1 ].style.display = \"none\";\n\n\t\t// Check if empty table cells still have offsetWidth/Height\n\t\t// (IE <= 8 fail this test)\n\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\n\t\t// Check box-sizing and margin behavior\n\t\tdiv.innerHTML = \"\";\n\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\n\t\t// NOTE: To any future maintainer, we've window.getComputedStyle\n\t\t// because jsdom on node.js will break without it.\n\t\tif ( window.getComputedStyle ) {\n\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\n\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\t\t\t// gets computed margin-right based on width of container. For more\n\t\t\t// info see bug #3333\n\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\t\t\tmarginDiv = document.createElement(\"div\");\n\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\t\t\tdiv.style.width = \"1px\";\n\t\t\tdiv.appendChild( marginDiv );\n\t\t\tsupport.reliableMarginRight =\n\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\t\t}\n\n\t\tif ( typeof div.style.zoom !== \"undefined\" ) {\n\t\t\t// Check if natively block-level elements act like inline-block\n\t\t\t// elements when setting their display to 'inline' and giving\n\t\t\t// them layout\n\t\t\t// (IE < 8 does this)\n\t\t\tdiv.innerHTML = \"\";\n\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\n\t\t\t// Check if elements with layout shrink-wrap their children\n\t\t\t// (IE 6 does this)\n\t\t\tdiv.style.display = \"block\";\n\t\t\tdiv.style.overflow = \"visible\";\n\t\t\tdiv.innerHTML = \"<div></div>\";\n\t\t\tdiv.firstChild.style.width = \"5px\";\n\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\n\t\t\tcontainer.style.zoom = 1;\n\t\t}\n\n\t\t// Null elements to avoid leaks in IE\n\t\tbody.removeChild( container );\n\t\tcontainer = div = tds = marginDiv = null;\n\t});\n\n\t// Null elements to avoid leaks in IE\n\tfragment.removeChild( div );\n\tall = a = select = opt = input = fragment = div = null;\n\n\treturn support;\n})();\n\n//@ sourceURL=timoxley-dom-support/index.js"
));
require.register("component-within-document/index.js", Function("exports, require, module",
"\n/**\n * Check if `el` is within the document.\n *\n * @param {Element} el\n * @return {Boolean}\n * @api private\n */\n\nmodule.exports = function(el) {\n  var node = el;\n  while (node = node.parentNode) {\n    if (node == document) return true;\n  }\n  return false;\n};//@ sourceURL=component-within-document/index.js"
));
require.register("timoxley-offset/index.js", Function("exports, require, module",
"var support = require('dom-support')\nvar contains = require('within-document')\n\n/**\n * Get offset of an element within the viewport.\n *\n * @api public\n */\n\nmodule.exports = function offset(el) {\n  var doc = el && el.ownerDocument\n  if (!doc) return\n\n  // Make sure it's not a disconnected DOM node\n  if (!contains(el)) return box\n\n  var body = doc.body\n  if (body === el) {\n    return bodyOffset(el)\n  }\n\n  var box = { top: 0, left: 0 }\n  if ( typeof el.getBoundingClientRect !== \"undefined\" ) {\n    // If we don't have gBCR, just use 0,0 rather than error\n    // BlackBerry 5, iOS 3 (original iPhone)\n    box = el.getBoundingClientRect()\n  }\n\n  var docEl = doc.documentElement\n  var clientTop  = docEl.clientTop  || body.clientTop  || 0\n  var clientLeft = docEl.clientLeft || body.clientLeft || 0\n  var scrollTop  = window.pageYOffset || docEl.scrollTop\n  var scrollLeft = window.pageXOffset || docEl.scrollLeft\n\n  return {\n    top: box.top  + scrollTop  - clientTop,\n    left: box.left + scrollLeft - clientLeft\n  }\n}\n\nfunction bodyOffset(body) {\n  var top = body.offsetTop\n  var left = body.offsetLeft\n\n  if (support.doesNotIncludeMarginInBodyOffset) {\n    top  += parseFloat(body.style.marginTop || 0)\n    left += parseFloat(body.style.marginLeft || 0)\n  }\n\n  return {\n    top: top,\n    left: left\n  }\n}\n//@ sourceURL=timoxley-offset/index.js"
));

require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"\n/**\n * Element prototype.\n */\n\nvar proto = Element.prototype;\n\n/**\n * Vendor function.\n */\n\nvar vendor = proto.matchesSelector\n  || proto.webkitMatchesSelector\n  || proto.mozMatchesSelector\n  || proto.msMatchesSelector\n  || proto.oMatchesSelector;\n\n/**\n * Expose `match()`.\n */\n\nmodule.exports = match;\n\n/**\n * Match `el` to `selector`.\n *\n * @param {Element} el\n * @param {String} selector\n * @return {Boolean}\n * @api public\n */\n\nfunction match(el, selector) {\n  if (vendor) return vendor.call(el, selector);\n  var nodes = el.parentNode.querySelectorAll(selector);\n  for (var i = 0; i < nodes.length; ++i) {\n    if (nodes[i] == el) return true;\n  }\n  return false;\n}//@ sourceURL=component-matches-selector/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("timoxley-element-selector/index.js", Function("exports, require, module",
"\"use strict\"\n\nvar Emitter = require('emitter')\nvar classes = require('classes')\nvar matchesSelector = require('matches-selector')\n\nvar DEFAULT_SELECTOR = 'body *'\nvar DEFAULT_INVALID_SELECTOR = ''\nvar DEFAULT_HIGHLIGHTED_CLASS = 'highlighted'\nvar DEFAULT_SELECTED_CLASS = 'selected'\nvar DEFAULT_SELECT_EVENT = 'click'\nvar DEFAULT_PREFIX_CLASS = 'element-selector'\nvar DEFAULT_ROOT_ELEMENT = document.body\n\nvar DEFAULT_ENABLED = false\nvar DEFAULT_USE_STYLES = true\n\nfunction ElementSelector(options) {\n  if (!(this instanceof ElementSelector)) return new ElementSelector(options)\n\n  options = options || {}\n  this.selector = options.selector || DEFAULT_SELECTOR\n  this.invalidSelector = options.invalidSelector || DEFAULT_INVALID_SELECTOR\n\n  this.highlightedClass = options.highlightedClass || DEFAULT_HIGHLIGHTED_CLASS\n\n  this.selectedClass = options.selectedClass || DEFAULT_SELECTED_CLASS\n\n  this.selectEvent = options.selectEvent || DEFAULT_SELECT_EVENT\n\n  this.prefixClass = options.prefixClass || DEFAULT_PREFIX_CLASS\n\n  this.useDefaultStyles = options.useDefaultStyles != null ? options.useDefaultStyles : DEFAULT_USE_STYLES\n\n  this.root = options.root || DEFAULT_ROOT_ELEMENT\n\n  this.enabled = options.enabled != null // Likely a Boolean\n    ? !!options.enabled\n    : DEFAULT_ENABLED\n\n  this.highlighted = undefined\n\n  bus.on('mouseover', this.highlight.bind(this))\n  bus.on('mouseout', this.dehighlight.bind(this))\n  bus.on(this.selectEvent, this.select.bind(this))\n\n  this.enabled ? this.enable() : this.disable()\n}\n\n\nElementSelector.prototype.matches = function matches(el) {\n  return !! el && matchesSelector(el, this.selector) &&\n         !(this.invalidSelector && matchesSelector(el, this.invalidSelector))\n}\n\nElementSelector.prototype.disable = function disable() {\n  this.enabled = false\n  this.deselect()\n  return this\n}\n\nElementSelector.prototype.enable = function enable() {\n  this.enabled = true\n  if (!this.useDefaultStyles) return this\n  classes(this.root).add(this.prefixClass)\n  return this\n}\n\nElementSelector.prototype.highlight = function highlight(el, e) {\n  if (!this.enabled) return this\n  if (this.matches(el)) {\n    if (this.highlighted && this.highlighted !== el) this.dehighlight(this.highlighted)\n    classes(el).add(this.highlightedClass)\n    this.highlighted = el\n    this.emit('highlight', el, e)\n  }\n  return this\n}\n\nElementSelector.prototype.dehighlight = function dehighlight(el, e) {\n  if (!this.enabled) return this\n  el = el || this.highlighted\n  if (this.matches(el)) {\n    classes(el).remove(this.highlightedClass)\n    this.highlighted = null\n    this.emit('dehighlight', el, e)\n  }\n  return this\n}\n\nElementSelector.prototype.select = function select(el, e) {\n  if (!this.enabled) return this\n  if (this.selected) this.deselect(null, e)\n  if (this.matches(el)) {\n    this.dehighlight()\n    classes(el).add(this.selectedClass)\n    this.selected = el\n    this.emit('select', el, e)\n  }\n}\n\nElementSelector.prototype.deselect = function deselect(el, e) {\n  if (!this.enabled) return this\n  el = el || this.selected\n  if (this.matches(el)) {\n    this.dehighlight()\n    classes(el).remove(this.selectedClass)\n    this.selected = null\n    this.emit('deselect', el, e)\n  }\n  return this\n}\n\nEmitter(ElementSelector.prototype)\n\n/**\n * Global bus for listening to mouse events.\n */\n\nvar bus = new Emitter()\n\nfunction initializeEvents() {\n  if (initializeEvents.complete) return\n  document.addEventListener('mouseover', function(e) {\n    bus.emit('mouseover', e.target, e)\n  })\n  document.addEventListener('mouseout', function(e) {\n    bus.emit('mouseout', e.target, e)\n  })\n  document.addEventListener('click', function(e) {\n    bus.emit('click', e.target, e)\n  })\n  document.addEventListener('mouseup', function(e) {\n    bus.emit('mouseup', e.target, e)\n  })\n  document.addEventListener('mousedown', function(e) {\n    bus.emit('mousedown', e.target, e)\n  })\n  document.addEventListener('dblclick', function(e) {\n    bus.emit('dblclick', e.target, e)\n  })\n\n  initializeEvents.complete = true\n}\n\ninitializeEvents()\n\nmodule.exports = ElementSelector\n//@ sourceURL=timoxley-element-selector/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return [el.removeChild(el.lastChild)];\n  }\n  \n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  return orphan(el.children);\n}\n\n/**\n * Orphan `els` and return an array.\n *\n * @param {NodeList} els\n * @return {Array}\n * @api private\n */\n\nfunction orphan(els) {\n  var ret = [];\n\n  while (els.length) {\n    ret.push(els[0].parentNode.removeChild(els[0]));\n  }\n\n  return ret;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("overlay/index.js", Function("exports, require, module",
"\"use strict\"\n\nvar offset = require('offset')\n\nmodule.exports = function(container, overlayEl) {\n  if (!overlayEl) overlayEl = getOverlay(container)\n  return new Overlay(container, overlayEl)\n}\n\nfunction Overlay(container, overlayEl) {\n  this.container = container\n  this.overlayEl = overlayEl\n  this.show = show.bind(this, this.container, this.overlayEl)\n  this.hide = hide.bind(this, this.container, this.overlayEl)\n}\n\nfunction show(container, overlayEl) {\n  if (!container || !overlayEl) return\n  overlayEl.style.position = 'absolute'\n\n  var position = offset(container)\n  overlayEl.style.top = position.top + 'px'\n  overlayEl.style.left = position.left + 'px'\n\n  overlayEl.style.height = container.offsetHeight + 'px'\n  overlayEl.style.width = container.offsetWidth + 'px'\n\n  overlayEl.setAttribute('data-overlay', true)\n  overlayEl.style.pointerEvents = 'none';\n  container.appendChild(overlayEl)\n}\n\nfunction hide(container, overlayEl) {\n  if (container.contains(overlayEl)) container.removeChild(overlayEl)\n}\n\nfunction getOverlay(container) {\n  var els = document.querySelectorAll('[data-overlay=true]')\n  for (var i = 0; i < els.length; i++) {\n    if (container.contains(els[i])) return els[i]\n  }\n  return null\n}\n\n//@ sourceURL=overlay/index.js"
));
require.alias("timoxley-offset/index.js", "overlay/deps/offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("timoxley-assert/index.js", "timoxley-dom-support/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");


require.alias("timoxley-element-selector/index.js", "overlay/deps/element-selector/index.js");
require.alias("component-classes/index.js", "timoxley-element-selector/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-matches-selector/index.js", "timoxley-element-selector/deps/matches-selector/index.js");

require.alias("component-emitter/index.js", "timoxley-element-selector/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-domify/index.js", "overlay/deps/domify/index.js");

