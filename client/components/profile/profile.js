Template.profile.events({
  "click .delete": function (e) {
    e.preventDefault();
    Employees.remove(this._id);
  }
});