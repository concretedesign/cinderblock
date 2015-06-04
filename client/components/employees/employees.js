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
      if (i === 0 || i === count - 1 || moment().add(i, 'days').date() === 1) {
        countArr.push({ displayDate: moment().add(i, 'days').format('MMM D') });
      } else {
        countArr.push({ displayDate: false });
      }
    }
    return countArr;
  }
});


Template.employees.onRendered(function () {
  // Make sure employees and timelines are equal height and scroll together
  setTimeout(Helpers.alignPanels, 1500);
})
