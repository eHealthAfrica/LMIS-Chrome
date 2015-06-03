'use strict';

angular.module('lmisChromeApp')
  .service('utility', function ($location, $anchorScroll, $filter) {

    /**
     * This spaces out string concatenated by -
     * @param {string} name - string to be re-formatted
     * @returns {XML|string}
     */
    this.getReadableProfileName = function (name) {
      //TODO: deprecate
      return name
        .replace(/\-/g, ' - ')
        .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
        .replace(/([a-z][a-z])([A-Z])/g, '$1 $2');
    };

    /**
     * this returns the local time-zone difference from GMT.
     */
    this.getTimeZone = function () {
      //TODO: deprecate, no longer in use.

      //TODO: this needs to be a global function with better timezone calculation
      //TODO: ref https://bitbucket.org/pellepim/jstimezonedetect
      var tz = new Date().getTimezoneOffset() / 60;
      if (tz < 0) {
        return parseInt('+' + Math.abs(tz), 10);
      } else {
        return parseInt('-' + Math.abs(tz), 10);
      }
    };

    /**
     *
     * @param {object} array
     * @param {string} id will be the object key
     * @returns {{}}
     */
    this.castArrayToObject = function (array, id) {
      id = angular.isUndefined(id) ? 'uuid' : id;
      var newObject = {};
      if (Object.prototype.toString.call(array) === '[object Array]') {
        for (var i = 0; i < array.length; i++) {
          newObject[array[i][id]] = array[i];
        }
      }
      return newObject;
    };

    this.getWeekRangeByDate = function (date, reminderDay) {
      var currentDate = date;
      // First day of current week is assumed to be Sunday, if current date is
      // 19-12-2014, which is Thursday = 4, then date of first day of current week
      // = 19 - 4 = 15-12-2014 which is Sunday
      var firstDayOfCurrentWeek = currentDate.getDate() - currentDate.getDay();
      var FIRST_DAY_AND_LAST_DAY_DIFF = 6;
      var lastDayOfCurrentWeek = firstDayOfCurrentWeek +
        FIRST_DAY_AND_LAST_DAY_DIFF;

      var firstDayDateOfCurrentWeek = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        firstDayOfCurrentWeek, 0, 0, 0
      );

      var lastDayDateOfCurrentWeek = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        lastDayOfCurrentWeek, 0, 0, 0
      );

      var reminderDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        firstDayOfCurrentWeek + reminderDay, 0, 0, 0
      );

      return {
        'first': firstDayDateOfCurrentWeek,
        'last': lastDayDateOfCurrentWeek,
        'reminderDate': reminderDate
      };

    };

    /**
     * This function scrolls to top of the page where it is called,
     *
     * #see 'top' is the id of a href element defined in views/index/index.html
     */
    this.scrollToTop = function () {
      $location.hash('top');
      $anchorScroll();
    };

    var isDateObject = function (date) {
      return Object.prototype.toString.call(date) === '[object Date]';
    };

    this.getFullDate = function (date) {
      //TODO: add validation for invalid date object.
      if (!isDateObject(date)) {
        date = new Date(date);//create date object
      }
      return $filter('date')(date, 'yyyy-MM-dd');
    };

    var removeObjFromCollection = function (obj, collection, key) {
      collection = collection.filter(function (item) {
        if (typeof item[key] === 'undefined' || typeof obj[key] === 'undefined') {
          throw 'both objects compared must have the property(key).';
        }
        return item[key] !== obj[key];
      });
      return collection;
    };

    this.addObjectToCollection = function (obj, collections, key) {
      var _obj = JSON.parse(obj);
      if (_obj.deSelected === undefined) {
        collections.push(_obj);
        return collections;
      }
      return removeObjFromCollection(_obj, collections, key);
    };

    this.spaceOutUpperCaseWords = function (upperCaseWord) {
      return upperCaseWord.split(/(?=[A-Z])/).join(' ');
    };

    this.copy = function (src, des) {
      if (typeof src !== 'undefined') {
        //src obj already exists, update des obj.
        for (var key in src) {
          des[key] = src[key];
        }
      }
      return des;
    };

    this.ellipsize = function (string, length) {
      if (length < 1) {
        return '';
      }
      if (string && string.length > length) {
        string = string.substr(0, length - 1) + '…';
      }
      return string;
    };

    /**
     * Does the object contain the given key(s)?
     *
     * The same as {@link http://underscorejs.org/#has}, but supports nested keys.
     *
     * @param {object} obj an object
     * @param {string} path a key (or keys) in the object, e.g. 'a.b.c'
     * @return {boolean} true if obj contains path(s), otherwise false
     */
    this.has = function (obj, path) {
      if (!(obj && path)) {
        return false;
      }

      path = path.split('.').reverse();
      for (var i = path.length - 1; i >= 0; i--) {
        if (!Object.prototype.hasOwnProperty.call(obj, path[i])) {
          return false;
        }
        obj = obj[path[i]];
      }
      return true;
    };

    /**
     * This accepts an object, iterates over the objects keys and push the value into an array.
     * @param obj
     * @returns {Array}
     */
    this.convertObjectToArray = function (obj) {
      var list = [];
      for (var key in obj) {
        var data = obj[key];
        list.push(data);
      }
      return list;
    };

    this.getStringUuid = function (uuidObj) {
      var uuidString = uuidObj;
      if (typeof uuidObj === 'string') {
        uuidString = uuidObj;
      } else if (Object.prototype.toString.call(uuidObj) === '[object Object]') {
        uuidString = uuidObj.uuid;
      }
      return uuidString;

    };

    this.values = function(obj) {
      var values = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          values.push(obj[key]);
        }
      }
      return values;
    };

    this.uuidGenerator = function() {
      var now = Date.now();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // jshint bitwise: false
        var r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
    };

    this.pluck = function(arr, key) {
      return arr.map(function(e) {
        return e[key];
      });
    };

    this.getDateTime = function() {
      return new Date().toJSON();
    };

    // http://stackoverflow.com/a/1885660
    // Expects arrays `a` and `b` to be sorted
    // TODO: remove. See item:751
    this.intersection = function(a, b) {
      var ai=0, bi=0;
      var result = [];
      while(ai < a.length && bi < b.length) {
         if      (a[ai] < b[bi] ){ ai++; }
         else if (a[ai] > b[bi] ){ bi++; }
         else {
           result.push(a[ai]);
           ai++;
           bi++;
         }
      }
      return result;
    };

    // http://underscorejs.org/#pick
    // TODO: remove. See item:751
    this.pick = function(obj, needles) {
      var picked = {};
      var haystack = Object.keys(obj);
      var intersection = this.intersection(haystack.sort(), needles.sort());
      intersection.forEach(function(key) {
        picked[key] = obj[key];
      });
      return picked;
    };

    /**
     *
     * @param date
     * @returns {boolean}
     */

    this.isDate = function(date) {
      return new Date(date) !== 'Invalid Date';
    };

    /**
     *
     * @param object
     * @returns {boolean}
     */

    this.isEmptyObject = function(object) {
      object = angular.isObject(object) ? object : {};
      return (Object.keys(object)).length === 0 ;
    };

  });
