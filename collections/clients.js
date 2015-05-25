Clients = new Mongo.Collection("clients");

var clientSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 150
  }
});

Clients.attachSchema(clientSchema);
