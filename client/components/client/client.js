Template.client.events({
  "click .client": function (e) {
    Session.set('clientEditId', this._id);
    Session.set('clientNewOpen', true);

    // Set form values
    $('#client-name').val(this.name);
    $('#color').val(this.color);
    $(".color-picker").spectrum("set", this.color);
  },
  "dblclick .client": function (e) {
    console.log('double')
  },
  "click .visibility": function (e) {
    e.stopPropagation();
    Clients.update(this._id, { $set: { hidden: !this.hidden }});
  }
});
