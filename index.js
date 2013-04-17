"use strict"

module.exports = Overlay

function Overlay(el, overlayEl) {
  if (!(this instanceof Overlay)) return new Overlay(el, overlayEl)
  this.el = el
  if (!overlayEl) overlayEl = findOverlay(el)
  this.overlayEl = overlayEl
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
  this.container = this.el.offsetParent
  this.container.appendChild(this.overlayEl)

  return this
}

/**
 * Hide overlay.
 *
 * @return {Overlay} for chaining
 * @api public
 */

Overlay.prototype.hide = function hide() {
  this.overlayEl.parentElement.removeChild(this.overlayEl)
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

  // set styling
  overlay.style.position = 'absolute'
  overlay.style.top = el.offsetTop + 'px'
  overlay.style.height = el.offsetHeight + 'px'
  overlay.style.left = el.offsetLeft + 'px'
  overlay.style.width = el.offsetWidth + 'px'
  overlay.setAttribute('data-overlay', true)
  overlay.style.pointerEvents = 'none';

  return this
}

/**
 * Try find the overlay for the target element.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Mixed}
 */

function findOverlay(el, selector) {
  selector = selector || '[data-overlay]'
  return el.offsetParent.querySelector(selector)
}

