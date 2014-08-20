'use strict';

var Page = require('bigpipe').Page;

Page.extend({
  path: '/',              // HTTP route we should respond to.
  view: './index.ejs',    // The base template we need to render.
  pagelets: {             // The pagelets that should be rendered.
    sparklet: require('../../').extend({
      fetch: function fetch(next) {
        next(undefined, [{
            "day":"2014-01-03",
            "downloads":124
          },{
            "day":"2014-01-04",
            "downloads":327
          },{
            "day":"2014-01-05",
            "downloads":389
          },{
            "day":"2014-01-06",
            "downloads":145
          },{
            "day":"2014-01-07",
            "downloads":101
          },{
            "day":"2014-01-08",
            "downloads":251
          },{
            "day":"2014-01-11",
            "downloads":13
          },{
            "day":"2014-01-15",
            "downloads":1
          },{
            "day":"2014-01-16",
            "downloads":138
          },{
            "day":"2014-01-17",
            "downloads":198
          },{
            "day":"2014-01-18",
            "downloads":200
          },{
            "day":"2014-01-19",
            "downloads":733
          },{
            "day":"2014-01-20",
            "downloads":278
          },{
            "day":"2014-01-21",
            "downloads":423
          },{
            "day":"2014-01-22",
            "downloads":621
          },{
            "day":"2014-01-23",
            "downloads":89
          },{
            "day":"2014-01-24",
            "downloads":129
          },{
            "day":"2014-01-25",
            "downloads":160
          },{
            "day":"2014-01-26",
            "downloads":183
          },{
            "day":"2014-01-27",
            "downloads":351
          },{
            "day":"2014-01-28",
            "downloads":871
          },{
            "day":"2014-01-29",
            "downloads":557
          },{
            "day":"2014-01-30",
            "downloads":351
          },{
            "day":"2014-01-31",
            "downloads":233
          },{
            "day":"2014-02-01",
            "downloads":461
          },{
            "day":"2014-02-02",
            "downloads":159
          },{
            "day":"2014-02-03",
            "downloads":299
          }].map(function (row) {
            return { date: row.day, value: row.downloads };
          })
        );
      }
    })
  }
}).on(module);
