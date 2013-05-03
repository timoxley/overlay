module.exports = Overlay

var raf = require('raf')
var Emitter = require('emitter')

/**
 * Create an overlay over the page.
 *
 * @api private
 */

function Overlay(el, target) {
  this.target = target
  var self = this
  this.el = el

  // make these adjustments on init only
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
  this.style.display = 'block'
  return this
}

Overlay.prototype.hide = function hide() {
  this.style.display = 'none'
  return this
}

function stretch(el, target) {
  var pos = target.getBoundingClientRect()
  el.style.position = 'fixed'
  el.style.zIndex = 999999 // ew.

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
