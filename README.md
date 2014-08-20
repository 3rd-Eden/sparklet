# Sparklet

Sparklet is a spark-line/graph pagelet for the BigPipe framework. It's highly
customizable by simply extending and remixing the pagelet.

## Installation

The `sparklet` module is released in the public npm registry and can be added to
your package using: 

```
npm install --save sparklet
```

## Usage

```js
'use strict';

var Sparklet = require('sparklet');
```

By default, the `sparklet` has no data to show. You need to extend the `Sparklet`
instance and a `fetch` method which receives one argument which is a callback
function.

```js
var mysparklet = Sparklet.extend({
  fetch: function fetch(next) {
    asyncoperation(function (err, data) {
      next(err, data);
    });
  }
})
```

The data that you pass in the `next` function should be an array of objects.
These objects should have a `date` and `value` key. By default we assume that
you provide the date in a `YYYY-MM-DD` format. If your using a different format
either change it using a `.map` operation on your array or change the `format`
property on the pagelet:

```js
Sparklet.extend({
  format: '%d-%m-%Y'
})
```

Anything that D3's time/date formatter accepts can be used here.

## License

MIT
