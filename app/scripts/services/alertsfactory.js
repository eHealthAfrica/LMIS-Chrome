'use strict';

angular.module('lmisChromeApp')
  .factory('alertsFactory', function($rootScope, $timeout) {
    $rootScope.alerts = [];

    // Examples
    //
    //    alert({type: '[type]', message: 'message'})
    //
    // ... where type is a Bootstrap alert class, see:
    // http://getbootstrap.com/components/#alerts-examples
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
      add({
        type: 'success',
        message: message
      });
    };

    var info = function(message) {
      add({
        type: 'info',
        message: message
      });
    };

    var warning = function(message) {
      add({
        type: 'warning',
        message: message
      });
    };

    var danger = function(message) {
      add({
        type: 'danger',
        message: message
      });
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
      success: success,
      info: info,
      warning: warning,
      danger: danger,
      remove: remove,
      clear: clear
    };
  });
