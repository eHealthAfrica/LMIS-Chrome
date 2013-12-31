/* [ ---- Ebro Admin - common js ---- ] */

    $(function() {
        //* accordions
		ebro_accordions.init();
		//* tooltips_popovers
		ebro_tooltips_popovers.init();

        //* don't close dropdown on document click
        $('.notification_dropdown .dropdown-menu').click(function(e) {
            e.stopPropagation();
        });
		
    });

    //* get text without DOM element from node
    jQuery.fn.justtext=function(){return $.trim($(this).clone().children().remove().end().text())};

    //* avoid 'console' errors in browsers that lack a console
    if (!(window.console && console.log)) {
        (function() {
            var noop = function() {};
            var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
            var length = methods.length;
            var console = window.console = {};
            while (length--) {
                console[methods[length]] = noop;
            }
        }());
    }

    //* detect touch devices 
    function is_touch_device() {
        return !!('ontouchstart' in window);
    };
	
	//* detect HiRes displays
    function isRetina(){
		var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
				(min--moz-device-pixel-ratio: 1.5),\
				(-o-min-device-pixel-ratio: 3/2),\
				(min-resolution: 1.5dppx)";
		if (window.devicePixelRatio > 1)
			return true;
		if (window.matchMedia && window.matchMedia(mediaQuery).matches)
			return true;
		return false;
	};
    
    //* browser detect
    jQuery.browser = {};
    jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

	//* accordions
	ebro_accordions = {
		init: function() {
			$('.panel-group .panel-title a').each(function() {
				var $this = $(this);
				$this.append('<span class="icon-angle-left"></span>');
			})
			
			$('.panel-group .panel-collapse.in').each(function() {
				var $this = $(this);
				$this.closest('.panel').addClass('sect_active').find('.panel-title [class^="icon-"]').toggleClass('icon-angle-left icon-angle-up')
			})
			
			//* add active class (accorion show)
			$('.panel-group .panel-collapse').on('show.bs.collapse',function() {
				$(this).closest('.panel').addClass('sect_active').find('.panel-title [class^="icon-"]').toggleClass('icon-angle-left icon-angle-up');
			}).on('hide.bs.collapse',function() {
				$(this).closest('.panel').removeClass('sect_active').find('.panel-title [class^="icon-"]').toggleClass('icon-angle-left icon-angle-up');
			});
		}
	}
	
	//* tooltips, popovers
	ebro_tooltips_popovers = {
		init: function() {
			$('[data-toggle=tooltip]').tooltip();
			$('[data-toggle=popover]').popover();
		}
	}
