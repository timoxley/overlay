"use strict"

module.exports = Overlay

function Overlay(el, overlayEl) {
  if (!(this instanceof Overlay)) return new Overlay(el, overlayEl)
  this.el = el
  this.container = this.el.ownerDocument.body
  this.overlayContainer = this.findOverlayContainer()
  if (!this.overlayContainer) {
    this.overlayContainer = this.createOverlayContainer()
  }

  if (!overlayEl) overlayEl = this.findOverlay()
  this.overlayEl = overlayEl
  if (!this.overlayContainer.contains(this.overlayEl)) this.overlayContainer.appendChild(this.overlayEl)
}

/**
 * Display the overlay over the el.
 *
 * @return {Overlay} for chaining
 * @api public
 */

Overlay.prototype.show = function show() {
  if (!this.el || !this.overlayEl) return

  this.positionOverlay()

  // attach to parent
  if (!this.container.contains(this.overlayContainer)) this.container.appendChild(this.overlayContainer)

  return this
}

/**
 * Hide overlay.
 *
 * @return {Overlay} for chaining
 * @api public
 */

Overlay.prototype.hide = function hide() {
  if (this.container.contains(this.overlayContainer)) this.container.removeChild(this.overlayContainer)
  return this
}

/**
 * Inherit dimensions and position of target element.
 *
 * @return {Overlay} for chaining
 * @api private
 */

Overlay.prototype.positionOverlay = function positionOverlay() {
  var el = this.el
  var overlay = this.overlayEl
  var pos = this.el.getBoundingClientRect()
  // set styling
  overlay.style.position = 'absolute'
  overlay.style.top = this.container.scrollTop + pos.top + 'px'
  overlay.style.height = pos.height + 'px'
  overlay.style.left = pos.left + 'px'
  overlay.style.width = pos.width + 'px'
  overlay.setAttribute('data-overlay', true)
  overlay.style.pointerEvents = 'none';

  return this
}


/**
 * Try find the overlay container.
 *
 * @return {Mixed} Overlay container or null
 * @api private
 */

Overlay.prototype.findOverlayContainer = function findOverlayContainer() {
  return this.container.querySelector('[data-overlay-container]')
}

/**
 * Create an overlay container.
 *
 * @return {Element} Overlay container
 * @api private
 */

Overlay.prototype.createOverlayContainer = function createOverlayContainer() {
  var doc = this.container.ownerDocument || document
  var overlayContainer = doc.createElement('div')
  overlayContainer.style.display = 'absolute'
  overlayContainer.style.top = 0
  overlayContainer.style.bottom = 0
  overlayContainer.style.left = 0
  overlayContainer.style.right = 0
  overlayContainer.style.pointerEvents = 'none';
  overlayContainer.setAttribute('data-overlay-container', true)
  return overlayContainer
}

/**
 * Try find the overlay for the target element.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Mixed}
 * @api private
 */


Overlay.prototype.findOverlay = function findOverlay(el, selector) {
  selector = selector || '[data-overlay]'

  var overlayEl = this.overlayContainer.querySelector(selector)
  if (!overlayEl) overlayEl = this.el.querySelector(selector)
  return overlayEl
}
