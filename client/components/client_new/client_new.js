Template.client_new.events({
  "submit form": function (e) {
    e.preventDefault();

    var payload = {
      name: e.target.name.value,
      color: e.target.color.value
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


Template.client_new.onRendered(function () {
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
