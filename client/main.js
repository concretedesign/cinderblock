
Template.employees.helpers({
  employees: function () {
    return Employees.find({});
  }
});

Template.clients.helpers({
  clients: function () {
    return Clients.find({});
  }
});
