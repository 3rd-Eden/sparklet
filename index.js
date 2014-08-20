'use strict';

var Pagelet = require('pagelet');

Pagelet.extend({
  view: 'view.html',
  css:  'css.styl',
  js:   'client.js',

  dependencies: [
    '//code.jquery.com/jquery-2.1.0.min.js',
    '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.js'
  ],

  /**
   * Format that is needed to parse the incoming data's date.
   *
   * @see https://github.com/mbostock/d3/wiki/Time-Formatting#format
   * @type {String}
   * @public
   */
  format: '%Y-%m-%d',

  /**
   * The colors that we need to use to create the color range/gradient.
   *
   * @type {Array}
   * @public
   */
  gradient: ['#E86E6B', '#E86E6C', '#FCD56B', '#59D1BA', '#59D1BB', '#A5D36E'],

  /**
   * The values from the received data that need to be exposed to the client.
   *
   * @type {Array}
   * @private
   */
  query: ['format', 'gradient', 'rows'],

  /**
   * Which functions can be exposed to the client.
   *
   * @type {Array}
   * @private
   */
  rpc: ['lazyload'],

  /**
   * RPC: Lazy load the graph data.
   *
   * @param {Function} reply Completion callback.
   * @api private
   */
  lazyload: function lazyload(reply) {
    if (!this.fetch) return reply(undefined, []);
    this.fetch(reply);
  },

  /**
   * The actual renderer of pagelet. It supplies all the data for the client.
   *
   * @param {Function} output Output the data once done.
   * @api private
   */
  get: function get(output) {
    var data = {
          gradient: this.gradient,
          format: this.format,
          xaxis: this.xaxis,
          yaxis: this.yaxis,
          x: this.x,
          y: this.y,
          rows: []
        }
      , pagelet = this;

    //
    // If we do not have a dedicated fetch function (can be added when pagelet is
    // extended) we're just going to assume that the graph needs to be lazy
    // loaded once interaction has been made with the minimized mode.
    //
    if (!this.fetch) return output(undefined, data);

    this.fetch(function fetched(err, rows) {
      if (err) return output(err);

      data.rows = rows || data.rows;
      return output(err, data);
    });
  }
}).on(module);
