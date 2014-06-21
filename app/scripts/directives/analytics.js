'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingFactory) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        var tracker = trackingFactory.tracker;
        element.on('click', function() {
            console.log('Click: '+ element.text().trim()+": "+ attr.gaClick.trim());
          tracker.sendEvent('Click', element.text().trim(), attr.gaClick.trim());
        });
      }
    };
  });
