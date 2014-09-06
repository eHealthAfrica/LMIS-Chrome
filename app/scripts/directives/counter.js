'use strict';

angular.module('lmisChromeApp').directive('counter', function (notificationService, $interval, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/templates/counter.html',
    scope: {
      count: '=bind',
      change: '=onchange',
      name: '=name'
    },
    link: function (scope, element) {

      var DURATION_MILLI_SECONDS = 50;
      var counterBtnList = element.find('button');
      var minusBtnElem = counterBtnList.eq(0);
      var plusBtnElem = counterBtnList.eq(1);

      function isInvalid(value){
        return (isNaN(value) || value === '' || value < 1);
      }
      scope.incrementTouch = function (count) {
        notificationService.vibrate(DURATION_MILLI_SECONDS);
        return isInvalid(count) ? 1 : (parseInt(count) + 1);
      }

      scope.decrementTouch = function (count) {
        notificationService.vibrate(DURATION_MILLI_SECONDS);
        return isInvalid(count) ? 0 : (parseInt(count) - 1);
      };

      element.on('$destroy', function() {
        plusBtnElem.off('click');
        minusBtnElem.off('click');
      });

    }
  };
});
