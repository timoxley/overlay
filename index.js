"use strict"

var Overlay = require('./overlay')

module.exports = function(template, target) {
  if (target instanceof NodeList) return new Group(template, target)
  return module.exports.element(template, target)
}

module.exports.Group = Group
function Group(template, targets) {
  var self = this
  this.containerOverlay = new Container()
  this.overlays = [].slice.call(targets).map(function(target) {
    return new ElementOverlay(self.containerOverlay, template.cloneNode(), target)
  })
  this.show()
}

Group.prototype.show = function show() {
  this.overlays.forEach(function(overlay) {
    overlay.show()
  })
  return this
}

Group.prototype.hide = function hide() {
  this.overlays.forEach(function(overlay) {
    overlay.hide()
  })
  return this
}

function makeDiv() {
  var el = document.createElement('div')
  document.body.appendChild(el)
  return el
}



/**
 * Page Overlay. Element sits over whole page. e.g. lightbox
 * @param template {Element} template to use for wrapper. Optional.
 */

function PageOverlay(template) {
  if (!template) template = makeDiv()
  var htmlEl = document.body.parentElement // html el not likely to have margins etc
  Overlay.call(this, template, htmlEl)
}

PageOverlay.prototype = Object.create(Overlay.prototype)

module.exports.page = function(template) {
  return new PageOverlay(template)
}

module.exports.PageOverlay = PageOverlay


function Container(template) {
  if (!(this instanceof Container)) return new Container(template)
  PageOverlay.call(this, template)
  this.el.style.pointerEvents = 'none';
  var self = this
}

Container.prototype = Object.create(PageOverlay.prototype)
module.exports.Container = Container


module.exports.element = module.exports.ElementOverlay = ElementOverlay

function ElementOverlay(containerOverlay, template, target) {
  if (!(this instanceof ElementOverlay)) return new ElementOverlay(containerOverlay, template, target)
  if (arguments.length === 2 || target == null) {
    target = template
    template = containerOverlay
    containerOverlay = new Container()
  }
  if (!template) template = makeDiv()
  Overlay.call(this, template, target)
  containerOverlay.el.appendChild(this.el)
}
ElementOverlay.prototype = Object.create(Overlay.prototype)
