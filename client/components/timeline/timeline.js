Template.timeline.helpers({
  employee_clients: function () {
    var id = this._id.valueOf();
    return EmployeeClients.find({ employee_id: id });
  },
  clientName: function (clientId) {
    return Clients.findOne(clientId).name;
  },
  formatWork: function (workId) {
    var work = Work.findOne(new Meteor.Collection.ObjectID(workId));
    if (work) {
      var start = new Date(work.start);
      var end = new Date(work.end);
      return 'L' + work.hotness + ': ' + start.toLocaleDateString() + ' - ' + end.toLocaleDateString();
    } else {
      return '';
    }
  }
});
