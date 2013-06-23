"use strict"

var raf = require('raf')

var overlays = []

module.exports = function(template, target) {
  var overlay = findOrCreateOverlay(template)
  if (target) overlay.addTarget(target)
  return overlay
}

module.exports.element = module.exports

module.exports.page = function(template) {
  var overlay = findOrCreateOverlay(template)
  overlay.addTarget(document.body.parentElement)
  return overlay
}

/**
 * Creates 
 */
function Overlay(template) {
  this.template = template
  this.targets = []
  this.container = document.createElement('div')
  document.body.appendChild(this.container)
  stretch(this.container, document.body)
  this.container.style.pointerEvents = 'none';
}

Overlay.prototype.show = function show() {
  this.container.style.display = 'block'
  return this
}

Overlay.prototype.hide = function show() {
  this.container.style.display = 'none'
  return this
}

Overlay.prototype.render = function() {
  var self = this
  this.targets.forEach(function(target) {
    if (!target.el) {
      target.el = self.template.cloneNode(true)
      self.container.appendChild(target.el)
    }
    target.stretch()
  })
}

Overlay.prototype.addTarget = function(targetEl) {
  var self = this
  if (targetEl instanceof NodeList) {
    [].slice.call(targetEl).forEach(function(el) {
      self.addTarget(el)
    })
    return this
  }
  var foundTarget = this.targets.reduce(function(result, target) {
    if (target.target == targetEl) result = target
    return result
  }, undefined)
  if (!foundTarget) this.targets.push(new Target(targetEl))
  return this
}

Overlay.prototype.removeTarget = function(targetEl) {
  var self = this
  if (targetEl instanceof NodeList) {
    [].slice.call(targetEl).forEach(function(el) {
      self.removeTarget(el)
    })
    return this
  }
  this.targets.reduce(function(result, target) {
    // find matching targets
    if (target.target == targetEl) return result.concat(target)
    return result
  }, []).forEach(function(target) {
    //remove them
    self.targets.splice(self.targets.indexOf(target), 1)
    target.el && self.container.removeChild(target.el)
  })
  return this
}

function Target(targetEl) {
  this.target = targetEl
}

Target.prototype.equals = function(t) {
  return this.target === t.target
}

Target.prototype.stretch = function() {
  stretch(this.el, this.target)
  return this
}

function findOrCreateOverlay(template) {
  var foundOverlay = findOverlay(template)
  if (foundOverlay) return foundOverlay
  var overlay = new Overlay(template)
  overlays.push(overlay)
  return overlay
}

function findOverlay(template) {
  var foundOverlay = overlays.filter(function(overlay) {
    return overlay.template == template
  })
  if (!foundOverlay.length) return undefined
  return foundOverlay[0]
}

function draw() {
  draw.drawing = true
  overlays.forEach(function(overlay) {
    overlay.render()
  })
  raf(draw)
}
draw()

function stretch(el, target) {
  var pos = target.getBoundingClientRect()
  el.style.position = 'fixed'

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
