'use strict';

describe('Service: utility ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var utility;

  beforeEach(inject(function(_utility_) {
    utility = _utility_;
  }));

  it('as a user, i expect utility service to be defined ', function(){
    expect(utility).toBeDefined();
  });

  it('getTimeZone shoud return a number which is the diff between GMT and local time zone', function(){
    var minutes = 60;
    var timezoneOffset = Math.abs(new Date().getTimezoneOffset() / minutes);
    expect(utility.getTimeZone()).toEqual(timezoneOffset);
  });

  it('as a user, i getWeekRangeByDate to get given date first-day and last-day and reminder date', function(){
    var today = new Date();
    var reminderDay = 5; //friday
    var firstDayOfCurrentWeek = today.getDate() - today.getDay();
    var reminderDate = new Date(today.getFullYear(), today.getMonth(), firstDayOfCurrentWeek + reminderDay, 0, 0, 0);
    var NUMBER_OF_DAYS_IN_A_WEEK = 6; //starting from 0;
    var lastDate = new Date(today.getFullYear(), today.getMonth(),
        firstDayOfCurrentWeek + NUMBER_OF_DAYS_IN_A_WEEK, 0, 0, 0);
    var firstDate = new Date(today.getFullYear(), today.getMonth(), firstDayOfCurrentWeek, 0, 0, 0);

    var result = utility.getWeekRangeByDate(today, reminderDay);

    expect(result.first).toEqual(firstDate);
    expect(result.last).toEqual(lastDate);
    expect(result.reminderDate).toEqual(reminderDate);
  });

  it('as a user, i expect castArrayToObject to return object array of a given array', function(){
    var students = [
      {uuid: '2', name: 'timothy bale', age: 19}
    ];

    expect(angular.isArray(students)).toBeTruthy();
    var studentList = utility.castArrayToObject(students);
    expect(typeof studentList).toEqual('object');
    expect(angular.isArray(studentList)).toBeFalsy();

  });

});
