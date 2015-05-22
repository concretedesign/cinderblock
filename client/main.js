
Template.employees.helpers({
  employees: function () {
    return Employees.find({});
  }
});

Template.employees.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});
