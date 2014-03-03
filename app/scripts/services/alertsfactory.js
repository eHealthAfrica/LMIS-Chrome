'use strict';

angular.module('lmisChromeApp')
  .factory('alertsFactory', function($rootScope) {
    $rootScope.alerts = [];

    var remove = function(index) {
      $rootScope.alerts.splice(index, 1);
    };

    $rootScope.closeAlert = remove;

    return {
      add: function(alert) {
        $rootScope.alerts.push(alert);
      },
      remove: remove,
      clear: function() {
        $rootScope.alerts = [];
      }
    };
  });
