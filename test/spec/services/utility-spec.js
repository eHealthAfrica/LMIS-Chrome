'use strict';

describe('Service: utility', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var utility, $filter;

  beforeEach(inject(function(_utility_, _$filter_) {
    utility = _utility_;
    $filter = _$filter_;
  }));

  it('should define utility service', function() {
    expect(utility).toBeDefined();
  });

  describe('getTimeZone', function() {
    it('should return the diff between GMT and local time zone', function() {
      var minutes = 60;
      var timezoneOffset = Math.abs(new Date().getTimezoneOffset() / minutes);
      expect(utility.getTimeZone()).toEqual(timezoneOffset);
    });
  });

  describe('getWeekRangeByDate', function() {
    it('should return the first, last and reminder date', function() {
      var today = new Date();
      var reminderDay = 5; //friday
      var NUMBER_OF_DAYS_IN_A_WEEK = 6; //starting from 0;

      var firstDayOfCurrentWeek = today.getDate() - today.getDay();

      var reminderDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        firstDayOfCurrentWeek + reminderDay, 0, 0, 0
      );

      var lastDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        firstDayOfCurrentWeek + NUMBER_OF_DAYS_IN_A_WEEK, 0, 0, 0
      );

      var firstDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        firstDayOfCurrentWeek, 0, 0, 0
      );

      var result = utility.getWeekRangeByDate(today, reminderDay);

      expect(result.first).toEqual(firstDate);
      expect(result.last).toEqual(lastDate);
      expect(result.reminderDate).toEqual(reminderDate);
    });
  });

  describe('castArrayToObject', function() {
    it('should return an object array of a given array', function() {
      var students = [
        {uuid: '2', name: 'timothy bale', age: 19}
      ];

      expect(angular.isArray(students)).toBeTruthy();
      var studentList = utility.castArrayToObject(students);
      expect(typeof studentList).toEqual('object');
      expect(angular.isArray(studentList)).toBeFalsy();
    });
  });

  describe('getFullDate', function() {
    it('should return a full date in the format YYYY-MM-dd', function() {
      var testDate = new Date();
      var expectedDate = $filter('date')(testDate, 'yyyy-MM-dd');
      expect(utility.getFullDate(testDate)).toEqual(expectedDate);
    });

    it('should support date in strings', function() {
      var testDate = new Date();
      var expectedDate = $filter('date')(testDate, 'yyyy-MM-dd');
      expect(utility.getFullDate(testDate.toJSON())).toEqual(expectedDate);
    });
  });

  describe('spaceOutUpperCaseWords', function() {
    it('should put a space between capitalized words', function() {
      var testStr = 'IceLandFreezer';
      var expectedResult = 'Ice Land Freezer';
      expect(testStr).not.toEqual(expectedResult);
      testStr = utility.spaceOutUpperCaseWords(testStr);
      expect(testStr).toEqual(expectedResult);
    });
  });

  describe('ellipsize', function() {
    it('should append an ellipsis if string is too long', function() {
      expect(angular.isFunction(utility.ellipsize)).toBe(true);
      expect(utility.ellipsize('')).toBe('');
      expect(utility.ellipsize(null)).toBe(null);
      expect(utility.ellipsize('hut')).toBe('hut');
      expect(utility.ellipsize('vicar', 4)).toBe('vic…');
      expect(utility.ellipsize('tutu', 4)).toBe('tutu');
      expect(utility.ellipsize('the soil', 7)).toBe('the so…');
      expect(utility.ellipsize('headmaster ritual', -42)).toBe('');
    });
  });

});
