Clients = new Mongo.Collection("clients");

var clientSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 150
  },
  color: {
    type: String,
    label: "Color",
    max: 7
  },
  hidden: {
    type: Boolean,
    label: "Hidden"
  }
});

Clients.attachSchema(clientSchema);
