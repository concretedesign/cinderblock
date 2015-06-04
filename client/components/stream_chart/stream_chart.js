Template.stream_chart.helpers({
  visible: function () {
    return Session.get('streamChartVisible') || false;
  },
  employeeId: function () {
    return Session.get('streamChartEmployeeId') || Employees.findOne()._id;
  },
  employees: function () {
    return Employees.find({});
  },
  isCurrentStream: function () {
    return Session.equals('streamChartEmployeeId', this._id) ? 'current' : '';
  }
});

Template.stream_chart.events({
  "click .close": function (e) {
    Session.set('streamChartVisible', false);
  },
  "click .profile": function (e) {
    Session.set('streamChartEmployeeId', this._id);
  },
  'click .stream-employee': function (e) {
    Session.set('streamChartEmployeeId', this._id)
    streamViz.transition();
  }
});

Template.stream_chart.onRendered(function () {
  window.streamViz = new Viz();
})

function Viz () {
  var n, m, stack, layers0, layers1, width, height, x, y, color, area, svg;


  var _init = function () {
    n = 20; // number of layers
    m = 200; // number of samples per layer
    stack = d3.layout.stack().offset("wiggle");
    layers0 = stack(d3.range(n).map(function() { return _bumpLayer(m); }));
    layers1 = stack(d3.range(n).map(function() { return _bumpLayer(m); }));

    width = $('.viz').width();
    height = $('.viz').width() / 2;

    x = d3.scale.linear()
      .domain([0, m - 1])
      .range([0, width]);

    y = d3.scale.linear()
      .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
      .range([height, 0]);

    color = d3.scale.linear()
      .range(["#aad", "#556"]);

    area = d3.svg.area()
      .x(function(d) { return x(d.x); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

    svg = d3.select(".viz").append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("path")
      .data(layers0)
    .enter().append("path")
      .attr("d", area)
      .style("fill", function() { return color(Math.random()); });
  }

  var _bumpLayer = function (n) {
    function bump(a) {
      var x = 1 / (.1 + Math.random()),
          y = 2 * Math.random() - .5,
          z = 10 / (.1 + Math.random());
      for (var i = 0; i < n; i++) {
        var w = (i / n - y) * z;
        a[i] += x * Math.exp(-w * w);
      }
    }

    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < 5; ++i) bump(a);
    var layer = a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
    return layer;
  }

  var _transition = function () {
    d3.select(".viz").selectAll("path")
      .data(function() {
        var d = layers1;
        layers1 = layers0;
        return layers0 = d;
      })
    .transition()
      .duration(1500)
      .attr("d", area);
  }

  // Initialize our variables
  _init();

  return {
    bumpLayer: _bumpLayer,
    transition: _transition
  }
}
