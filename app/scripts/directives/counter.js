'use strict';

angular.module('lmisChromeApp').directive('counter', function (notificationService, $interval, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/templates/counter.html',
    scope: {
      count: '=bind',
      change: '=onchange'
    },
    link: function (scope, element) {
      var isDown = false;
      var counterBtnList = element.find('button');
      var minusBtnElem = counterBtnList.eq(0);
      var plusBtnElem = counterBtnList.eq(1);

      var vibrate = function() {
        var DURATION_MILLI_SECONDS = 50;
        notificationService.vibrate(DURATION_MILLI_SECONDS);
      };

      var crement = function(upwards) {
        scope.$apply(function() {
          scope.startCounter(upwards);
        });
      };

      var increment = function() {
        crement(true);
      };

      var decrement = function() {
        crement(false);
      };

      var incrementTouch = function() {
        increment();
        vibrate();
      };

      var decrementTouch = function() {
        decrement();
        vibrate();
      };

      scope.stopCounter = function() {
        scope.$apply(function() {
          isDown = false;
        });
      };

      minusBtnElem.on('touchstart', decrementTouch);
      plusBtnElem.on('touchstart', incrementTouch);

      minusBtnElem.on('mousedown', decrement);
      plusBtnElem.on('mousedown', increment);

      var stopEvents = [
        'touchend',
        'touchmove',
        'touchcancel',
        'mouseup',
        'mouseout',
        'scroll',
        'mousewheel'
      ];

      for(var i = stopEvents.length - 1; i >= 0; i--) {
        minusBtnElem.on(stopEvents[i], scope.stopCounter);
        plusBtnElem.on(stopEvents[i], scope.stopCounter);
      }

      var destroyEvents = stopEvents.concat([
        'mouseup',
        'touchstart'
      ]);

      element.on('$destroy', function() {
        for(var i = destroyEvents.length - 1; i >= 0; i--) {
          plusBtnElem.off(destroyEvents[i]);
          minusBtnElem.off(destroyEvents[i]);
        }
      });

      var isInvalid = function (value) {
        return (isNaN(value) || value === '' || value < 1);
      };

      scope.startCounter = function (isIncrement) {
        isDown = true;
        var startTime = new Date().getTime();
        var maxDelay = 100, interval = 75, delay = maxDelay;

        function count() {
          var currentTime = new Date().getTime();
          var timeDiff = currentTime - startTime;
          var rate = (timeDiff / 400) - 4;//400 and 4 are just constants
          var accumulatedChange = interval * (1 / (1 + Math.exp(-rate)));
          delay = delay - accumulatedChange;

          if (delay < 1) {
            delay = 1;
          }
          if (isDown) {
            if (isIncrement === true) {
              scope.increaseCount();
            } else {
              scope.decreaseCount();
            }
            var promise = $timeout(function () {
              if (isDown) {
                count();
              } else {
                $timeout.cancel(promise);
              }
              scope.$apply();
            }, delay);
          }
        }
        count();
      };

      scope.increaseCount = function () {
        scope.count = isInvalid(scope.count) ? 1 : (parseInt(scope.count) + 1); //count up
      };

      scope.decreaseCount = function () {
        scope.count = isInvalid(scope.count) ? 0 : (parseInt(scope.count) - 1);//count down
      };
    }
  };
});
