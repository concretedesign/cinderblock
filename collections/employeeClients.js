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
    type: [String],
    label: "Work"
  }
});

EmployeeClients.attachSchema(employeeClientSchema);

// Hooks
EmployeeClients.after.remove(function(userId, doc) {
  doc.work.forEach(function (workId) {
    Work.remove(workId);
    console.log('removed ' + workId);
  })
});
