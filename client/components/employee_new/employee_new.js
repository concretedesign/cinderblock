Template.employee_new.events({
  "submit form": function (e) {
    e.preventDefault();

    var payload = {
      name: e.target.name.value,
      title: e.target.title.value,
      picture: e.target.picture.value
    }

    var employeeId = Session.get('employeeEditId');
    if (employeeId) {
      Employees.update(employeeId, { $set: payload }, function(error, result) {
        if (error) {
          console.error(error);
        }
      });
    } else {
      Employees.insert(payload, function(error, result) {
        if (error) {
          console.error(error);
        }
      });
    }

    // Clear values
    e.target.name.value = '';
    e.target.title.value = '';
    e.target.picture.value = '';

    // Close
    Session.set('employeeNewOpen', false);
    Session.set('employeeEditId', null);
  },
  "click .employee-new-close": function (e) {
    e.preventDefault();
    Session.set('employeeEditId', null);
    Session.set('employeeNewOpen', false);
  }
});
