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

