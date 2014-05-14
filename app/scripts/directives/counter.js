'use strict';

angular.module('lmisChromeApp').directive('counter', function (notificationService) {
  return {
    restrict: 'E',
    template: '<div class="input-group">' +
        '<span class="input-group-btn">' +
        '<button id="_$counterMinusBtn" class="btn btn-warning counter-btn" ' +
        'type="button" ng-click="count = _tapInputSub(count)">' +
        '<i class="fa fa-minus"></i>' +
        '</button>' +
        '</span>' +
        '<input type="number" min="0" class="form-control input-lg counter-input" style="padding-right: 0em" ng-model="count" required/>'+
        '<span class="input-group-btn">' +
        '<button id="_$counterAddBtn" class="btn btn-info counter-btn" ' +
        'type="button" ng-click="count = _tapInputAdd(count)">' +
        '<i class="fa fa-plus"></i>' +
        '</button>' +
        '</span>' +
        '</div>',
    scope: {
      count: '=bind'
    },
    link: function (scope, element, attr) {
      function isInvalid(value){
        return (isNaN(value) || value === '' || value < 1);
      }

      scope._tapInputAdd = function (param) {
        var DURATION_MILLI_SECONDS = 50;
        notificationService.vibrate(DURATION_MILLI_SECONDS);
        return isInvalid(param) ? 1 : (parseInt(param) + 1);
      };

      scope._tapInputSub = function (param) {
        var NUMBER_OF_REPEATS = 1;
        notificationService.beep(NUMBER_OF_REPEATS);
        return isInvalid(param) ? 0 : (parseInt(param) - 1);
      };
    }
  };
});

