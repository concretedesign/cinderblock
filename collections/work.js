Work = new Mongo.Collection("work");

var workSchema = new SimpleSchema({
  start: {
    type: Date,
    label: "Start Date"
  },
  end: {
    type: Date,
    label: "End Date"
  },
  hotness: {
    type: Number,
    label: "Hotness",
    min: 0,
    max: 10
  }
});

Work.attachSchema(workSchema);
