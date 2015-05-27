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

window.draggingClient = false;
window.clientThumb;
Template.clients.onRendered(function () {
  // See https://bgrins.github.io/spectrum/ for options
  // target elements with the "draggable" class
  interact('.client').draggable({
    // manualStart: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },

    onstart: function (event) {
      console.log('start drag')
      window.draggingClient = false;
      window.clientThumb = event.target.cloneNode(true);
      window.clientThumb.classList.add('dragging');
      window.clientThumb.style.left = event.target.offsetLeft + 'px';
      window.clientThumb.style.top = event.target.offsetTop + 'px';
      window.clientThumb.dataset.dragX = event.target.offsetLeft;
      window.clientThumb.dataset.dragY = event.target.offsetTop;
      document.body.appendChild(window.clientThumb);
    },
    // call this function on every dragmove event
    onmove: function (event) {
      var x = (window.clientThumb.dataset.dragX|0) + event.dx;
      var y = (window.clientThumb.dataset.dragY|0) + event.dy;
      console.log(x);

      window.clientThumb.style.left = x + 'px';
      window.clientThumb.style.top = y + 'px';

      window.clientThumb.dataset.dragX = x;
      window.clientThumb.dataset.dragY = y;
    },
    // call this function on every dragend event
    onend: function (event) {
      window.draggingClient = false;
      console.log('finished dragging client');
      document.body.removeChild(window.clientThumb);
    }
  });
})
