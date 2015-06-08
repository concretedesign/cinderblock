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
    streamViz.transition(this._id);
  }
});

Template.stream_chart.onRendered(function () {
  window.streamViz = new Viz();
  // setTimestreamViz.transition(Employees.findOne()._id);
})

function Viz () {
  const TRANSITION_DURATION = 400;
  var startDate, endDate, stack, nest, layers, width, height, x, y, color, area, svg, format, numDays, colors, clientNames, datearray = [], $tooltip;

  var _getClientColors = function () {
    var clientColors = [];
    Clients.find().forEach(function (client) {
      clientColors[client._id] = client.color;
    })
    return clientColors;
  }

  var _getClientNames = function () {
    var clientNames = [];
    Clients.find().forEach(function (client) {
      clientNames[client._id] = client.name;
    })
    return clientNames;
  }

  // startDate and endDate should be moment objects
  var _getEmployeeData = function(employeeId, startDate, endDate) {
    // Create baseline data
    var clientDates = {};
    Clients.find().forEach(function (client) {
      clientDates[client._id] = new Array();
      for (var j = 0; j < numDays; j++) {
        var date = moment(startDate).add(j, 'days');
        clientDates[client._id].push({
          clientId: client._id,
          hotness: .1,
          date: date.format('MM/DD/YY')
        })
      }
    });

    EmployeeClients.find({ employee_id: employeeId}).forEach(function (employeeClient) {
      employeeClient.work.forEach(function (workId) {
        var work = Work.findOne(workId);

        // split work into day units
        var days = Math.abs(moment(work.start).diff(moment(work.end), 'days'));
        for (var i = 0; i < days; i++) {
          var date = moment(work.start).add(i, 'days');
          if (date.isBetween(startDate.startOf('day'), endDate.endOf('day'))) {

            var index = _.indexOf(_.pluck(clientDates[employeeClient.client_id], 'date'), date.format('MM/DD/YY'));
            clientDates[employeeClient.client_id][index].hotness = work.hotness; // Add one because we've set 0 to 1 above
          }
        }
      });
    });

    return _.flatten(clientDates);
  }

  var _setDates = function(x) {
    // TODO
    // x.domain([startDate.toDate(), endDate.toDate()]);
  }

  var _handleMouseOvers = function () {
    var paths = svg.selectAll("path");

    paths.on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      invertedx = invertedx.getMonth() + invertedx.getDate();
      var selected = (d.values);
      for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].date
        datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
      }

      mousedate = datearray.indexOf(invertedx);
      date = moment(d.values[mousedate].date).format('MMM DD');

      d3.select(this).classed("hover", true);

      $tooltip.html( "<p>" + clientNames[d.key] + " - " + date + "</p>" );
    })
    .on("mouseout", function(d, i) {
      d3.select(this)
        .classed("hover", false);

      $tooltip.html("");
    });
  }

  var _transition = function (employeeId) {
    var data = _getEmployeeData(employeeId, startDate, endDate);
    data.forEach(function(d) {
      d.date = format.parse(d.date);
      d.hotness = +d.hotness;
    });

    layers = stack(nest.entries(data));

    // Data join
    var paths = svg.selectAll("path").data(layers)

    // Update
    paths
      .transition().duration(TRANSITION_DURATION)
      .attr("d", function (d) { return area(d.values); })
      .style("fill", function (d) {
        return colors[d.key];
      });

    // Enter
    paths.enter()
      .append("path")
      .transition().duration(TRANSITION_DURATION)
      .attr("d", function (d) { return area(d.values); })
      .style("fill", function (d) {
        return colors[d.key];
      })

    // Exit
    paths.exit().transition().duration(TRANSITION_DURATION).remove();

    _handleMouseOvers();
  }

  var _init = function () {
    numDays = 26;
    startDate = moment().startOf('isoweek');
    endDate = moment().startOf('isoweek').add(numDays, 'days');

    $tooltip = $('.tooltip');

    colors = _getClientColors();
    clientNames = _getClientNames();

    stack = d3.layout.stack().offset("silhouette")
      .values(function (d) { return d.values; })
      .x(function (d) { return d.date; })
      .y(function (d) { return d.hotness; });

    nest = d3.nest()
      .key(function (d) { return d.clientId; });

    area = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

    width = $('.viz').width();
    height = $('.viz').width() / 5;

    format = d3.time.format("%m/%d/%y");

    x = d3.time.scale()
      .domain([startDate.toDate(), endDate.subtract(1, 'days').toDate()])
      .range([0, width]);

    y = d3.scale.linear()
      .domain([0, 10])
      .range([height, 0]);

    svg = d3.select(".viz").append("svg")
      .attr("width", width)
      .attr("height", height);

  }


  // Initialize our variables
  _init();

  return {
    transition: _transition
  }
}
