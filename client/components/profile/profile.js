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


Template.profile.onRendered(function () {
  interact('.profile').dropzone({
    accept: '.client',

    ondragenter: function (event) {
      var draggableElement = event.relatedTarget;
      var dropzoneElement = event.target;

      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target');
      draggableElement.classList.add('can-drop');
    },
    ondragleave: function (event) {
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');
    },
    ondrop: function (event) {
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');

      var clientId = event.relatedTarget.dataset.client_id;
      var employeeId = event.target.dataset.employee_id;

      EmployeeClients.insert(
        { client_id: clientId, employee_id: employeeId, work: [] }
      );
    }
  });
});
