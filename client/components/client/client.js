Template.client.events({
  "dblclick .client": function (e) {
    Session.set('clientEditId', this._id);
    Session.set('clientNewOpen', true);

    // Set form values
    $('#client-name').val(this.name);
    $('#color').val(this.color);
    $(".color-picker").spectrum("set", this.color);
  }
});
