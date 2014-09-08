pipe.once('sparklet:initialize', function initialize(pagelet) {
  'use strict';

  /**
   * Create the client-side sparklets.
   *
   * Options:
   *
   * - x: X margin.
   * - y: Y margin.
   * - xaxis: Add xaxis.
   * - yaxis: Add yaxis.
   *
   * @constructor
   * @param {HTMLElement} element DOM element where the graph should be placed.
   * @param {Array} rows Data to display in the graph.
   * @param {Object} options Configuration.
   * @api private
   */
  function Sparklet(element, rows, options) {
    if (!this) return new Spark(element, rows, options);

    var $el = $(element).find('.sparklet');

    options = options || {};
    options.x = pagelet.data.x || 30;
    options.y = pagelet.data.y || 20;
    options.yaxis = pagelet.data.yaxis || false;
    options.xaxis = pagelet.data.xaxis || false;

    this.formatter = d3.time.format(pagelet.data.format);
    this.placeholder = d3.select($el[0]).append('div');
    this.rows = this.prep(rows);

    this.$ = $el;
    this.options = options;
    this.id = Sparklet.id++;
    this.width = $el.width();
    this.height = $el.height();
    this.margin = {
      x: options.x,
      y: options.y
    };

    this.calculate().render();
  }

  /**
   * Unique id per sparklet.
   *
   * @type {Number}
   * @private
   */
  Sparklet.id = 0;

  /**
   * Prepare the data structure by ensuring that we have valid date objects and
   * values for the graph.
   *
   * @param {Array} rows Data to display.
   * @returns {Array} mapped rows.
   * @api private
   */
  Sparklet.prototype.prep = function prep(rows) {
    var spark = this;

    /**
     * Simply map all the values.
     *
     * @param {Object} row The row of the dataset.
     * @returns {Number} The value.
     * @api private
     */
    function values(row) {
      return +row.value;
    }

    //
    // Make sure that we have at last one single data point. If we don't have
    // any data assume it's missing and start with 0.
    //
    if (!rows.length) {
      rows.push({ value: 0, date: spark.formatter(new Date) });
    }

    this.min = d3.min(rows, values);
    this.max = d3.max(rows, values);

    var percentage = d3.scale.linear().domain([ this.min, this.max ]).range([0, 100]);

    return rows.map(function map(row) {
      return {
        percentage: percentage(+row.value).toFixed(2),
        date: spark.formatter.parse(row.date),
        value: +row.value
      };
    });
  };

  /**
   * Calculate the different sizes and margins so we can render the sparkline
   * correctly.
   *
   * @returns {Sparklet}
   * @api private
   */
  Sparklet.prototype.calculate = function calculate() {
    var margin = 100 / this.rows.length;

    this.y = d3.scale.linear().domain([0, 100]).range([
      this.height - this.margin.y, this.margin.y
    ]);

    this.x = d3.scale.linear().domain(d3.extent(this.rows, function extent(row) {
      return row.date;
    })).range([this.margin.x, this.width - this.margin.y ]);

    this.gradient = d3.scale.linear().domain([0, 5, 25, 40, 75, 100]).range(
      pagelet.data.gradient
    );

    this.percentage = d3.scale.linear().domain([0, this.rows.length - 1]).range([
      margin, 100 - margin
    ]);

    return this;
  };

  /**
   * Render the Sparkline in the dom elements.
   *
   * @api private
   */
  Sparklet.prototype.render = function render() {
    var sparkline = this;

    var visual = this.placeholder
      .append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height);

    var group = visual.append('svg:g')
      .attr('stroke', 'url(#sparkline-gradient-'+ this.id +')')
      .attr('fill', 'url(#sparkline-gradient-'+ this.id +')');

    var line = d3.svg.line()
      .interpolate('cardinal')
      .x(function render(row) {
        return sparkline.x(row.date);
      })
      .y(function render(row) {
        return sparkline.y(row.percentage);
      });

    //
    // Optionally add the xAxis
    //
    if (this.options.xaxis) {
      var x = visual.append('svg:g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,'+ (this.height - this.margin.y) +')')
        .call(
          d3.svg.axis()
            .scale(this.x)
            .orient('bottom')
            .ticks(5)
            .tickSize(-this.height +(this.margin.y * 2), 0, 0)
            .tickFormat(function render(epoch) {
              return d3.time.format('%d %b')(new Date(epoch));
            })
        );

      x.selectAll('text')
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(0,5)')
        .attr('stroke-width', '0');
    }

    //
    // Optionally add the yAxis
    //
    if (this.options.yaxis) {
      var percentage = d3.scale.linear().domain([0, 100]).range([this.min, this.max]);

      var y = visual.append('svg:g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate('+ this.margin.x +',0)')
        .attr('stroke', 'white')
        .call(
          d3.svg.axis()
            .scale(this.y)
            .orient('left')
            .ticks(4)
            .tickSize(-this.width +(this.margin.x * 2), 0, 0)
            .tickFormat(function render(amount) {
              return percentage(amount);
            })
        );

      y.selectAll('line')
        .style('stroke-dasharray', '3, 3');

      y.selectAll('text')
        .style('text-anchor', 'start')
        .attr('transform', 'translate(3,12)')
        .attr('fill', 'white')
        .attr('stroke-width', '0');
    }

    //
    // Add points to the ends of the spark lines.
    //
    group.selectAll('.point')
      .data(this.rows)
      .enter().append('svg:circle')
      .attr('class', function render(row, index) {
        return (index === (sparkline.rows.length - 1) || index === 0)
          ? 'point end'
          : 'point';
      })
      .attr('cx', function render(row) {
        return sparkline.x(row.date);
      })
      .attr('cy', function render(row) {
        return sparkline.y(row.percentage);
      })
      .attr('r',  function render(row, index) {
        return (index === (sparkline.rows.length - 1) || index === 0) ? 5 : 3;
      });

    group.append('svg:path').attr('d', line(this.rows));

    //
    // Add points for every row in spark line.
    //
    for (var i = 0, l = this.rows.length, tip; i < l; i++) {
      this.placeholder
        .append('div')
        .attr('class', 'chart-tooltip')
        .attr('data-index', i)
        .html(this.rows[i].value);

      tip = $('.chart-tooltip[data-index="'+ i +'"');
      tip.css({
        left: (this.x(this.rows[i].date) - (tip.width() / 2)) +'px',
        top: (this.y(this.rows[i].percentage) - 30) + 'px'
      });
    }

    //
    // Add gradient.
    //
    visual
      .append('svg:defs')
      .append('svg:linearGradient')
        .attr('id', 'sparkline-gradient-'+ this.id)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr("y2", '0%')
        .attr('gradientUnits', 'userSpaceOnUse')
        .selectAll('.gradient-stop')
        .data(this.rows)
        .enter()
        .append('svg:stop').attr('offset', function render(row, i) {
          return sparkline.percentage(i) +'%';
        }).attr('style', function render(row) {
          return 'stop-color:' + sparkline.gradient(row.percentage) + ';stop-opacity:1';
        });

    //
    // And finally create larger invisible hit zones so you don't have to :hover
    // the line to trigger a tooltip.
    //
    group.selectAll('.bar-rect')
      .data(this.rows)
      .enter()
      .append('svg:rect')
      .attr('class', 'bar-rect')
      .attr('x', function render(row) {
        return sparkline.x(row.date) - (sparkline.width / sparkline.rows.length / 2);
      })
      .attr('y', 0)
      .attr('width', this.width / this.rows.length)
      .attr('height', this.height)
      .on('mouseenter', function hover(row, index) {
        sparkline.$.find('.chart-tooltip[data-index="'+ index +'"]').addClass('hover');

        $(this)
          .parent()
          .parent()
          .find('.point:eq('+ index +')')
          .attr('class', index === 0 || index === (sparkline.rows.length -1)
              ? 'end point hover'
              : 'point hover'
          );
      })
      .on('mouseleave', function(row, index) {
        sparkline.$.find('.chart-tooltip').removeClass('hover');
        $(this)
          .parent()
          .parent()
          .find('.point:eq('+ index +')')
          .attr('class', index === 0 || index === (sparkline.rows.length - 1)
            ? 'end point'
            : 'point'
          );
      });

    return this;
  };

  $(pagelet.placeholders).each(function each() {
    var spark = new Sparklet(this, pagelet.data.rows);
  });
});
