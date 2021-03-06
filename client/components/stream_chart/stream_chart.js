Template.stream_chart.helpers({
  visible: function () {
    return Session.get('streamChartVisible') || false;
  },
  employeeId: function () {
    return Session.get('streamChartEmployeeIds') || [Employees.findOne()._id];
  },
  employees: function () {
    return Employees.find({});
  },
  isActiveStream: function () {
    var ids = Session.get('streamChartEmployeeIds') || [];
    return ids.indexOf(this._id) >= 0 ? 'current' : '';
  },
  chartLabelWeeks: function () {
    return Session.get('chartLabelWeeks') || 4;
  }
});

var mousedown = false;
var mousestart;
var mousePos = 0;
const THRESHOLD = 30;

Template.stream_chart.events({
  "click .close": function (e) {
    Session.set('streamChartVisible', false);
  },
  'click .stream-employee': function (e) {
    var employeeIds = Session.get('streamChartEmployeeIds');

    var index = employeeIds.indexOf(this._id);
    if (index >= 0) {
      employeeIds.splice(index, 1);
    } else {
      employeeIds.push(this._id);
    }

    Session.set('streamChartEmployeeIds', employeeIds)
    streamViz.transition(employeeIds);
  },
  'mousedown .chart-label': function (e) {
    mousedown = true;
    mousestart = e.pageX;
  },
  'mouseup .chart-label': function (e) {
    mousedown = false;
    mousePos = 0;

    streamViz.setDates(Session.get('chartLabelWeeks'));
    streamViz.transition(Session.get('streamChartEmployeeIds'));
  },
  'mousemove .chart-label': function (e) {
    if(mousedown) {
      var deltaX = e.pageX - mousestart;

      if (mousePos < -20) {
        // Subtract 1
        mousePos = 0;
        var updatedWeeks = Math.max((Session.get('chartLabelWeeks') - 1), 2);
        Session.set('chartLabelWeeks', updatedWeeks);
      } else if (mousePos > 20) {
        mousePos = 0;
        var updatedWeeks = Math.min((Session.get('chartLabelWeeks') + 1), 12);
        Session.set('chartLabelWeeks', updatedWeeks);
      } else {
        mousePos = mousePos + deltaX;
      }
    }
  }
});

Template.stream_chart.onRendered(function () {
  window.streamViz = new Viz();

  var employeeIds = Session.get('streamChartEmployeeIds') || [Employees.findOne()._id];
  streamViz.transition(employeeIds);

  Session.set('chartLabelWeeks', 4);
})

function Viz () {
  const TRANSITION_DURATION = 400;
  var startDate, endDate, stack, nest, layers, width, height, x, y,
    area, svg, format, numDays, colors, clientNames, datearray = [], $tooltip;

  // startDate and endDate should be moment objects
  var _getEmployeeData = function(employeeIds, startDate, endDate) {
    // Create baseline data
    var clientDates = {};
    Clients.find().forEach(function (client) {
      clientDates[client._id] = new Array();
      for (var j = 0; j < numDays; j++) {
        var date = moment(startDate).add(j, 'days');
        clientDates[client._id].push({
          clientId: client._id,
          hotness: .1,
          date: date.format('MM/DD/YY'),
          numEmployees: 0,
        })
      }
    });

    employeeIds.forEach(function (employeeId) {
      EmployeeClients.find({ employee_id: employeeId}).forEach(function (employeeClient) {
        employeeClient.work.forEach(function (workId) {
          var work = Work.findOne(workId);

          // split work into day units
          var days = Math.abs(moment(work.start).diff(moment(work.end), 'days'));
          for (var i = 0; i < days; i++) {
            var date = moment(work.start).add(i, 'days');
            if (date.isBetween(startDate.startOf('day'), endDate.endOf('day'))) {

              var index = _.indexOf(_.pluck(clientDates[employeeClient.client_id], 'date'), date.format('MM/DD/YY'));
              if (index >= 0) {
                var entry = clientDates[employeeClient.client_id][index];
                if (entry.hotness == .1) {
                  entry.hotness = 0;
                }
                entry.hotness += work.hotness;
                entry.numEmployees += 1;
              }
            }
          }
        });
      });
    });

    // Average out values
    var flattenedDates = _.flatten(clientDates);
    flattenedDates.forEach(function (date, index) {
      if (date.numEmployees > 1) {
        flattenedDates[index].hotness = flattenedDates[index].hotness / date.numEmployees;
      }
    })

    return flattenedDates;
  }

  // Expects two moment objects
  var _setDates = function(numWeeks) {
    startDate = moment().startOf('week').startOf('day');
    endDate = moment().startOf('week').add(numWeeks, 'weeks').subtract(2, 'day').endOf('day');
    numDays = numWeeks * 7;
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
      d3.select(this).classed("hover", false);

      $tooltip.html("");
    });
  }

  var _transition = function (employeeIds) {
    var data = _getEmployeeData(employeeIds, startDate, endDate);
    data.forEach(function(d) {
      d.date = format.parse(d.date);
      d.hotness = +d.hotness;
    });

    x.domain([startDate.toDate(), endDate.toDate()])

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

    // Watch for data changes
    Work.find().observeChanges({
      changed: function(id, fields) {
        _transition(employeeIds)
      }
    });
  }

  var _init = function () {
    _setDates(4);

    $tooltip = $('.tooltip');

    colors = Helpers.getClientColors();
    clientNames = Helpers.getClientNames();

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
      .domain([startDate.toDate(), endDate.toDate()])
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
    transition: _transition,
    setDates: _setDates
  }
}
