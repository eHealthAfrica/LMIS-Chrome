'use strict';

angular.module('lmisChromeApp')
    .factory('reminderFactory', function ($filter, utility, $rootScope) {

      var DAILY = 1;
      var WEEKLY = 7;
      var BI_WEEKLY = 14;
      var MONTHLY = 30;
      $rootScope.reminders = {};
      var id = 0;
      var stockCountReminderId = 'scReminder';

      /**
       * This adds a reminder to reminder collections.
       *
       * @param {reminder}  an object with following properties: {text, icon, type, link}
       *
       * where type is a Bootstrap alert class, see: http://getbootstrap.com/components/#alerts-examples
       */
      var add = function(reminder){
        if(typeof reminder.id === 'undefined'){
          reminder.id = generateReminderId();
        }
        $rootScope.reminders[reminder.id] = reminder;
        return reminder.id;
      };

      var generateReminderId = function(){
        id = id + 1;
        return String(id);
      };

      var remove =  function(id){
        delete $rootScope.reminders[id];
      };

      var clear = function(){
        $rootScope.reminders = {};
      };

      var get = function(id){
        return $rootScope.reminders[id];
      };

      var info = function(reminder){
        reminder.type = 'info';
        return add(reminder);
      };

      var warning = function(reminder){
        reminder.type = 'warning';
        return add(reminder);
      };

      var danger = function(reminder){
        reminder.type = 'danger';
        return add(reminder);
      };

      var success = function(reminder){
        reminder.type = 'success';
        return add(reminder);
      };

      return {
        DAILY: DAILY,
        WEEKLY: WEEKLY,
        BI_WEEKLY: BI_WEEKLY,
        MONTHLY: MONTHLY,
        info: info,
        warning: warning,
        danger: danger,
        success: success,
        clear: clear,
        remove: remove,
        get: get,
        STOCK_COUNT_REMINDER_ID: stockCountReminderId
      };

    });
