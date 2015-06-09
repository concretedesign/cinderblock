Template.body.onRendered(function () {
  Session.set('clientPanelOpen', false);
});

Template.body.helpers({
  clientPanelState: function () {
    return Session.get('clientPanelOpen') ? 'open': '';
  },
  clientNewState: function () {
    return Session.get('clientNewOpen') ? 'open': '';
  },
  employeeNewState: function () {
    return Session.get('employeeNewOpen') ? 'open': '';
  },
  streamChartVisible: function () {
    return Session.get('streamChartVisible') || false;
  },
  treemapVisible: function () {
    return Session.get('treemapVisible') || false;
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
  },
  "click .treemap-toggle": function (e) {
    Session.set('treemapVisible', true);
  }
});
