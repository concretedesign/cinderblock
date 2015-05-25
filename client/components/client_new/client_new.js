Template.client_new.events({
  "submit form": function (e) {
    e.preventDefault();

    var payload = {
      name: e.target.name.value
    }

    Clients.insert(payload, function(error, result) {
      if (error) {
        console.error(error);
      }
    });

    // Clear values
    e.target.name.value = '';
  }
});
