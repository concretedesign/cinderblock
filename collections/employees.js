Employees = new Mongo.Collection("employees");

var employeeSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 100
  },
  title: {
    type: String,
    label: "Job Title",
    max: 100
  },
  picture: {
    type: String,
    label: "Picture URL"
  }
});

Employees.attachSchema(employeeSchema);
