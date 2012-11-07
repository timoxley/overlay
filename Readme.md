# inlay

  Like an overlay, but overlaid on a particular DOM element.

## Installation

    $ component install timoxley/inlay

## Example

```js

var domify = require('component-domify')
var inlay = require('inlay')
var overlay = domify('<div class="inlay"><i class="icon icon-pencil"></i></div>')

var elementSelector = ElementSelector({
  selector: "#container *"
}).on('highlight', function(el) {
  inlay(el, overlay).show() // create overlay
}).on('dehighlight', function(el) {
  inlay(el).hide() // hide overlay
})
```

## License

  MIT
