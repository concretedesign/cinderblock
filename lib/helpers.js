if (Meteor.isClient) {
  window.Helpers = {
    constants: {
      defaultDays: 365,
      dayWidth: 40,
      minBarHeight: 4,
      maxBarHeight: 40
    },

    getMaxDate: function () {
      var date = Work.find({}, { limit: 1, sort: { end: -1 }, fields: { end: 1 } }).fetch().shift();
      if (date) {
        Session.set('maxDate', date.end);
        console.log(date.end)
        return date.end;
      } else {
        return false;
      }
    },

    getMinDate: function () {
      var date = Work.find({}, { limit: 1, sort: { start: 1 }, fields: { start: 1 } }).fetch().shift();
      if (date) {
        Session.set('minDate', date.start);
        return date.start;
      } else {
        return false;
      }
    },

    getDateDiff: function () {
      var minDate = Helpers.getMinDate()
      var maxDate = Helpers.getMaxDate();

      if (minDate && maxDate) {
        var dateDiff = moment(maxDate).diff(moment(minDate), 'days');
        Session.set('dateDiff', dateDiff);
        return dateDiff;
      } else {
        return false
      }
    },
  }
}
