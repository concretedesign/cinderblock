Template.profile.events({
  "click .delete": function (e) {
    e.preventDefault();
    Employees.remove(this._id);
  },
  "click .profile": function (e) {
    Session.set('employeeEditId', this._id);
    Session.set('employeeNewOpen', true);

    // Set form values
    $('#employee-name').val(this.name);
    $('#employee-title').val(this.title);
    $('#employee-picture').val(this.picture);
  }
});
