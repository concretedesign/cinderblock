Template.treemap.helpers({
  visible: function () {
    return Session.get('treemapVisible') || false;
  },
  treemapLabelWeeks: function () {
    return Session.get('treemapLabelWeeks') || 4;
  }
});

var mousedown = false;
var mousestart;
var mousePos = 0;
const THRESHOLD = 30;

Template.treemap.events({
  "click .close": function (e) {
    Session.set('treemapVisible', false);
  },
  'mousedown .chart-label': function (e) {
    mousedown = true;
    mousestart = e.pageX;
  },
  'mouseup .chart-label': function (e) {
    mousedown = false;
    mousePos = 0;

    treemap.setDates(Session.get('treemapLabelWeeks'));
    treemap.transition();
  },
  'mousemove .chart-label': function (e) {
    if(mousedown) {
      var deltaX = e.pageX - mousestart;

      if (mousePos < -20) {
        // Subtract 1
        mousePos = 0;
        var updatedWeeks = Math.max((Session.get('treemapLabelWeeks') - 1), 2);
        Session.set('treemapLabelWeeks', updatedWeeks);
      } else if (mousePos > 20) {
        mousePos = 0;
        var updatedWeeks = Math.min((Session.get('treemapLabelWeeks') + 1), 12);
        Session.set('treemapLabelWeeks', updatedWeeks);
      } else {
        mousePos = mousePos + deltaX;
      }
    }
  }
});

Template.treemap.onRendered(function () {
  Session.set('treemapLabelWeeks', 4);
  window.treemap = new Treemap();
})

function Treemap () {
  const TRANSITION_DURATION = 400;
  var data, node, treemap, startDate, endDate, width, height, x, y, container, format, numDays, colors, datearray = [], $tooltip, opacityScale;

  // startDate and endDate should be moment objects
  var _getEmployeeData = function(startDate, endDate) {
    var data = { name: "All Clients", children: []}
    Clients.find().forEach(function (client) {
      var clientData = { name: client.name, children: [] }
      EmployeeClients.find({ client_id: client._id }).forEach(function (employeeClient) {
        var employee = Employees.findOne(employeeClient.employee_id);
        employeeClient.work.forEach(function(workId) {
          var work = Work.findOne(workId);
          if (moment(work.start).isBetween(startDate, endDate) && moment(work.end).isBetween(startDate, endDate)) {
            clientData.children.push({
              name: employee.name,
              hotness: work.hotness,
              numDays: moment(work.end).diff(moment(work.start), 'days'),
              picture: employee.picture,
              color: client.color
            })
          }
        })
      });
      data.children.push(clientData);
    });

    return data;
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

      $tooltip.html( "<p>" + d.name + " - " + date + "</p>" );
    })
    .on("mouseout", function(d, i) {
      d3.select(this).classed("hover", false);

      $tooltip.html("");
    });
  }

  var _position = function() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }

  var _transition = function () {
    var data = _getEmployeeData(startDate, endDate);
    console.log(data);

    // node = container.datum(data).selectAll(".node")
    //   .data(treemap.nodes)
    // .enter().append("div")
    //   .attr("class", "node")
    //   .call(_position)
    //   .style("background", function (d) { return d.color; })
    //   .style("opacity", function (d) { return opacityScale(d.hotness); })
    //   .html(function (d) { return d.picture ? '<img src="' + d.picture + '" />' : ''; });
    //
    //

    // Data join
    var nodes = container.datum(data).selectAll('.node').data(treemap.nodes)

    // Enter
    nodes.enter().append("div").attr("class", "node")
      .style("background", function (d) { return d.color; })
      .style("opacity", function (d) { return opacityScale(d.hotness); })
      .html(function (d) { return d.picture ? '<img src="' + d.picture + '" />' : ''; });

      // .html(function (d) { return d.picture ? '<img src="' + d.picture + '" />' : ''; });
      // .style("background", function (d) { return d.color; })
      // .style("opacity", function (d) { return opacityScale(d.hotness); })
      // .transition().duration(TRANSITION_DURATION)
      // .call(_position)

    // Exit
    nodes.exit().transition().duration(TRANSITION_DURATION).remove();

    // Update
    nodes.transition().duration(TRANSITION_DURATION)
      .call(_position);

  }

  var _init = function () {
    _setDates(4);
    data = _getEmployeeData(startDate, endDate);

    $tooltip = $('.tooltip');

    width = $('.treemap-container').width();
    height = $('.treemap-container').height() - 40;

    treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(false)
      .value(function(d) { return d.numDays; });

    container = d3.select(".treemap-container");

    opacityScale = d3.scale.linear().domain([0, 10]).range([0.2, 0.9]);
    node = container.datum(data).selectAll(".node")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "node")
      .call(_position)
      .style("background", function (d) { return d.color; })
      .style("opacity", function (d) { return opacityScale(d.hotness); })
      .html(function (d) { return d.picture ? '<img src="' + d.picture + '" />' : ''; });
  }


  // Initialize our variables
  _init();

  return {
    transition: _transition,
    setDates: _setDates
  }
}
