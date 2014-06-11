'use strict';

describe('Factory: reminder-factory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate factory
  var reminderFactory, $filter, utility, testEventObj, dateKey,
      nonProperty, today, WEEKLY_INTERVAL, $rootScope, reminder;

  beforeEach(inject(function (_reminderFactory_, _$filter_, _utility_, _$rootScope_) {
    reminderFactory = _reminderFactory_;
    $filter = _$filter_;
    utility = _utility_;
    $rootScope = _$rootScope_;
    testEventObj = { uuid: '1', eventDate: new Date().toJSON() };
    dateKey = 'eventDate';
    nonProperty = 'stockCountDate';//assume not to exist as property of objects
    today = new Date();
    WEEKLY_INTERVAL = 7;
    reminder = {text: 'Hello World', icon: 'images/path/to/img.png', link: 'urlName'};
  }));

  it('i expect checkObjectProperty() to throw an exception', function () {
    expect(function () {
      reminderFactory.checkObjectProperty(testEventObj, nonProperty);
    }).toThrow();
  });

  it('checkObjectProperty() should NOT throw exception', function () {

    expect(function () {
          reminderFactory.checkObjectProperty(testEventObj, dateKey);
        }
    ).not.toThrow();

  });

  it('i expect isDailyReminderDue to return FALSE ',function () {
        expect(reminderFactory.isDailyReminderDue(testEventObj, dateKey, new Date())).toBeFalsy();
      }
  );

  it('i expect isDailyReminderDue to return True', function(){
    var drDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); //next day
    expect(reminderFactory.isDailyReminderDue(testEventObj, dateKey, drDate)).toBeTruthy();
  });

  it('i expect isDailyReminderDue to throw an exception: non-existent object property', function(){
    expect(function(){
      reminderFactory.isDailyReminderDue(testEventObj, nonProperty, new Date())
    }).toThrow();
  });

  it('i expect isDailyReminderDue to throw an exception for non date object', function(){
    expect(function(){
      reminderFactory.isDailyReminderDue(testEventObj, dateKey, '2012-03-09')
    }).toThrow();
  });

  it('i expect isMonthlyReminderDue to thrown an exception: non-existent object property', function(){
    expect(function(){
      reminderFactory.isMonthlyReminderDue(testEventObj, nonProperty, new Date());
    }).toThrow();
  });

  it('i expect isMonthlyReminderDue to return FALSE', function(){
    expect(reminderFactory.isMonthlyReminderDue(testEventObj, dateKey, new Date())).toBeFalsy();
  });

  it('i expect isMonthlyReminderDue to return FALSE, when called without any reminder date.', function(){
    //by default picks new Date(currentYear, currentMonth, 1) to form monthly reminder date.
    expect(reminderFactory.isMonthlyReminderDue(testEventObj, dateKey)).toBeFalsy();
  });

  it('i expect isMonthlyReminderDue to return TRUE', function(){
    var nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    expect(reminderFactory.isMonthlyReminderDue(testEventObj, dateKey, nextMonthDate)).toBeTruthy();
  });

  it('i expect isMonthlyReminderDue to return TRUE when called year different from object.eventDate year', function(){
    var nextMonthDate = new Date(today.getFullYear() + 1, today.getMonth() + 1, today.getDate());
    expect(reminderFactory.isMonthlyReminderDue(testEventObj, dateKey, nextMonthDate)).toBeTruthy();
  });

  it('i expect isMonthlyReminderDue to be True if object.eventDate.month !== monthlyReminderDate.month', function(){
    testEventObj = {uuid: '1234', eventDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())};
    expect(reminderFactory.isMonthlyReminderDue(testEventObj, dateKey, new Date())).toBeTruthy()
  });

  it('i expect isWeeklyReminderDue to throw an exception', function(){
    expect(function(){
      reminderFactory.isWeeklyReminderDue(testEventObj, nonProperty, new Date());
    }).toThrow();
  });

  it('i expect isWeeklyReminderDue to return False', function(){
    expect(reminderFactory.isWeeklyReminderDue(testEventObj, dateKey, new Date())).toBeFalsy();
  });

  it('i expect isWeeklyReminderDue to return TRUE', function(){
    var nextWeekReminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + WEEKLY_INTERVAL);
    expect(reminderFactory.isWeeklyReminderDue(testEventObj, dateKey, nextWeekReminderDate)).toBeTruthy();
  });

  it('i expect isWeeklyReminderDue to throw exception when called with non date object', function(){
    expect(function(){
      reminderFactory.isWeeklyReminderDue(testEventObj, dateKey, '2013-12-04');
    }).toThrow();
  });

  it('i expect isBiweeklyReminderDue to throw exception when called with non property name', function(){
    expect(function(){
      reminderFactory.isBiweeklyReminderDue(testEventObj, nonProperty, new Date(), true);
    }).toThrow();
  });

  it('i expect isBiweeklyReminderDue to throw exception when called with non date object', function(){
    expect(function(){
      reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, '2013-12-04', true);
    }).toThrow();
  });

  it('i expect isBiweeklyReminderDue to return False when called with current date.', function(){
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, new Date(), false)).toBeFalsy();
  });

  it('i expect isBiweeklyReminderDue to return True when called with 2 wks back date and includes last wk = true',
      function(){
    var lastWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);//14 = days
    var includeLastWeek = true;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, lastWeekDate, includeLastWeek)).toBeTruthy();
  });

  it('i expect isBiweeklyReminderDue to return True when called with 2 wks back date and includes last wk = false',
      function(){
    var pastFortNightDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);//14 = days
    var includeLastWeek = false;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, pastFortNightDate, includeLastWeek)).toBeTruthy();
  });

  it('i expect isBiweeklyReminderDue to return TRUE when called with last wk date and includes last wk = true', function(){
    var lastWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);//7 = days
    var includeLastWeek = true;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, lastWeekDate, includeLastWeek)).toBeTruthy();
  });

  it('i expect isBiweeklyReminderDue to return FALSE when called with last wks date and includes last wk = false',
      function(){
    var lastWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);//7 = days
    var includeLastWeek = false;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, lastWeekDate, includeLastWeek)).toBeFalsy();
  });

  it('i expect isBiweeklyReminderDue to return FALSE when called with next wk date and includes last wk = true',
      function(){
    var nextWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);//7 = days
    var includeLastWeek = true;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, nextWeekDate, includeLastWeek)).toBeFalsy();
  });

  it('i expect isBiweeklyReminderDue to return TRUE when called with next wk date and includes last wk = false',
      function(){
    var nextWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);//7 = days
    var includeLastWeek = false;
    expect(reminderFactory.isBiweeklyReminderDue(testEventObj, dateKey, nextWeekDate, includeLastWeek)).toBeTruthy();
  });

  it('i expect isReminderDue to throw exception when called with unknown interval', function(){
     expect(function(){
       var unknownInterval = 98;
       reminderFactory.isReminderDue(testEventObj, dateKey, today, unknownInterval);
     }).toThrow();
  });

  it('i expect isReminderDue to FALSE when called with DAILY interval', function(){
    spyOn(reminderFactory, 'isDailyReminderDue').andCallThrough();
    var dailyInterval = 1;
    var result = reminderFactory.isReminderDue(testEventObj, dateKey, today, dailyInterval);
    expect(result).toBeFalsy();
  });

   it('i expect isReminderDue to TRUE when called with DAILY interval', function(){
    var dailyInterval = 1;
    var drDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); //next day
    var result = reminderFactory.isReminderDue(testEventObj, dateKey, drDate, dailyInterval);
    expect(result).toBeTruthy();
  });

  it('i expect isReminderDue to FALSE when called with Monthly interval', function(){
    var monthlyInterval = 30;
    var result = reminderFactory.isReminderDue(testEventObj, dateKey, today, monthlyInterval);
    expect(result).toBeFalsy();
  });

  it('i expect isReminderDue to TRUE when called with Monthly interval', function(){
    var monthlyInterval = 30;
    var nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    var result = reminderFactory.isReminderDue(testEventObj, dateKey, nextMonthDate, monthlyInterval);
    expect(result).toBeTruthy();
  });

  it('i expect isReminderDue to return False when called with Weekly Interval', function(){
    var weeklyInterval = 7;
    expect(reminderFactory.isReminderDue(testEventObj, dateKey, new Date(), weeklyInterval)).toBeFalsy();
  });

  it('i expect isReminderDue to return TRUE when called with weekly interval', function(){
    var weeklyInterval = 7;
    var nextWeekReminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + WEEKLY_INTERVAL);
    expect(reminderFactory.isReminderDue(testEventObj, dateKey, nextWeekReminderDate, weeklyInterval)).toBeTruthy();
  });

   it('i expect isReminderDue to return FALSE when called with last wks date and includes last wk = false and bi-wk',
      function(){
    var lastWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);//7 = days
    var includeLastWeek = false;
    var biWk = 14;
    expect(reminderFactory.isReminderDue(testEventObj, dateKey, lastWeekDate, biWk, includeLastWeek)).toBeFalsy();
  });

  it('i expect isReminderDue to return TRUE when called with next wk date and includes last wk = false, bi-wk interval',
      function(){
    var nextWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);//7 = days
    var includeLastWeek = false;
    var biWk = 14;
    expect(reminderFactory.isReminderDue(testEventObj, dateKey, nextWeekDate, biWk, includeLastWeek)).toBeTruthy();
  });

  it('i expect $rootScope.reminders.length to be 1 after calling info()', function(){
    var reminders = Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    reminderFactory.info(reminder);
    reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(1);
  });

  it('i expect number of reminders to be 1 after calling danger()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    reminderFactory.danger(reminder);
    reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(1);
  });

  it('i expect number of reminders to be 1 after calling success()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    reminderFactory.success(reminder);
    reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(1);
  });

  it('i expect number of reminders to be 1 after calling warning()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    reminderFactory.warning(reminder);
    reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(1);
  });

  it('i expect reminders[id].type to be "info" after calling info()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    var id = reminderFactory.info(reminder);
    expect($rootScope.reminders[id].type).toBe('info');
  });

  it('i expect reminders[id].type to be "success" after calling success()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    var id = reminderFactory.success(reminder);
    expect($rootScope.reminders[id].type).toBe('success');
  });

  it('i expect reminders[id].type to be "warning" after calling warning()', function(){
    var remindersIds =  Object.keys($rootScope.reminders);
    expect(remindersIds.length).toBe(0);
    var id = reminderFactory.warning(reminder);
    expect($rootScope.reminders[id].type).toBe('warning');
  });

  it('i expect reminders[id].type to be "danger" after calling danger()', function(){
    var reminders =  Object.keys($rootScope.reminders);
    expect(reminders.length).toBe(0);
    var id = reminderFactory.danger(reminder);
    expect( $rootScope.reminders[id].type).toBe('danger');
  });

  it('i expect number of reminders to be 0, after calling clear().', function(){
    reminderFactory.danger(reminder);
    var newReminder = angular.copy(reminder);
    delete newReminder.id;
    reminderFactory.danger(newReminder);
    expect( Object.keys($rootScope.reminders).length).toBe(2);
    reminderFactory.clear();
    expect( Object.keys($rootScope.reminders).length).toBe(0);
  });

  it('i expect number of reminders to less than previous size, after calling remove()', function(){
    var id1 = reminderFactory.danger(reminder);
    var newReminder = angular.copy(reminder);
    delete newReminder.id;
    var id2 = reminderFactory.danger(newReminder);
    expect(Object.keys($rootScope.reminders).length).toBe(2);
    reminderFactory.remove(id2);
    expect( Object.keys($rootScope.reminders).length).toBe(1);
  });

  it('i expect a reminder to be removed from reminders after calling remove(id) ', function(){
    var id1 = reminderFactory.danger(reminder);
    var newReminder = angular.copy(reminder);
    delete newReminder.id;
    var id2 = reminderFactory.danger(newReminder);
    expect(Object.keys($rootScope.reminders).length).toBe(2);
    reminderFactory.remove(id2);
    var removedReminder = $rootScope.reminders[id2];
    expect(removedReminder).toBeUndefined();
  });

  it('i expect reminder to be given an id if called without an id', function(){
    var reminder = {text: 'Hello World', icon: 'images/path/to/img.png', link: 'urlName'};
    expect(reminder.id).toBeUndefined();
    expect(Object.keys($rootScope.reminders).length).toBe(0);//empty reminder list
    var id1 = reminderFactory.danger(reminder);
    var reminder = $rootScope.reminders[id1];
    expect(reminder).toBeDefined();
  });

  it('i expect reminder id generator to generate unique id at each call', function(){
    var reminder2 = {text: 'Hello World', icon: 'images/path/to/img.png', link: 'urlName'};
    var id2 = reminderFactory.danger(reminder2);
    var reminder1 = {text: 'First Reminder', icon: 'images/path/to/img1.png', link: 'urlName1'};
    var id1 =  reminderFactory.info(reminder1);
    expect(id2).not.toEqual(id1);
  });

  it('i expect get(id) to return reminder object', function(){
    var id = reminderFactory.info(reminder);
    expect(reminder).toEqual(reminderFactory.get(id));
  });

  it('i expect reminder to retain its id, if added with an id to reminders list', function(){
    expect(reminder.id).toBeUndefined()
    reminder.id = '90872';
    var id = reminderFactory.info(reminder);
    expect(id).toBe(reminder.id);
  });

});

