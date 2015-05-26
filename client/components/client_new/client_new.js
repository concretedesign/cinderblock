Template.client_new.events({
  "submit form": function (e) {
    e.preventDefault();

    var payload = {
      name: e.target.name.value,
      color: e.target.color.value
    }

    var clientId = Session.get('clientEditId');
    if (clientId) {
      Clients.update(clientId, { $set: payload }, function(error, result) {
        if (error) {
          console.error(error);
        }
      });
    } else {
      Clients.insert(payload, function(error, result) {
        if (error) {
          console.error(error);
        }
      });
    }

    // Clear values
    e.target.name.value = '';

    // Close
    Session.set('clientNewOpen', false);
  },
  "click .client-new-close": function (e) {
    e.preventDefault();
    Session.set('clientNewOpen', false);
  },
  "click .client-delete": function (e) {
    e.preventDefault();
    if (window.confirm("Are you sure you wish to remove this client?")) {
      // FIXME: Remove from EmployeeClient, remove all connected work
      var clientId = Session.get('clientEditId');
      if (clientId) {
        Clients.remove(clientId);
      }
      Session.set('clientEditId', null);
      Session.set('clientNewOpen', false);
    }
  }
});

Template.client_new.helpers({
  clientId: function() {
    return Session.get('clientEditId');
  }
})

Template.client_new.onRendered(function () {
  // See https://bgrins.github.io/spectrum/ for options
  $(".color-picker").spectrum({
    color: "#000",
    showInput: true,
    className: "full-spectrum",
    clickoutFiresChange: true,
    showInitial: true,
    showPalette: false,
    showSelectionPalette: true,
    maxSelectionSize: 10,
    preferredFormat: "hex",
    change: function (color) {
      $('.color-picker').val(color.toHexString());
    }
  });
})
