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

  describe('has', function() {
    it('should fail with inherited properties', function() {
      expect(utility.has({}, 'constructor')).toBe(false);
    });

    it('should function even if hasOwnProperty was overridden', function() {
      // jshint -W001
      var mock = {hasOwnProperty: ''};
      expect(utility.has(mock, 'constructor')).toBe(false);
    });

    it('should fail if path does not exist', function() {
      expect(utility.has({}, 'a')).toBe(false);
    });

    it('should handle nested paths', function() {
      expect(utility.has({a: {}}, 'a')).toBe(true);
      expect(utility.has({a: {b: 'c'}}, 'a.b')).toBe(true);
      expect(utility.has({a: {}}, 'b')).toBe(false);
    });

    it('should fail gracefully with invalid arguments', function() {
      expect(utility.has('')).toBe(false);
      expect(utility.has({})).toBe(false);
      expect(utility.has(null)).toBe(false);
      expect(utility.has(null, null)).toBe(false);
      expect(utility.has(undefined, '')).toBe(false);
      expect(utility.has({}, '.')).toBe(false);
      expect(utility.has({}, 'a.')).toBe(false);
    });
  });

  it('getStringUuid should return a string if given a string.', function(){
    var str = '123453-20302-133';
    expect(typeof str === 'string').toBeTruthy();
    var result = utility.getStringUuid(str);
    expect(result).toBe(str);
    expect(typeof result === 'string').toBeTruthy();
  });

  it('i expect getStringUuid to return uuid of a given object.', function(){
    var obj = {uuid: '123456-6542'};
     var result = utility.getStringUuid(obj);
    expect(result).toBe(obj.uuid);
  });

  it('i expect getStringUuid to return the given value if it is not an object.', function(){
    var undefinedVal = undefined;
    expect(undefinedVal).toBe(utility.getStringUuid(undefinedVal));
    expect(1).toBe(utility.getStringUuid(1));
    expect(null).toBe(utility.getStringUuid(null));
  });

  it('i expect copy() to throw an exception if called with non-object src and des parameters.', function(){
    var src = '12344';
    var des = 1;
    expect(function(){
      utility.copy(src, des);
    }).toThrow();
  });

  it(' i expect copy() to throw exception when called with non-object src parameter.', function(){
    var src = '1234';
    var des = { uuid: '1234' };
    expect(function(){
      utility.copy(src, des);
    }).toThrow();
  });

  it('i expect copy() to throw excpetion when called with non-object des parameter.', function(){
    var src = { uuid: '1234' };
    var des = '1234';
    expect(function(){
      utility.copy(src, des);
    }).toThrow();
  });

  it('i expect copy() to copy src object properties into des object that is returned.', function(){
    var src = {
      uuid: '12344',
      scores: [1, 2, 45, 89],
      created: new Date('123456')
    };

    var des = {
      age: '24',
      name: 'test student'
    };

    expect(des.uuid).not.toEqual(src.uuid);
    expect(des.scores).not.toEqual(src.scores);
    expect(des.created).not.toEqual(src.created);

    var des = utility.copy(src, des);

    expect(des.uuid).toEqual(src.uuid);
    expect(des.scores).toEqual(src.scores);
    expect(des.created).toEqual(src.created);

  });

});
