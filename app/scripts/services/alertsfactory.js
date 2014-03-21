'use strict';

angular.module('lmisChromeApp')
  .factory('alertsFactory', function($rootScope, $timeout) {
    $rootScope.alerts = [];

    var add = function(alert) {
      $rootScope.alerts.push(alert);
      $timeout(function() {
        var index = $rootScope.alerts.indexOf(alert);
        if(index !== -1) {
          remove(index);
        }
      }, 5000);
    };

    var success = function(message) {
      return message;
    };

    var info = function(message) {
      return message;
    };

    var warning = function(message) {
      return message;
    };

    var danger = function(message) {
      return message;
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
      success: success,
      info: info,
      warning: warning,
      danger: danger,
      remove: remove,
      clear: clear
    };
  });
