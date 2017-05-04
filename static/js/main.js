Tether = require('tether');
$ = jQuery = require('jquery');
require('bootstrap');

var _dataString = null;

document.addEventListener('copy', function(e) {
  if (_dataString !== null) {
    try {
      e.clipboardData.setData('text/html', _dataString);
      e.preventDefault();
    } finally {
      _dataString = null;
    }
  }
});

const templates = require('../../.tmp/templates.js');

const previews = function() {
  var _ = [];
  $('.preview[data-template]').each(function() {
    var self = $(this);
    var name = self.data('template');
    var template = templates[name];
    if (template) {
      _.push(function(data) {
        self.html(templates[name](data));
      });
      self.click(function() {

        var range = document.createRange();
        range.selectNode(this);
        window.getSelection().addRange(range);

        // Copy
        document.execCommand('copy');
        window.setTimeout(function() {
          if (window.getSelection) {
            if (window.getSelection().empty) { // Chrome
              window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) { // Firefox
              window.getSelection().removeAllRanges();
            }
          } else if (document.selection) { // IE?
            document.selection.empty();
          }
        }, 1000);
      });
      $('.copy').click(function(event) {
        var preview = $(this).parents('.card').find('.preview');
        var range = document.createRange();
        range.selectNode(preview.get(0));
        window.getSelection().addRange(range);

        // Copy
        document.execCommand('copy');
        window.setTimeout(function() {
          if (window.getSelection) {
            if (window.getSelection().empty) { // Chrome
              window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) { // Firefox
              window.getSelection().removeAllRanges();
            }
          } else if (document.selection) { // IE?
            document.selection.empty();
          }
        }, 1000);
        event.preventDefault();
      });

    }
  });
  return _;
}();

function updatePreviews() {
  var data = {};
  $('input[data-property]').each(function() {
    var self = $(this);
    data[self.data('property')] = self.val();
  });
  for (var preview of previews) {
    preview(data);
  }
}

$('input').on('change keyup',
  updatePreviews
);

updatePreviews();

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});