Template.timeline.helpers({
  employee_clients: function () {
    var id = this._id.valueOf();
    return EmployeeClients.find({ employee_id: id });
  },
  clientName: function (clientId) {
    return Clients.findOne(clientId).name || '';
  },
  clientColor: function (clientId) {
    return Clients.findOne(clientId).color || '#000000';
  },
  isVisible: function (clientId) {
    return !Clients.findOne(clientId).hidden;
  },
  formatWork: function (workId, clientId) {
    var work = Work.findOne({ _id: workId });
    if (work) {
      var start = moment(work.start);
      var end = moment(work.end);

      var client = Clients.findOne(clientId);

      // For x position, get difference between minDate and start
      var daysFromStart = Math.abs(moment().startOf('day').diff(start.startOf('day'), 'days'));
      var posX = daysFromStart * Helpers.constants.dayWidth;

      // For width, get difference between start and end
      var jobDays = moment(end.startOf('day')).diff(start.startOf('day'), 'days');
      var width = jobDays * Helpers.constants.dayWidth;

      // For height, translate hotness
      var height = (work.hotness + 1) * 4;

      return Spacebars.SafeString(
        '<div class="work-bar" data-id="'+workId+'" data-start="'+work.start+'" data-end="'+work.end+'" data-hotness="'+work.hotness+'" style="left: ' + posX +
          'px; width: ' + width + 'px; height: ' + height + 'px; background-color: '+client.color+'"><span>'+moment(work.start).format('MMM D')+' - '+moment(work.end).format('MMM D')+'</span></div>'
      );
    } else {
      return '';
    }
  },
  barWidth: function () {
    // var dateDiff = Session.get('dateDiff') || Helpers.constants.defaultDays;
    return (Helpers.constants.defaultDays * Helpers.constants.dayWidth) + 'px';
  }
});

Template.timeline.events({
  "dblclick .client-bar-container": function (e) {
    // Get days from minDate by dividing xPos by dayWidth
    var days = Math.floor(e.offsetX / Helpers.constants.dayWidth);
    var daysFromStart = moment(Session.get('minDate')).add(days, 'days');

    Work.insert({
      start: daysFromStart.format(),
      end: daysFromStart.add(1, 'days').format(),
      hotness: 5
    }, function (error, result) {
      if (error) {
        console.error(error);
      } else {
        // Result is the ID
        EmployeeClients.update(this._id, { $push: { work: result } });
      }
    }.bind(this));
  },
  "dblclick .work-bar": function (e) {
    // Delete the work item
    e.stopPropagation();
    var employeeId = e.delegateTarget.children[0].dataset.employee_id;
    var clientId = e.target.parentElement.dataset.client_id;
    EmployeeClients.update(EmployeeClients.findOne({ employee_id: employeeId, client_id: clientId })._id, { $pull: { work: this.valueOf() }});
    Work.remove(this.valueOf());
  },
  'click .delete-employee-client': function (e) {
    EmployeeClients.remove(this._id);
    Helpers.alignPanels();
  }
});

Template.timeline.onRendered(function () {
  var offset = this.firstNode.offsetLeft + 145; // 145 is offset left caused by employee sidebar

  function getStartDate (event) {
    if (event.type == 'resizemove' || event.type == 'resizeend') {
      return moment(new Date(event.target.dataset.start));
    } else {
      var scrollLeft = document.getElementsByClassName('timeline-container')[0].scrollLeft;
      var x = event.pageX + scrollLeft - offset;

      // Calculate date based on position
      var daysFromStart = Math.round(x / Helpers.constants.dayWidth);
      return moment(Session.get('minDate')).add(daysFromStart, 'days');
    }
  }

  function getEndDate (startDate, daysDiff) {
    return moment(startDate).add(daysDiff, 'day');
  }

  function calculateWork (event) {
    var startDate = getStartDate(event).format();

    var daysDiff = Math.max(Math.round(parseInt(event.target.style.width) / Helpers.constants.dayWidth), 1);

    var hotness = Math.round(parseInt(event.target.style.height, 10) / 4 - 1);

    var id = event.target.dataset.id;
    Work.update(id, { $set: {start: startDate, end: getEndDate(startDate, daysDiff).format(), hotness: hotness }});
  }

  function setLabel (event) {
    // FIXME: This could be optimized to return if we haven't changed days (i.e. moved < 40px)
    var startDate = getStartDate(event);
    var daysDiff = Math.max(Math.round(parseInt(event.target.style.width) / Helpers.constants.dayWidth), 1);
    var endDate = getEndDate(startDate, daysDiff);

    event.target.children[0].innerHTML = startDate.format('MMM D') + ' - ' + endDate.format('MMM D');
  }

  interact('.work-bar')
    .draggable({
      snap: {
        targets: [
          interact.createSnapGrid({ x: 40 })
        ],
        range: Infinity,
        relativePoints: [ { x: 0, y: 0 } ]
      },
      restrict: {
        restriction: '.client-bar',
      },
      onmove: function (event) {
        var scrollLeft = document.getElementsByClassName('timeline-container')[0].scrollLeft;
        var x = event.pageX + scrollLeft - offset - (Session.get('clientPanelOpen') ? 240 : 0);
        event.target.style.left = (Session.get('clientPanelOpen') ? (x - 240) : x) + 'px';

        setLabel(event);
      },
      onend: calculateWork
    })
    .resizable({
      edges: { left: false, right: true, bottom: true, top: true },
      snap: {
        targets: [
          interact.createSnapGrid({ x: 40, y: 4 })
        ],
        range: Infinity,
        relativePoints: [ { x: 0, y: 0 } ]
      },
      autoScroll: true,
      onmove: function (event) {
        var target = event.target;

        // update the element's style
        target.style.width = Math.max(Helpers.constants.dayWidth, event.rect.width) + 'px';
        target.style.height = Math.max(Helpers.constants.minBarHeight, Math.min(Helpers.constants.maxBarHeight, event.rect.height)) + 'px';

        setLabel(event);
      },
      onend: calculateWork
    })
})
