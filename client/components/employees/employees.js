Template.employees.helpers({
  employees: function () {
    return Employees.find({});
  },
  barWidth: function () {
    var dateDiff = Session.get('dateDiff') || Helpers.constants.defaultDays;
    return (dateDiff * Helpers.constants.dayWidth) + 'px';
  },
  minDate: Helpers.getMinDate,
  maxDate: Helpers.getMaxDate,
  dateDiff: Helpers.getDateDiff,
  formatDate: function (date) {
    return moment(date).format('MMM d');
  },
  loopCount: function(count){
    var countArr = [];
    for (var i = 0; i < count; i++) {
      var date = moment().add(i, 'days');
      var item = {};
      if (i === 0 || i === count - 1 || moment().add(i, 'days').date() === 1) {
        item.displayDate = moment().add(i, 'days').format('MMM D');
      } else {
        item.displayDate = false;
      }

      item.weekend = date.day() == 0 || date.day() == 6;

      countArr.push(item);
    }
    return countArr;
  }
});

Template.employees.onRendered(function () {
  // Make sure employees and timelines are equal height and scroll together
  setTimeout(Helpers.alignPanels, 1500);
})
