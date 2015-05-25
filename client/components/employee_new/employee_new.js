Template.employee_new.events({
  "submit form": function (e) {
    e.preventDefault();

    var payload = {
      name: e.target.name.value,
      title: e.target.title.value,
      picture: e.target.picture.value
    }

    Employees.insert(payload, function(error, result) {
      if (error) {
        console.error(error);
      }
    });

    // Clear values
    e.target.name.value = '';
    e.target.title.value = '';
    e.target.picture.value = '';
  }
});
