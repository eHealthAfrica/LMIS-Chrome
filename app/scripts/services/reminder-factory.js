'use strict';

angular.module('lmisChromeApp')
    .factory('reminderFactory', function ($filter, utility) {

      var DAILY = 1;
      var WEEKLY = 7;
      var BI_WEEKLY = 14;
      var MONTHLY = 30;

      var hasProperty = function(obj, property){
        return typeof obj[property] !== 'undefined'
      };

      var checkObjectProperty = function (obj, property) {
        if (!hasProperty(obj, property)) {
          throw 'object does not have ' + property + ' as one of its properties.';
        }
      };

      var checkDate = function(date){
        if(angular.isDate(date)){
          throw date+' is not a date';
        }
      };

      /**
       *  This function returns true if event object's eventDateKey property equals dailyReminderDate
       *  else returns false
       *
       * @param event - an object to be check if its 'eventDateKey' equals given dailyReminderDate
       * @param eventDateKey - date property of event object to be used for comparison
       * @param dailyReminderDate - date object that
       * @returns {boolean}
       */
      var isDailyReminderDateEvent = function(obj, eventDateKey, dailyReminderDate){
        angular.isDate(dailyReminderDate)
        checkDate
        var reminderDate = dailyReminderDate || new Date();
        var dailyReminderDate = $filter('date')(reminderDate, 'yyyy-MM-dd');
        checkObjectProperty(obj, eventDateKey);
        var eventDate = $filter('date')(new Date(obj[eventDateKey]), 'yyyy-MM-dd');
        if (dailyReminderDate !== eventDate) {
          return false;
        }
        return true;
      };

      var getMonthlyReminder = function(obj, eventDateKey, monthlyReminderDate){
        var currentDate = new Date();
        var reminderDateOfTheMonth = 1;
        var monthlyReminderDate = monthlyReminderDate ||
            new Date(currentDate.getFullYear(), currentDate.getMonth(), reminderDateOfTheMonth, 0, 0, 0);

        for (var index in eventList) {
          var obj = eventList[index];
          checkObjectProperty(obj, eventDateKey);
          var eventDate = new Date(obj[eventDateKey]);

          if (monthlyReminderDate.getMonth() === eventDate.getMonth()
              && monthlyReminderDate.getFullYear() === eventDate.getFullYear()) {
            //monthly event already taken place,reminder is not necessary, return empty array
            return [];
          }
        }
        //if you get here, it means monthly reminder is due based on given event list
        return [monthlyReminderDate];
      };

      var getWeeklyReminder = function(eventList, eventDateKey, currentWeekReminderDate, today){
        today = today || new Date();
        var previousWeekReminderDate = new Date(currentWeekReminderDate.getFullYear(),
            currentWeekReminderDate.getMonth(), currentWeekReminderDate.getDate() - WEEKLY, 0, 0, 0);

        if($filter('date')(today, 'yyyy-MM-dd') < $filter('date')(currentWeekReminderDate, 'yyyy-MM-dd')){
          currentWeekReminderDate = previousWeekReminderDate;
        }
        var currentWeekReminderDateRange =
            utility.getWeekRangeByDate(currentWeekReminderDate, currentWeekReminderDate.getDay());

        var currentWeekReminderFirstDate = $filter('date')(currentWeekReminderDateRange.first, 'yyyy-MM-dd');
        var currentWeekReminderLastDate = $filter('date')(currentWeekReminderDateRange.last, 'yyyy-MM-dd');

        for(var index in eventList){
          var obj = eventList[index];
          checkObjectProperty(obj, eventDateKey);
          var eventDate = new Date(obj[eventDateKey]);
          eventDate = $filter('date')(new Date(obj[eventDateKey]), 'yyyy-MM-dd');

          if(currentWeekReminderFirstDate <= eventDate && eventDate <= currentWeekReminderLastDate){
            return [];
          }
        }
        return [currentWeekReminderDate];
      };

      var getReminder = function(mainList, eventDateKey, interval, reminderDate){
        if(interval === DAILY){
          reminderDate = new Date();
          var today = $filter('date')(reminderDate, 'yyyy-MM-dd');
          for(var index in mainList){
            var obj = mainList[index];
            checkObjectProperty(obj, eventDateKey);
            var eventDate = $filter('date')(new Date(obj['eventDateKey']), 'yyyy-MM-dd');
            if(today === eventDate){
              //event already taken place no reminder
              return null;//resolve nothing or empty list.
            }
          }
          //if you get to here, it means daily reminder is due
          return [today]

        }else if(interval === MONTHLY){
          reminderDate = $filter('date')(reminderDate, 'yyyy-MM-dd');
          for(var index in mainList){
            var obj = mainList[index];
            checkObjectProperty(obj, eventDateKey);
            var eventDate = $filter('date')(new Date(obj['eventDateKey']), 'yyyy-MM-dd');
            if(reminderDate === eventDate){
              //event already taken place no reminder
              return null;//resolve nothing or empty list.
            }
          }
          //if you get here, it means monthly reminder is due base on given collection
          return [reminderDate];

        }else if(interval === WEEKLY){
          var today = new Date();
          var thisWeekReminderDay = utility.getWeekRangeByDate(today, reminderDate.getDay());
          var lowerBoundDate =
              new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate() - WEEKLY, 0, 0, 0);

          if(today.getTime() < reminderDate.getTime()){

          }else{
            //no reminder return empty array
          }

        }

      };

      return {
        isDailyReminderDate: isDailyReminderDateEvent,
        getWeeklyReminder: getWeeklyReminder,
        getMonthlyReminder: getMonthlyReminder,
        getReminder: getReminder,
        checkObjectProperty: checkObjectProperty
      };

    });
