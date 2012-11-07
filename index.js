module.exports = function(container, inlayEl) {
	if (!inlayEl) inlayEl = getInlay(container)
	return new Inlay(container, inlayEl)
}

function Inlay(container, inlayEl) {
	this.container = container
	this.inlayEl = inlayEl
	this.show = show.bind(this, this.container, this.inlayEl)
	this.hide = hide.bind(this, this.container, this.inlayEl)
}

function show(container, inlayEl) {
	if (!container || !inlayEl) return
	inlayEl.style.position = 'absolute'
	inlayEl.style.top = container.offsetTop
	inlayEl.style.height = container.offsetHeight
	inlayEl.style.left = container.offsetLeft
	inlayEl.style.width = container.offsetWidth
	inlayEl.setAttribute('data-inlay', true)
	inlayEl.style.pointerEvents = 'none';
	container.appendChild(inlayEl)
}

function hide(container, inlayEl) {
	if (container.contains(inlayEl)) container.removeChild(inlayEl)
}

function getInlay(container) {
	var els = document.querySelectorAll('[data-inlay=true]')
	for (var i = 0; i < els.length; i++) {
		if (container.contains(els[i])) return els[i]
	}
	return null
}

