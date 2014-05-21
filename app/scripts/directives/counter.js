'use strict';

angular.module('lmisChromeApp').directive('counter', function (notificationService, $interval, $timeout) {
  return {
    restrict: 'E',
    template: '<div class="input-group">' +
        '<span class="input-group-btn">' +
        '<button id="_$counterMinusBtn" class="btn btn-warning counter-btn" ' +
        'type="button">' +
        '<i class="fa fa-minus"></i>' +
        '</button>' +
        '</span>' +
        '<input type="number" min="0" class="form-control input-lg counter-input" style="padding-right: 0em" ng-model="count" required/>' +
        '<span class="input-group-btn">' +
        '<button id="_$counterAddBtn" class="btn btn-info counter-btn" ' +
        'type="button">' +
        '<i class="fa fa-plus"></i>' +
        '</button>' +
        '</span>' +
        '</div>',
    scope: {
      count: '=bind'
    },
    link: function (scope, element, attr) {
      var isDown = false;
      var shouldCountUp = true;
      var counterBtnList = element.find('button');
      var minusBtnElem = counterBtnList.eq(0);
      var plusBtnElem = counterBtnList.eq(1);

      //attach mouse and touch event listeners, start: is called on touch-start and mouse-down,
      // end: is called on touch-end or mouse up.
      minusBtnElem.on('touchstart', function () {
        scope.$apply(function () {
          scope.startCounter(!shouldCountUp);
        });
        var NUMBER_OF_REPEATS = 1;
        notificationService.beep(NUMBER_OF_REPEATS);
      });
      minusBtnElem.on('touchend', function () {
        scope.$apply(function () {
          scope.stopCounter();
        });
      });

      //attach touch listener to add button
      plusBtnElem.on('touchstart', function () {
        scope.$apply(function () {
          scope.startCounter(shouldCountUp);
        });
        var DURATION_MILLI_SECONDS = 50;
        notificationService.vibrate(DURATION_MILLI_SECONDS);
      });
      plusBtnElem.on('touchend', function () {
        scope.$apply(function () {
          scope.stopCounter();
        });
      });

      //add mouse listeners for mouse-up and mouse-down events
      minusBtnElem.on('mousedown', function () {
        scope.$apply(function () {
          scope.startCounter(!shouldCountUp);
        });
      });
      minusBtnElem.on('mouseup', function () {
        scope.$apply(function () {
          scope.stopCounter();
        });
      });

      //attach listener to add button
      plusBtnElem.on('mousedown', function () {
        scope.$apply(function () {
          scope.startCounter(shouldCountUp);
        });
      });
      plusBtnElem.on('mouseup', function () {
        scope.$apply(function () {
          scope.stopCounter();
        });
      });

      element.on('$destroy', function () {
        //remove all listeners on counter destroy
        plusBtnElem.off('mouseup');
        plusBtnElem.off('mousedown');
        plusBtnElem.off('touchstart');
        plusBtnElem.off('touchend');

        minusBtnElem.off('mouseup');
        minusBtnElem.off('mousedown');
        minusBtnElem.off('touchstart');
        minusBtnElem.off('touchend');
      });

      var isInvalid = function (value) {
        return (isNaN(value) || value === '' || value < 1);
      };

      scope.stopCounter = function () {
        isDown = false;
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
            var promise = $timeout(function () {
              if (isDown) {
                if (isIncrement === true) {
                  scope.increaseCount();
                } else {
                  scope.decreaseCount();
                }
                scope.$apply();
                count();
              } else {
                $timeout.cancel(promise);
              }

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