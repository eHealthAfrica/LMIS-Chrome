'use strict';

angular.module('lmisChromeApp')
  .factory('alertsFactory', function($rootScope) {
    $rootScope.alerts = [];

    var add = function(alert) {
      $rootScope.alerts.push(alert);
    };

    var remove = function(index) {
      $rootScope.alerts.splice(index, 1);
    };

    var clear = function() {
      $rootScope.alerts = [];
    };

    $rootScope.closeAlert = remove;
    $rootScope.$on('$stateChangeStart', function() {
      clear();
    });

    return {
      add: add,
      remove: remove,
      clear: clear
    };
  });
