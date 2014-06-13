'use strict';

angular.module('lmisChromeApp')
    .factory('alertFactory', function ($filter, utility, $rootScope) {

      $rootScope.alerts = {};//TODO, change to use session or cache instead of $rootScope.
      var id = 0;

      var types = {
        warning: 'warning',
        info: 'info',
        danger: 'danger',
        success: 'success'
      };

      var add = function(alert){
        if(typeof alert.id === 'undefined'){
          alert.id = generateId();
        }
        $rootScope.alerts[alert.id] = alert;
        return alert.id;
      };

      var getAll = function(){
       return $rootScope.alerts;
      };

      var generateId = function(){
        id = id + 1;
        return String(id);
      };

      var remove =  function(id){
        delete $rootScope.alerts[id];
      };

      var clear = function(){
        $rootScope.alerts = {};
      };

      var get = function(id){
        return $rootScope.alerts[id];
      };

      var info = function(msg){
        var reminder = {msg: msg};
        reminder.type = types.info;
        return add(reminder);
      };

      var warning = function(msg){
        var reminder = {msg: msg};
        reminder.type = types.warning;
        return add(reminder);
      };

      var danger = function(msg){
        var reminder = {msg: msg};
        reminder.type = types.danger;
        return add(reminder);
      };

      var success = function(msg){
        var reminder = {msg: msg};
        reminder.type = types.success;
        return add(reminder);
      };

      return {
        types: types,
        getAll: getAll,
        info: info,
        warning: warning,
        danger: danger,
        success: success,
        clear: clear,
        remove: remove,
        get: get
      };

    });
