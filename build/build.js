
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
require.register("component-raf/index.js", Function("exports, require, module",
"\nmodule.exports = window.requestAnimationFrame\n  || window.webkitRequestAnimationFrame\n  || window.mozRequestAnimationFrame\n  || window.oRequestAnimationFrame\n  || window.msRequestAnimationFrame\n  || fallback;\n\nvar prev = new Date().getTime();\nfunction fallback(fn) {\n  var curr = new Date().getTime();\n  var ms = Math.max(0, 16 - (curr - prev));\n  setTimeout(fn, ms);\n  prev = curr;\n}\n//@ sourceURL=component-raf/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));

require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\nfunction one(selector, el) {\n  return el.querySelector(selector);\n}\n\nexports = module.exports = function(selector, el){\n  el = el || document;\n  return one(selector, el);\n};\n\nexports.all = function(selector, el){\n  el = el || document;\n  return el.querySelectorAll(selector);\n};\n\nexports.engine = function(obj){\n  if (!obj.one) throw new Error('.one callback required');\n  if (!obj.all) throw new Error('.all callback required');\n  one = obj.one;\n  exports.all = obj.all;\n};\n//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar query = require('query');\n\n/**\n * Element prototype.\n */\n\nvar proto = Element.prototype;\n\n/**\n * Vendor function.\n */\n\nvar vendor = proto.matchesSelector\n  || proto.webkitMatchesSelector\n  || proto.mozMatchesSelector\n  || proto.msMatchesSelector\n  || proto.oMatchesSelector;\n\n/**\n * Expose `match()`.\n */\n\nmodule.exports = match;\n\n/**\n * Match `el` to `selector`.\n *\n * @param {Element} el\n * @param {String} selector\n * @return {Boolean}\n * @api public\n */\n\nfunction match(el, selector) {\n  if (vendor) return vendor.call(el, selector);\n  var nodes = query.all(selector, el.parentNode);\n  for (var i = 0; i < nodes.length; ++i) {\n    if (nodes[i] == el) return true;\n  }\n  return false;\n}\n//@ sourceURL=component-matches-selector/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n  module.exports = require('./lib/debug');\n} else {\n  module.exports = require('./debug');\n}\n//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n/**\n * Expose `debug()` as the module.\n */\n\nmodule.exports = debug;\n\n/**\n * Create a debugger with the given `name`.\n *\n * @param {String} name\n * @return {Type}\n * @api public\n */\n\nfunction debug(name) {\n  if (!debug.enabled(name)) return function(){};\n\n  return function(fmt){\n    fmt = coerce(fmt);\n\n    var curr = new Date;\n    var ms = curr - (debug[name] || curr);\n    debug[name] = curr;\n\n    fmt = name\n      + ' '\n      + fmt\n      + ' +' + debug.humanize(ms);\n\n    // This hackery is required for IE8\n    // where `console.log` doesn't have 'apply'\n    window.console\n      && console.log\n      && Function.prototype.apply.call(console.log, console, arguments);\n  }\n}\n\n/**\n * The currently active debug mode names.\n */\n\ndebug.names = [];\ndebug.skips = [];\n\n/**\n * Enables a debug mode by name. This can include modes\n * separated by a colon and wildcards.\n *\n * @param {String} name\n * @api public\n */\n\ndebug.enable = function(name) {\n  try {\n    localStorage.debug = name;\n  } catch(e){}\n\n  var split = (name || '').split(/[\\s,]+/)\n    , len = split.length;\n\n  for (var i = 0; i < len; i++) {\n    name = split[i].replace('*', '.*?');\n    if (name[0] === '-') {\n      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n    }\n    else {\n      debug.names.push(new RegExp('^' + name + '$'));\n    }\n  }\n};\n\n/**\n * Disable debug output.\n *\n * @api public\n */\n\ndebug.disable = function(){\n  debug.enable('');\n};\n\n/**\n * Humanize the given `ms`.\n *\n * @param {Number} m\n * @return {String}\n * @api private\n */\n\ndebug.humanize = function(ms) {\n  var sec = 1000\n    , min = 60 * 1000\n    , hour = 60 * min;\n\n  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n  if (ms >= sec) return (ms / sec | 0) + 's';\n  return ms + 'ms';\n};\n\n/**\n * Returns true if the given mode name is enabled, false otherwise.\n *\n * @param {String} name\n * @return {Boolean}\n * @api public\n */\n\ndebug.enabled = function(name) {\n  for (var i = 0, len = debug.skips.length; i < len; i++) {\n    if (debug.skips[i].test(name)) {\n      return false;\n    }\n  }\n  for (var i = 0, len = debug.names.length; i < len; i++) {\n    if (debug.names[i].test(name)) {\n      return true;\n    }\n  }\n  return false;\n};\n\n/**\n * Coerce `val`.\n */\n\nfunction coerce(val) {\n  if (val instanceof Error) return val.stack || val.message;\n  return val;\n}\n\n// persist\n\nif (window.localStorage) debug.enable(localStorage.debug);\n//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("timoxley-element-selector/index.js", Function("exports, require, module",
"\"use strict\"\n\nvar debug = require('debug')('element-selector')\n\nvar Emitter = require('emitter')\nvar classes = require('classes')\nvar matchesSelector = require('matches-selector')\nvar DEFAULT_SELECTOR = 'body *'\nvar DEFAULT_INVALID_SELECTOR = ''\nvar DEFAULT_HIGHLIGHTED_CLASS = 'highlighted'\nvar DEFAULT_SELECTED_CLASS = 'selected'\nvar DEFAULT_SELECT_EVENT = 'click'\nvar DEFAULT_PREFIX_CLASS = 'element-selector'\nvar DEFAULT_ROOT_ELEMENT = document.body\n\nvar DEFAULT_ENABLED = false\nvar DEFAULT_USE_STYLES = true\n\nfunction ElementSelector(options) {\n  if (!(this instanceof ElementSelector)) return new ElementSelector(options)\n\n  options = options || {}\n  this.selector = options.selector || DEFAULT_SELECTOR\n  this.invalidSelector = options.invalidSelector || DEFAULT_INVALID_SELECTOR\n\n  this.highlightedClass = options.highlightedClass || DEFAULT_HIGHLIGHTED_CLASS\n\n  this.selectedClass = options.selectedClass || DEFAULT_SELECTED_CLASS\n\n  this.selectEvent = options.selectEvent || DEFAULT_SELECT_EVENT\n\n  this.prefixClass = options.prefixClass || DEFAULT_PREFIX_CLASS\n\n  this.useDefaultStyles = options.useDefaultStyles != null ? options.useDefaultStyles : DEFAULT_USE_STYLES\n\n  this.root = options.root || DEFAULT_ROOT_ELEMENT\n\n  this.enabled = options.enabled != null // Likely a Boolean\n    ? !!options.enabled\n    : DEFAULT_ENABLED\n\n  this.highlighted = undefined\n\n  bus.on('mouseover', this.highlight.bind(this))\n  bus.on(this.selectEvent, this.select.bind(this))\n\n  this.enabled ? this.enable() : this.disable()\n}\n\n\nElementSelector.prototype.matches = function matches(el) {\n  return !! el && matchesSelector(el, this.selector) &&\n         !(this.invalidSelector && matchesSelector(el, this.invalidSelector))\n}\n\nElementSelector.prototype.disable = function disable() {\n  debug('disable')\n  this.deselect()\n  this.dehighlight()\n  this.enabled = false\n  return this\n}\n\nElementSelector.prototype.enable = function enable() {\n  debug('enable')\n  this.enabled = true\n  if (!this.useDefaultStyles) return this\n  classes(this.root).add(this.prefixClass)\n  return this\n}\n\nElementSelector.prototype.highlight = function highlight(el, e) {\n  if (!this.enabled) return this\n  if (this.matches(el)) {\n    if (this.highlighted && this.highlighted !== el) this.dehighlight(this.highlighted)\n    classes(el).add(this.highlightedClass)\n    this.highlighted = el\n    debug('highlight', el, e)\n    this.emit('highlight', el, e)\n  }\n  return this\n}\n\nElementSelector.prototype.dehighlight = function dehighlight() {\n  if (!this.enabled || !this.highlighted) return this\n  var el = this.highlighted\n  classes(el).remove(this.highlightedClass)\n  this.highlighted = null\n  debug('dehighlight', el)\n  this.emit('dehighlight', el)\n  return this\n}\n\nElementSelector.prototype.select = function select(el, e) {\n  if (!this.enabled) return this\n  if (this.matches(el)) {\n    this.deselect()\n    this.dehighlight()\n    classes(el).add(this.selectedClass)\n    this.selected = el\n    debug('select', el, e)\n    this.emit('select', el, e)\n  }\n}\n\nElementSelector.prototype.deselect = function deselect() {\n  if (!this.enabled || !this.selected) return this\n  var el = this.selected\n  this.dehighlight()\n  classes(el).remove(this.selectedClass)\n  this.selected = null\n  this.emit('deselect', el)\n  this.emit('deselect', el)\n  return this\n}\n\nEmitter(ElementSelector.prototype)\n\n/**\n * Global bus for listening to mouse events.\n */\n\nvar bus = new Emitter()\n\nfunction initializeEvents() {\n  if (initializeEvents.complete) return\n  document.addEventListener('mouseover', function(e) {\n    bus.emit('mouseover', e.target, e)\n  })\n  document.addEventListener('mouseout', function(e) {\n    bus.emit('mouseout', e.target, e)\n  })\n  document.addEventListener('click', function(e) {\n    bus.emit('click', e.target, e)\n  })\n  document.addEventListener('mouseup', function(e) {\n    bus.emit('mouseup', e.target, e)\n  })\n  document.addEventListener('mousedown', function(e) {\n    bus.emit('mousedown', e.target, e)\n  })\n  document.addEventListener('dblclick', function(e) {\n    bus.emit('dblclick', e.target, e)\n  })\n\n  initializeEvents.complete = true\n}\n\ninitializeEvents()\n\nmodule.exports = ElementSelector\n//@ sourceURL=timoxley-element-selector/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return [el.removeChild(el.lastChild)];\n  }\n  \n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  return orphan(el.children);\n}\n\n/**\n * Orphan `els` and return an array.\n *\n * @param {NodeList} els\n * @return {Array}\n * @api private\n */\n\nfunction orphan(els) {\n  var ret = [];\n\n  while (els.length) {\n    ret.push(els[0].parentNode.removeChild(els[0]));\n  }\n\n  return ret;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("overlay/index.js", Function("exports, require, module",
"\"use strict\"\n\nvar Overlay = require('./overlay')\n\nmodule.exports = function(template, target) {\n  if (target instanceof NodeList) return new Group(template, target)\n  return module.exports.element(template, target)\n}\n\nmodule.exports.Group = Group\nfunction Group(template, targets) {\n  var self = this\n  this.containerOverlay = new Container()\n  this.overlays = [].slice.call(targets).map(function(target) {\n    return new ElementOverlay(self.containerOverlay, template.cloneNode(), target)\n  })\n  this.show()\n}\n\nGroup.prototype.show = function show() {\n  this.overlays.forEach(function(overlay) {\n    overlay.show()\n  })\n  return this\n}\n\nGroup.prototype.hide = function hide() {\n  this.overlays.forEach(function(overlay) {\n    overlay.hide()\n  })\n  return this\n}\n\nfunction makeDiv() {\n  var el = document.createElement('div')\n  document.body.appendChild(el)\n  return el\n}\n\n\n\n/**\n * Page Overlay. Element sits over whole page. e.g. lightbox\n * @param template {Element} template to use for wrapper. Optional.\n */\n\nfunction PageOverlay(template) {\n  if (!template) template = makeDiv()\n  var htmlEl = document.body.parentElement // html el not likely to have margins etc\n  Overlay.call(this, template, htmlEl)\n}\n\nPageOverlay.prototype = Object.create(Overlay.prototype)\n\nmodule.exports.page = function(template) {\n  return new PageOverlay(template)\n}\n\nmodule.exports.PageOverlay = PageOverlay\n\n\nfunction Container(template) {\n  if (!(this instanceof Container)) return new Container(template)\n  PageOverlay.call(this, template)\n  this.el.style.pointerEvents = 'none';\n  var self = this\n}\n\nContainer.prototype = Object.create(PageOverlay.prototype)\nmodule.exports.Container = Container\n\n\nmodule.exports.element = module.exports.ElementOverlay = ElementOverlay\n\nfunction ElementOverlay(containerOverlay, template, target) {\n  if (!(this instanceof ElementOverlay)) return new ElementOverlay(containerOverlay, template, target)\n  if (arguments.length === 2 || target == null) {\n    target = template\n    template = containerOverlay\n    containerOverlay = new Container()\n  }\n  if (!template) template = makeDiv()\n  Overlay.call(this, template, target)\n  containerOverlay.el.appendChild(this.el)\n}\nElementOverlay.prototype = Object.create(Overlay.prototype)\n//@ sourceURL=overlay/index.js"
));
require.register("overlay/overlay.js", Function("exports, require, module",
"module.exports = Overlay\n\nvar raf = require('raf')\nvar Emitter = require('emitter')\n\n/**\n * Create an overlay over the page.\n *\n * @api private\n */\n\nfunction Overlay(el, target) {\n  this.target = target\n  var self = this\n  this.el = el\n\n  // make these adjustments on init only\n  this.el.style.position = 'fixed'\n  this.el.style.zIndex = 999999 // ew.\n  this.draw()\n}\n\nEmitter(Overlay.prototype)\n\nOverlay.prototype.draw = function draw() {\n  raf(draw.bind(this))\n  stretch(this.el, this.target)\n  this.emit('draw', this)\n  return this\n}\n\nOverlay.prototype.show = function show() {\n  this.oldParent && this.oldParent.appendChild(this.el)\n  return this\n}\n\nOverlay.prototype.hide = function hide() {\n  this.oldParent = this.el.parentElement\n  this.oldParent && this.oldParent.removeChild(this.el)\n  return this\n}\n\nfunction stretch(el, target) {\n  var pos = target.getBoundingClientRect()\n\n  // handles 'elastic' over-scrolling at top.\n  // TODO figure out how to detect over-scrolling\n  // at bottom and sides\n  el.style.top = document.body.scrollTop < 0\n   ? pos.top + document.body.scrollTop + 'px'\n   : pos.top + 'px'\n\n  el.style.bottom = pos.bottom + 'px'\n  el.style.left = pos.left + 'px'\n  el.style.right = pos.right + 'px'\n  el.style.height = pos.height + 'px'\n  el.style.width = pos.width + 'px'\n}\n//@ sourceURL=overlay/overlay.js"
));
require.alias("component-raf/index.js", "overlay/deps/raf/index.js");

require.alias("component-emitter/index.js", "overlay/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");


require.alias("timoxley-element-selector/index.js", "overlay/deps/element-selector/index.js");
require.alias("component-classes/index.js", "timoxley-element-selector/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-matches-selector/index.js", "timoxley-element-selector/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-emitter/index.js", "timoxley-element-selector/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("visionmedia-debug/index.js", "timoxley-element-selector/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "timoxley-element-selector/deps/debug/debug.js");

require.alias("component-domify/index.js", "overlay/deps/domify/index.js");

