EmployeeClients = new Mongo.Collection("employee_clients");

var employeeClientSchema = new SimpleSchema({
  employee_id: {
    type: String,
    label: "Employee ID",
    regEx: SimpleSchema.RegEx.Id
  },
  client_id: {
    type: String,
    label: "Client ID",
    regEx: SimpleSchema.RegEx.Id
  },
  work: {
    type: String,
    label: "Work ID",
    regEx: SimpleSchema.RegEx.Id
  }
});

EmployeeClients.attachSchema(employeeClientSchema);
