"use strict"

module.exports = function(container, overlayEl) {
  if (!overlayEl) overlayEl = getOverlay(container)
  return new Overlay(container, overlayEl)
}

function Overlay(container, overlayEl) {
  this.container = container
  this.overlayEl = overlayEl
  this.show = show.bind(this, this.container, this.overlayEl)
  this.hide = hide.bind(this, this.container, this.overlayEl)
}

function show(container, overlayEl) {
  if (!container || !overlayEl) return
  overlayEl.style.position = 'absolute'
  overlayEl.style.top = container.offsetTop + 'px'
  overlayEl.style.height = container.offsetHeight + 'px'
  overlayEl.style.left = container.offsetLeft + 'px'
  overlayEl.style.width = container.offsetWidth + 'px'
  overlayEl.setAttribute('data-overlay', true)
  overlayEl.style.pointerEvents = 'none';
  container.offsetParent.appendChild(overlayEl)
}

function hide(container, overlayEl) {
  if (container.contains(overlayEl)) container.removeChild(overlayEl)
}

function getOverlay(container) {
  var els = document.querySelectorAll('[data-overlay=true]')
  for (var i = 0; i < els.length; i++) {
    if (container.contains(els[i])) return els[i]
  }
  return null
}

