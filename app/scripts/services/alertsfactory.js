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
    var add = function(alert, options) {
      $rootScope.alerts.push(alert);
      if(options && options.persistent) {
        return;
      }
      $timeout(function() {
        var index = $rootScope.alerts.indexOf(alert);
        if(index !== -1) {
          remove(index);
        }
      }, 5000);
    };

    var success = function(message, options) {
      add({
        type: 'success',
        message: message
      }, options);
    };

    var info = function(message, options) {
      add({
        type: 'info',
        message: message
      }, options);
    };

    var warning = function(message, options) {
      add({
        type: 'warning',
        message: message
      }, options);
    };

    var danger = function(message, options) {
      add({
        type: 'danger',
        message: message
      }, options);
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
