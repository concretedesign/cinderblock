Template.timeline.helpers({
  employee_clients: function () {
    var id = this._id;
    return EmployeeClients.find({ employee_id: id.valueOf() });
  }
});
