'use strict';

describe('Service: utility', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var utility, $filter;

  beforeEach(inject(function (_utility_, _$filter_) {
    utility = _utility_;
    $filter = _$filter_;
  }));

  it('should define utility service', function () {
    expect(utility).toBeDefined();
  });

  describe('getTimeZone', function () {
    it('should return the diff between GMT and local time zone', function () {
      var minutes = 60;
      var timezoneOffset = Math.abs(new Date().getTimezoneOffset() / minutes);
      expect(utility.getTimeZone()).toEqual(timezoneOffset);
    });
  });

  describe('getWeekRangeByDate', function () {
    it('should return the first, last and reminder date', function () {
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

  describe('castArrayToObject', function () {
    it('should return an object array of a given array', function () {
      var students = [
        {uuid: '2', name: 'timothy bale', age: 19}
      ];

      expect(angular.isArray(students)).toBeTruthy();
      var studentList = utility.castArrayToObject(students);
      expect(typeof studentList).toEqual('object');
      expect(angular.isArray(studentList)).toBeFalsy();
    });
  });

  describe('getFullDate', function () {
    it('should return a full date in the format YYYY-MM-dd', function () {
      var testDate = new Date();
      var expectedDate = $filter('date')(testDate, 'yyyy-MM-dd');
      expect(utility.getFullDate(testDate)).toEqual(expectedDate);
    });

    it('should support date in strings', function () {
      var testDate = new Date();
      var expectedDate = $filter('date')(testDate, 'yyyy-MM-dd');
      expect(utility.getFullDate(testDate.toJSON())).toEqual(expectedDate);
    });
  });

  describe('spaceOutUpperCaseWords', function () {
    it('should put a space between capitalized words', function () {
      var testStr = 'IceLandFreezer';
      var expectedResult = 'Ice Land Freezer';
      expect(testStr).not.toEqual(expectedResult);
      testStr = utility.spaceOutUpperCaseWords(testStr);
      expect(testStr).toEqual(expectedResult);
    });
  });

  describe('ellipsize', function () {
    it('should append an ellipsis if string is too long', function () {
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

  describe('has', function () {
    it('should fail with inherited properties', function () {
      expect(utility.has({}, 'constructor')).toBe(false);
    });

    it('should function even if hasOwnProperty was overridden', function () {
      // jshint -W001
      var mock = {hasOwnProperty: ''};
      expect(utility.has(mock, 'constructor')).toBe(false);
    });

    it('should fail if path does not exist', function () {
      expect(utility.has({}, 'a')).toBe(false);
    });

    it('should handle nested paths', function () {
      expect(utility.has({a: {}}, 'a')).toBe(true);
      expect(utility.has({a: {b: 'c'}}, 'a.b')).toBe(true);
      expect(utility.has({a: {}}, 'b')).toBe(false);
    });

    it('should fail gracefully with invalid arguments', function () {
      expect(utility.has('')).toBe(false);
      expect(utility.has({})).toBe(false);
      expect(utility.has(null)).toBe(false);
      expect(utility.has(null, null)).toBe(false);
      expect(utility.has(undefined, '')).toBe(false);
      expect(utility.has({}, '.')).toBe(false);
      expect(utility.has({}, 'a.')).toBe(false);
    });
  });

  describe('getStringUuid', function () {
    it('should return obj.uuid if given an obj.', function () {
      var testObj = { uuid: '1236772-suu32hhs', type: 'test object' };
      var result = utility.getStringUuid(testObj);
      var expectedResult = testObj.uuid;
      expect(result).toBe(expectedResult);
    });

    it('should return a string if given a string', function () {
      var uuid = '123487281-20199202';
      var result = utility.getStringUuid(uuid);
      expect(result).toBe(uuid);
    });

    it('should return undefined if obj does not have a uuid', function () {
      var obj = {name: 'test obj'};
      var result = utility.getStringUuid(obj);
      expect(result).toBeUndefined();
    });

    it('should return every other given data type', function () {
      var no = 1;
      var nullVal = null;
      var booleanVal = true;
      var floatVal = 2.9;

      var noUuid = utility.getStringUuid(no);
      expect(no).toBe(noUuid);

      var nullUuid = utility.getStringUuid(nullVal);
      expect(nullVal).toBe(nullUuid);

      var booleanUuid = utility.getStringUuid(booleanVal);
      expect(booleanVal).toBe(booleanUuid);

      var floatUuid = utility.getStringUuid(floatVal);
      expect(floatVal).toBe(floatUuid);

    });
  });

  describe('convertObjectToArray', function () {

    it('should return an array.', function () {
      var obj = {
        '1': {uuid: '1', name: 'obj1'},
        '2': {uuid: '2', name: 'obj2'},
        '3': {uuid: '3', name: 'obj3'}
      };

      var result = utility.convertObjectToArray(obj);
      expect(result.length).toBe(3);
      expect(result[0].uuid).toBe('1');
      expect(result[1].uuid).toBe('2');
      expect(result[2].uuid).toBe('3');
    });

  });

  describe('copy', function(){
    it('should copy src object properties into des obj.', function(){
      var src = {
        uuid: '12344',
        name: 'src obj'
      };

      var des = {
        type: 'des',
        name: 'des obj'
      };

      var result = utility.copy(src, des);
      expect(result.uuid).toBe(src.uuid);
      expect(result.name).toBe(src.name);
      expect(result.type).toBe(des.type);
    });
  });

  describe('isDate', function() {
    it('should validate string or object as valid date type', function() {
      var validDate = ['2015-01-25', new Date(), 1433251339012];
      var invalidDate = [null, 'eHA', undefined, {}, []];

      expect(utility.isDate(validDate[0])).toBeTruthy();
      expect(utility.isDate(validDate[1])).toBeTruthy();
      expect(utility.isDate(validDate[2])).toBeTruthy();
      expect(utility.isDate(invalidDate[0])).toBeFalsy();
      expect(utility.isDate(invalidDate[1])).toBeFalsy();
      expect(utility.isDate(invalidDate[2])).toBeFalsy();
      expect(utility.isDate(invalidDate[3])).toBeFalsy();
      expect(utility.isDate(invalidDate[4])).toBeFalsy();

    });
  });

});
