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
	overlayEl.style.top = container.offsetTop
	overlayEl.style.height = container.offsetHeight
	overlayEl.style.left = container.offsetLeft
	overlayEl.style.width = container.offsetWidth
	overlayEl.setAttribute('data-overlay', true)
	overlayEl.style.pointerEvents = 'none';
	container.appendChild(overlayEl)
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

