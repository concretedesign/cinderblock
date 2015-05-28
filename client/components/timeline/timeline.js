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
  formatWork: function (workId) {
    var work = Work.findOne({ _id: workId });
    if (work) {
      var start = moment(work.start);
      var end = moment(work.end);

      // For x position, get difference between minDate and start
      var daysFromStart = Math.abs(moment(Session.get('minDate')).diff(start, 'days'));
      var posX = daysFromStart * Helpers.constants.dayWidth;

      // For width, get difference between start and end
      var jobDays = moment(end).diff(start, 'days');
      var width = jobDays * Helpers.constants.dayWidth;

      // For height, translate hotness
      var height = (work.hotness + 1) * 4;

      return Spacebars.SafeString(
        '<div class="work-bar" data-start="'+work.start+'" data-end="'+work.end+'" data-hotness="'+work.hotness+'" style="left: ' + posX +
          'px; width: ' + width + 'px; height: ' + height + 'px;"></div>'
      );
    } else {
      return '';
    }
  },
  barWidth: function () {
    var dateDiff = Session.get('dateDiff') || Helpers.constants.defaultDays;
    return (dateDiff * Helpers.constants.dayWidth) + 'px';
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
  'click .delete-employee-client': function (e) {
    // FIXME: Delete associated work sessions
    EmployeeClients.remove(this._id);
  }
});

Template.timeline.onRendered(function () {
  var offset = this.firstNode.offsetLeft;
  interact('.work-bar')
  .draggable({
    onmove: function (event) {
      var x = event.pageX - offset;
      event.target.style.left = x + 'px';

      // Calculate date based on position
      var daysFromStart = x / Helpers.constants.dayWidth;
      var date = moment(Session.get('minDate')).add(daysFromStart, 'days').format();

      console.log(date);
    }
  })
  .resizable({
    edges: { left: false, right: true, bottom: true, top: false },
    autoScroll: true
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = Math.max(Helpers.constants.minBarHeight, Math.min(Helpers.constants.maxBarHeight, event.rect.height)) + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  })
})
