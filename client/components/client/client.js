Template.client.events({
  "click .delete": function (e) {
    e.preventDefault();
    Clients.remove(this._id);
  }
});
