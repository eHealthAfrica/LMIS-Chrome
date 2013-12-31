/*
	Sticky v2.1.2 by Andy Matthews
	http://twitter.com/commadelimited

	forked from Sticky by Daniel Raftery
	http://twitter.com/ThrivingKings
*/
(function ($) {

	$.stickyNote = $.fn.stickyNote = function (note, options, callback) {

		// allow options to be ignored, and callback to be second argument
		if (typeof options === 'function') callback = options;

		// generate unique ID based on the hash of the note.
		var hashCode = function(str){
				var hash = 0,
					i = 0,
					c = '',
					len = str.length;
				if (len === 0) return hash;
				for (i = 0; i < len; i++) {
					c = str.charCodeAt(i);
					hash = ((hash<<5)-hash) + c;
					hash &= hash;
				}
				return 's'+Math.abs(hash);
			},
			o = {
				position: 'top-right', // top-left, top-right, bottom-left, or bottom-right
				speed: '300', // animations: fast, slow, or integer
				allowdupes: true, // true or false
				autoclose: 5000,  // delay in milliseconds. Set to 0 to remain open.
				classList: '', // arbitrary list of classes. Suggestions: success, warning, important, or info. Defaults to ''.
				clearquene: false
			},
			uniqID = hashCode(note), // a relatively unique ID
			display = true,
			duplicate = false,
			tmpl = '<div class="stickyNote border-POS CLASSLIST" id="ID"><button type="button" class="stickyNote-close close">&times;</button><p class="stickyNote-note">NOTE</p></div>',
			positions = ['top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'];

		// merge default and incoming options
		if (options) $.extend(o, options);

		// Handling duplicate notes and IDs
		$('.stickyNote').each(function () {
			if ($(this).attr('id') === hashCode(note)) {
				duplicate = true;
				if (!o.allowdupes) display = false;
			}
			if ($(this).attr('id') === uniqID) uniqID = hashCode(note);
		});

		// Make sure the stickyNote queue exists
		if(!$('body').find('.stickyNote-queue.'+o.position).length) {
            $('body').append('<div class="stickyNote-queue ' + o.position + '"></div>');
        }
		
		// Can it be displayed?
		if (display) {
			
			$('.stickyNote-queue.'+o.position).append(
				tmpl
					.replace('POS', o.position)
					.replace('ID', uniqID)
					.replace('NOTE', note)
					.replace('CLASSLIST', o.classList)
			).find('#' + uniqID)
			.slideDown(o.speed, function(){
				display = true;
				// Callback function?
				if (callback && typeof callback === 'function') {
					callback({
						'id': uniqID,
						'duplicate': duplicate,
						'displayed': display
					});
				}
			});

		}

		// Listeners
		$('.stickyNote').ready(function () {
			// If 'autoclose' is enabled, set a timer to close the stickyNote
			if (o.autoclose) {
				//console.log(o.autoclose);
				$('#' + uniqID).delay(o.autoclose).slideUp(o.speed, function(){
					// remove element from DOM
					var queueWrapper = $(this).closest('.stickyNote-queue');
					var elem = queueWrapper.find('.stickyNote');
					if(elem.length == '1'){
						queueWrapper.remove()
					} else {
						$(this).remove();
					}
				});
				
			}
		});

		// Closing a stickyNote
		$('.stickyNote-close').on('click', function () {
			$('#' + $(this).parent().attr('id')).dequeue().slideUp(o.speed, function(){
				// remove element from DOM
				var queueWrapper = $(this).closest('.stickyNote-queue');
				var elem = queueWrapper.find('.stickyNote');
				if(elem.length == '1'){
					queueWrapper.remove()
				} else {
					$(this).remove();
				}
			});
		});

	};
})(jQuery);