'use strict';

angular.module('lmisChromeApp')
  .factory('alertsFactory', function($rootScope) {
    $rootScope.alerts = [];
    return {
      add: function(alert) {
        $rootScope.alerts.push(alert);
      },
      remove: function(index) {
        $rootScope.alerts.splice(index, 1);
      },
      clear: function() {
        $rootScope.alerts = [];
      }
    };
  });
