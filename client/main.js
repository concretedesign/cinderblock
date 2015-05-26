Template.body.helpers({
  clientPanelState: function () {
    return Session.get('clientPanelOpen') ? 'open': '';
  },
  clientNewState: function () {
    return Session.get('clientNewOpen') ? 'open': '';
  },
  employeeNewState: function () {
    return Session.get('employeeNewOpen') ? 'open': '';
  }
});

Template.body.events({
  "click .client-panel-toggle": function (e) {
    e.preventDefault();
    Session.set('clientPanelOpen', !Session.get('clientPanelOpen'));
  },
  "click .client-new-toggle": function (e) {
    e.preventDefault();
    $('#client-name').val('');
    $('#color').val('');
    $(".color-picker").spectrum("set", '#000000');
    Session.set('clientEditId', null);
    Session.set('clientNewOpen', true);
  },
  "click .employee-new-toggle": function (e) {
    e.preventDefault();
    $('#employee-name').val('');
    $('#employee-title').val('');
    $('#employee-picture').val('');
    Session.set('employeeEditId', null);
    Session.set('employeeNewOpen', true);
  }
});

function getMaxDate () {
  var date = Work.find({}, { limit: 1, sort: { end: -1 }, fields: { end: 1 } }).fetch().shift();
  if (date) {
    Session.set('maxDate', date.end);
    return date.end;
  } else {
    return false;
  }
}

function getMinDate () {
  var date = Work.find({}, { limit: 1, sort: { start: 1 }, fields: { start: 1 } }).fetch().shift();
  if (date) {
    Session.set('minDate', date.start);
    return date.start;
  } else {
    return false;
  }
}

function getDateDiff () {
  var minDate = getMinDate()
  var maxDate = getMaxDate();

  if (minDate && maxDate) {
    var dateDiff = moment(maxDate).diff(moment(minDate), 'days');
    Session.set('dateDiff', dateDiff);
    return dateDiff;
  } else {
    return false
  }
}

Template.employees.helpers({
  employees: function () {
    return Employees.find({});
  },
  minDate: getMinDate,
  maxDate: getMaxDate,
  dateDiff: getDateDiff
});


Template.clients.helpers({
  clients: function () {
    return Clients.find({});
  }
});
