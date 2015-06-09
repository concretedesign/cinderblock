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

    hexToRgb: function (hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
    },

    alignPanels: function () {
      $('.timeline').each(function (index) {
        $('.profile:eq('+index+')').height($(this).height());
      });
      $(".profile-container").height($('.timeline-container').height());

      $(".profile-container").scroll(function() {
        $(".timeline-container").scrollTop($(".profile-container").scrollTop());
      });
      $(".timeline-container").scroll(function() {
        $(".profile-container").scrollTop($(".timeline-container").scrollTop());
      });

      $('.weekend').height($('.timeline-container').height());
    },

    getClientColors: function () {
      var clientColors = [];
      Clients.find().forEach(function (client) {
        clientColors[client._id] = client.color;
      })
      return clientColors;
    },

    getClientNames: function () {
      var clientNames = [];
      Clients.find().forEach(function (client) {
        clientNames[client._id] = client.name;
      })
      return clientNames;
    }
  }
}
