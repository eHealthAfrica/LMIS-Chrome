'use strict';

angular.module('lmisChromeApp').factory('chromeStorageApi', function ($window, $q) {
  var chromeStorage;

  // Check whether chrome.storage available or not
  if ('chrome' in $window && typeof  $window.chrome.storage !== undefined) {
    chromeStorage = $window.chrome.storage.local;
  } else {
    chromeStorage = null;
  }

  return {
    set: function (obj) {
      var deferred = $q.defer();
      if (chromeStorage) {
        chromeStorage.set(obj, function () {
          if ($window.chrome.runtime.lastError !== undefined) {
            deferred.reject($window.chrome.runtime.lastError);
          } else {
            deferred.resolve(true);
          }
        });
      } else {
        deferred.reject('chrome.storage api is not available');
      }

      return deferred.promise;
    },
    /*
     * Get method should work for both cases returning particular item or entire collection.
     * @param {Object} options - if undefined, default value is return data of a particular item
     * or entire collection (if set to {collection:true})
     */
    get: function (item, options) {
      var deferred = $q.defer();
      if (chromeStorage) {
        chromeStorage.get(item, function (data) {
          if ($window.chrome.runtime.lastError !== undefined) {
            deferred.reject($window.chrome.runtime.lastError);
          } else {
            if (options && options.collection) {
              deferred.resolve(data);
            } else {
              deferred.resolve(data[item]);
            }
          }
        });
      } else {
        deferred.reject('chrome.storage api is not available');
      }

      return deferred.promise;
    },
    remove: function (items) {
      var deferred = $q.defer();
      if (chromeStorage) {
        chromeStorage.remove(items, function () {
          if ($window.chrome.runtime.lastError !== undefined) {
            deferred.reject($window.chrome.runtime.lastError);
          }else{
            deferred.resolve(true);
          }
        });
      }else {
        deferred.reject('chrome.storage api is not available');
      }
      return deferred.promise;
    },
    clear: function () {
      var deferred = $q.defer();
      if (chromeStorage) {
        chromeStorage.clear(function () {
          if ($window.chrome.runtime.lastError !== undefined) {
            deferred.reject($window.chrome.runtime.lastError);
          }else{
            deferred.resolve(true);
          }
        });
      } else {
        deferred.reject('chrome.storage api is not available');
      }
      return deferred.promise;
    }
  };
});
