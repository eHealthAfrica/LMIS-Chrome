'use strict';

angular.module('lmisChromeApp')
  .directive('gaClick', function(trackingFactory) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
//        var tracker = tracker;
        element.on('click', function() {
            console.log('Click: '+ element.text().trim()+": "+ attr.gaClick.trim());
          trackingFactory.postEvent('Click', element.text().trim(), attr.gaClick.trim());
        });
      }
    };
  });
