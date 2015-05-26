const dayWidth = 20;

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
      var posX = daysFromStart * dayWidth;

      // For width, get difference between start and end
      var jobDays = moment(end).diff(start, 'days');
      var width = jobDays * dayWidth;

      // For height, translate hotness
      var height = (work.hotness + 1) * 4;

      return Spacebars.SafeString(
        '<div class="work-bar" style="left: ' + posX +
          'px; width: ' + width + 'px; height: ' + height + 'px;"></div>'
      );
    } else {
      return '';
    }
  },
  barWidth: function () {
    var dateDiff = Session.get('dateDiff') || 365;
    return (dateDiff * dayWidth) + 'px';
  }
});

Template.timeline.events({
  "dblclick .client-bar-container": function (e) {
    // Get days from minDate by dividing xPos by dayWidth
    var days = Math.floor(e.offsetX / dayWidth);
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

  }
});
