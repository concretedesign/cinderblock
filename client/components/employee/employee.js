
Template.employee.onRendered(function () {
  interact('.profile').dropzone({
    // only accept elements matching this CSS selector
    accept: '.client',
    // Require a 75% element overlap for a drop to be possible
    // overlap: 0.75,

    // listen for drop related events:

    ondropactivate: function (event) {
      // add active dropzone feedback
      console.log('ondropactivate');
      event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget,
          dropzoneElement = event.target;

      console.log('ondrageenter');

      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target');
      draggableElement.classList.add('can-drop');
    },
    ondragleave: function (event) {
      console.log('ondragleave');
      // remove the drop feedback style
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');
    },
    ondrop: function (event) {
      console.log('ondrop');
    },
    ondropdeactivate: function (event) {
      console.log('ondropdeactivate');
      // remove active dropzone feedback
      event.target.classList.remove('drop-active');
      event.target.classList.remove('drop-target');
    }
  });
});
