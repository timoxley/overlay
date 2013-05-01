# Overlay

  Overlays for individual DOM elements.

## Installation

    $ component install timoxley/overlay

## Example

```html
<ul id="target">
  <li>Red</li>
  <li>Green</li>
  <li>Red</li>
  <li>Green</li>
  <li>Red</li>
  <li>Green</li>
</ul>
<div id="redOverlay"></div>
<div id="greenOverlay"></div>
```

```js
    var overlay = require('overlay')

    // grab some elements to use as overlays.
    var redOverlay = document.querySelector('#redOverlay')
    var greenOverlay = document.querySelector('#greenOverlay')

    // create an overlay over the first item
    var firstItem = document.querySelector('#target li:first-child')
    var firstItemOverlay = overlay(redOverlay, firstItem)

    // create groups of overlays
    var oddItems = document.querySelectorAll('#target li:nth-child(odd)')
    var evenItems = document.querySelectorAll('#target li:nth-child(even)')

    var redGroup = overlay(redOverlay, oddItems)
    var greenGroup = overlay(greenOverlay, evenItems)

    setTimeout(function() {
      redGroup.hide()
      greenGroup.show()
    }, 1000)

```

[Demo](http://timoxley.github.com/overlay/examples/overlay/)

## License

  MIT
