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
      if(chromeStorage){
        chromeStorage.set(obj, function(){
          if($window.chrome.runtime.lastError !== undefined) {
            deferred.reject();
          }
          deferred.resolve();
        });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    },
    /*
     * Get method should work for both cases returning particular item or entire collection.
     * @param {boolean} mode - whether return data of particular item (false) or entire collection (true).
     */
    get: function (item, mode) {
      var deferred = $q.defer();
      if(chromeStorage){
        chromeStorage.get(item, function(data){
          if($window.chrome.runtime.lastError !== undefined) {
            deferred.reject();
          }
          if(mode){ deferred.resolve(data);
          } else { deferred.resolve(data[item]); }
        });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    },
    remove: function (items) {
      var deferred = $q.defer();
      if(chromeStorage){
        chromeStorage.remove(items, function(){
          if($window.chrome.runtime.lastError !== undefined) {
            return deferred.reject();
          }
          deferred.resolve();
        });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    },
    clear: function () {
      var deferred = $q.defer();
      if(chromeStorage){
        chromeStorage.clear(function(){
          if($window.chrome.runtime.lastError !== undefined) {
            return deferred.reject();
          }
          deferred.resolve();
        });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    }
  };
});
