module.exports = Overlay

var raf = require('raf')
var Emitter = require('emitter')

/**
 * Create an overlay over the page.
 *
 * @api private
 */

function Overlay(el, target) {
  //if (!(this instanceof Overlay)) return new Overlay(el, target)
  this.target = target
  var self = this
  this.el = el

  // make these adjustments on init only
  this.el.style.position = 'fixed'
  this.el.style.zIndex = 999999 // ew.
  this.draw()
}

Emitter(Overlay.prototype)

Overlay.prototype.draw = function draw() {
  raf(draw.bind(this))
  stretch(this.el, this.target)
  this.emit('draw', this)
  return this
}

Overlay.prototype.show = function show() {
  this.oldParent && this.oldParent.appendChild(this.el)
  return this
}

Overlay.prototype.hide = function hide() {
  this.oldParent = this.el.parentElement
  this.oldParent && this.oldParent.removeChild(this.el)
  return this
}

function stretch(el, target) {
  var pos = target.getBoundingClientRect()

  // handles 'elastic' over-scrolling at top.
  // TODO figure out how to detect over-scrolling
  // at bottom and sides
  el.style.top = document.body.scrollTop < 0
   ? pos.top + document.body.scrollTop + 'px'
   : pos.top + 'px'

  el.style.bottom = pos.bottom + 'px'
  el.style.left = pos.left + 'px'
  el.style.right = pos.right + 'px'
  el.style.height = pos.height + 'px'
  el.style.width = pos.width + 'px'
}
