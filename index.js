"use strict"

var raf = require('raf')

var overlays = []

/**
 * Convenience method.
 * Find or create an Overlay for `template`,
 * and add `target` to overlay, and return overlay.
 */

module.exports = function(template, target) {
  var overlay = findOrCreateOverlay(template)
  if (target) overlay.addTarget(target)
  return overlay
}

module.exports.element = module.exports

/**
 * Create an overlay over the current page.
 */

module.exports.page = function(template) {
  var overlay = findOrCreateOverlay(template)
  overlay.addTarget(document.body.parentElement)
  return overlay
}

/**
 * Create an overlay.
 */

function Overlay(template) {
  this.template = template
  this.targets = []
  this.container = document.createElement('div')
  document.body.appendChild(this.container)
  stretch(this.container, document.body)
  this.container.style.pointerEvents = 'none';
}

/**
 * Show overlay container.
 */

Overlay.prototype.show = function show() {
  this.container.style.display = 'block'
  return this
}

/**
 * Hide overlay container.
 */

Overlay.prototype.hide = function show() {
  this.container.style.display = 'none'
  return this
}

/**
 * Render overlays for each target.
 */
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


/**
 * Add an overlay target. Next `render` call will draw an
 * overlay over the target element.
 */

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

/**
 * Remove overlay target. Removes from container immediately.
 */

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


/**
 * Reference to an element to draw an overlay on top of.
 */

function Target(targetEl) {
  this.target = targetEl
}

/**
 * Function used to compare two targets.
 */

Target.prototype.equals = function(t) {
  return this.target === t.target
}

/**
 * Stretch an overlay element (`this.el`) over this target.
 */

Target.prototype.stretch = function() {
  stretch(this.el, this.target)
  return this
}

/**
 * Find the overlay matching this `template`,
 * or create a new Overlay for the template.
 */

function findOrCreateOverlay(template) {
  var foundOverlay = findOverlay(template)
  if (foundOverlay) return foundOverlay
  var overlay = new Overlay(template)
  overlays.push(overlay)
  return overlay
}

/**
 * Find the overlay matching this `template`.
 */

function findOverlay(template) {
  var foundOverlay = overlays.filter(function(overlay) {
    return overlay.template == template
  })
  if (!foundOverlay.length) return undefined
  return foundOverlay[0]
}

/**
 * Render every overlay. This is the draw loop.
 */

function draw() {
  overlays.forEach(function(overlay) {
    overlay.render()
  })
  raf(draw)
}

draw()

/**
 * Stretch an `el` over `target`.
 */

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
