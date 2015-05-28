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
  dateDiff: Helpers.getDateDiff
});


Template.clients.helpers({
  clients: function () {
    return Clients.find({});
  }
});

window.draggingClient = false;
window.clientThumb;
Template.clients.onRendered(function () {

  // See https://bgrins.github.io/spectrum/ for options
  interact('.client').draggable({

    autoScroll: true,
    max: Infinity,

    onstart: function (event) {
      window.draggingClient = false;
      window.clientThumb = event.target.cloneNode(true);
      window.clientThumb.classList.add('dragging');

      window.clientThumb.style.left = event.target.offsetLeft + 'px';
      window.clientThumb.style.top = event.target.offsetTop + 'px';
      // window.clientThumb.style.webkitTransform =
      // window.clientThumb.style.transform =
      //   'translate(' + event.target.offsetLeft + 'px, ' + event.target.offsetTop + 'px)';

      window.clientThumb.dataset.dragX = event.target.offsetLeft;
      window.clientThumb.dataset.dragY = event.target.offsetTop;
      document.body.appendChild(window.clientThumb);
    },

    onmove: function (event) {
      var x = (window.clientThumb.dataset.dragX|0) + event.dx;
      var y = (window.clientThumb.dataset.dragY|0) + event.dy;

      window.clientThumb.style.left = x + 'px';
      window.clientThumb.style.top = y + 'px';
      // window.clientThumb.style.webkitTransform =
      // window.clientThumb.style.transform =
      //   'translate(' + x + 'px, ' + y + 'px)';

      event.interaction.x = x;
      event.interaction.y = y;

      window.clientThumb.dataset.dragX = x;
      window.clientThumb.dataset.dragY = y;
    },

    onend: function (event) {
      window.draggingClient = false;
      document.body.removeChild(window.clientThumb);
    }
  });
})
