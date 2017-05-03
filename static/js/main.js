Tether = require('tether');
$ = jQuery = require('jquery');
require('bootstrap');

//let Clipboard = require('clipboard');
let templates = require('../../.tmp/templates.js');

let previews = function () {
	var _ = [];
	$('.preview[data-template]').each(function () {
		var self = $(this);
		var name = self.data("template");
		var template = templates[name];
		if (template) {
			_.push(function (data) {
				self.html(templates[name](data));
			});
// 			var clipboard = new Clipboard(this, {
// 			    target: function(trigger) {
// 			        return trigger;
// 			    },
// 			    text: function(trigger) {
// 			        return trigger.innerHTML;
// 			    }
// 			});

// clipboard.on('success', function(e) {
//     console.info('Action:', e.action);
//     console.info('Text:', e.text);
//     console.info('Trigger:', e.trigger);

//     e.clearSelection();
// });

// clipboard.on('error', function(e) {
//     console.error('Action:', e.action);
//     console.error('Trigger:', e.trigger);
// });
		}
	});
	return _;
}();

$("input").on("change keyup",
	function () {
		var data = {};
		$("input[data-property]").each(function () {
			var self = $(this);
			data[self.data("property")] = self.val();
		});
		for (preview of previews) {
			preview(data);
		};
		templates.formal(data);
	}
);