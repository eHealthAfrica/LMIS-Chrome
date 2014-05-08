'use strict';

ddescribe('Factory: reminder-factory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate factory
  var reminderFactory, $filter, utility, copObj, dateKey, nonProperty;

  beforeEach(inject(function (_reminderFactory_, _$filter_, _utility_) {
    reminderFactory = _reminderFactory_;
    $filter = _$filter_;
    utility = _utility_;
    copObj = { uuid: '1', eventDate: new Date().toJSON() };
    dateKey = 'eventDate';
    nonProperty = 'stockCountDate';
  }));

  it('i expect checkObjectProperty() to throw an exception', function () {
    expect(function () {
      reminderFactory.checkObjectProperty(copObj, nonProperty);
    }).toThrow();
  });

  it('checkObjectProperty() should NOT throw exception', function () {

    expect(function () {
          reminderFactory.checkObjectProperty(copObj, dateKey);
        }
    ).not.toThrow();

  });

  it('i expect isDailyReminderDateEvent to return TRUE ',
      function () {
        expect(reminderFactory.isDailyReminderDate(copObj, dateKey, new Date())).toBeTruthy();
      }
  );

  it('i expect isDailyReminderDateEvent to return False', function(){
    var today = new Date();
    var eventObj = { uuid: '12', eventDate: today.toJSON() };
    var drDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); //next day
    expect(reminderFactory.isDailyReminderDate(eventObj, dateKey, drDate)).toBeFalsy();
    expect(reminderFactory.isDailyReminderDate(eventObj, dateKey, drDate)).toBeFalsy();
  });

  it('i expect isDailyReminderDateEvent to throw an exception', function(){
    expect(function(){
      reminderFactory.isDailyReminderDate(copObj, nonProperty, new Date())
    }).toThrow();
  });



});
