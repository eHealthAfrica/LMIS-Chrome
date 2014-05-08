'use strict';

angular.module('lmisChromeApp')
    .factory('reminderFactory', function ($filter, utility) {

      var DAILY = 1;
      var WEEKLY = 7;
      var BI_WEEKLY = 14;
      var MONTHLY = 30;
      var reminders = [];

      /**
       * This adds a reminder to reminder collections.
       *
       * @param {reminder}  an object with following properties: text, icon, type, link
       */
      var add = function(reminder){
        reminders.push(reminder);
      };

      var hasProperty = function(obj, property){
        return typeof obj[property] !== 'undefined'
      };

      var checkObjectProperty = function (obj, property) {
        if (!hasProperty(obj, property)) {
          throw 'object does not have ' + property + ' as one of its properties.';
        }
      };

      var checkDate = function(date){
        if(!angular.isDate(date)){
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
      var isDailyReminderDue = function(obj, eventDateKey, dailyReminderDate){
        checkDate(dailyReminderDate);
        dailyReminderDate = $filter('date')(dailyReminderDate, 'yyyy-MM-dd');
        checkObjectProperty(obj, eventDateKey);
        var eventDate = $filter('date')(new Date(obj[eventDateKey]), 'yyyy-MM-dd');
        return (dailyReminderDate !== eventDate);
      };

      /**
       * This returns FALSE if 1) obj.eventDateKey.month === monthlyReminderDate.month AND
       * 2). obj.eventDateKey.year === monthlyReminderDate.month.
       *
       * if monthly reminder is not given it used current year, current month and 1 to form monthly reminder date.
       *
       * @param {object} obj - object with eventDateKey as its property.
       * @param {string} eventDateKey - string that is property of obj.
       * @param monthlyReminderDate
       * @returns {boolean}
       */
      var isMonthlyReminderDue = function(obj, eventDateKey, monthlyReminderDate){
        var today = new Date();
        var reminderDateOfTheMonth = 1;
        monthlyReminderDate = monthlyReminderDate ||
            new Date(today.getFullYear(), today.getMonth(), reminderDateOfTheMonth, 0, 0, 0);

        checkObjectProperty(obj, eventDateKey);
        var eventDate = new Date(obj[eventDateKey]);
        return !(monthlyReminderDate.getMonth() === eventDate.getMonth()
            && monthlyReminderDate.getFullYear() === eventDate.getFullYear());
      };

      /**
       *  This checks if given obj weekly reminder is due, weekly reminder is due if given obj[eventDateKey] falls
       *  within weekReminderDate's week first day date and last day date.
       *
       * @param obj
       * @param eventDateKey
       * @param weekReminderDate
       * @returns {boolean}
       */
      var isWeeklyReminderDue = function(obj, eventDateKey, weekReminderDate){
        var weekReminderDateInfo = utility.getWeekRangeByDate(weekReminderDate, weekReminderDate.getDay());

        checkObjectProperty(obj, eventDateKey);
        checkDate(weekReminderDate);
        var eventDate = $filter('date')(new Date(obj[eventDateKey]), 'yyyy-MM-dd');
        var weekReminderDateFirstDate = $filter('date')(weekReminderDateInfo.first, 'yyyy-MM-dd');
        var weekReminderDateLastDate = $filter('date')(weekReminderDateInfo.last, 'yyyy-MM-dd');
        return !(weekReminderDateFirstDate <= eventDate && eventDate <= weekReminderDateLastDate);
      };

      var isBiweeklyReminderDue = function(obj, eventDateKey, biWkRemDate, includePreviousWeek){
        checkDate(biWkRemDate);
        checkObjectProperty(obj, eventDateKey);
        var biWkRemInfo = utility.getWeekRangeByDate(biWkRemDate, biWkRemDate.getDay());
        var biWeeklyDateRange;

        if(includePreviousWeek){
          var prevWkRemDate = new Date(biWkRemDate.getFullYear(), biWkRemDate.getMonth(),biWkRemDate.getDate() - WEEKLY);
          var previousWeekInfo = utility.getWeekRangeByDate(prevWkRemDate, biWkRemDate.getDay());
          biWeeklyDateRange = {start: previousWeekInfo.first, end: biWkRemInfo.last};

        }else{

          var nextWkRemDate =
              new Date(biWkRemDate.getFullYear(), biWkRemDate.getMonth(), biWkRemDate.getDate() +  WEEKLY);
          var nextWkInfo = utility.getWeekRangeByDate(nextWkRemDate, biWkRemDate.getDay());
          biWeeklyDateRange = {start: biWkRemInfo.first, end: nextWkInfo.last}
        }

        var eventDate = $filter('date')(new Date(obj[eventDateKey]), 'yyyy-MM-dd');
        var bwStartDate = $filter('date')(biWeeklyDateRange.start, 'yyyy-MM-dd');
        var bwEndDate = $filter('date')(biWeeklyDateRange.end, 'yyyy-MM-dd');
        return !(bwStartDate <= eventDate  && eventDate <= bwEndDate);
      };

      var isReminderDue =  function(obj, dateKey, rmDate, interval, includePreviousWeek){
        switch (interval) {
          case DAILY:
            return isDailyReminderDue(obj, dateKey, rmDate);
          case WEEKLY:
            return isWeeklyReminderDue(obj, dateKey, rmDate);
          case BI_WEEKLY:
            return isBiweeklyReminderDue(obj, dateKey, rmDate, includePreviousWeek);
          case MONTHLY:
            return isMonthlyReminderDue(obj, dateKey, rmDate);
          default:
            throw 'Unknown reminder interval';
        }
      };

      return {
        isDailyReminderDue: isDailyReminderDue,
        isMonthlyReminderDue: isMonthlyReminderDue,
        isWeeklyReminderDue: isWeeklyReminderDue,
        isBiweeklyReminderDue: isBiweeklyReminderDue,
        checkObjectProperty: checkObjectProperty,
        isReminderDue: isReminderDue
      };

    });
