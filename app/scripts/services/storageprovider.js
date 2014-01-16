'use strict';

angular.module('lmisChromeApp')
  .factory('storageService', function ($q, $rootScope) {

    /**
     * Boolean flag indicating client support for Chrome Storage
     * @private
     */
    var hasChromeStorage = testChromeStorage();

    /**
     * Boolean flag indicating client access to API Storage
     * @private
     */
    var hasApiStorage = testApiStorage();

    /**
    * Add the specified key/value pair to the local web store.
    *
    * @param {string} key The name to store the value under.
    * @param {mixed} value The value to set (all values are stored as JSON.)
    * @return {Promise} return promise object
    * @private
    */
    function addToStore(key, value) {
      var newStorage = {};
      var defered = $q.defer();
      newStorage[key]= value;

      if (hasChromeStorage) {
        chrome.storage.local.set(newStorage, function() {
          console.log("saved: " + key);
          defered.resolve();
          if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
        });
        return defered.promise;
      }
      return null; // defer.reject?
    }

    /**
    * Get the specified value from the local web store.
    *
    * @param {string} key The name of the value.
    * @return {Promise} Promise to be resolved with the settings object
    * @private
    */
    function getFromStore(key) {
      var defered = $q.defer();
      if (hasChromeStorage) {
        chrome.storage.local.get(key, function(data) {
          console.log("getFromChrome: " + key);
          defered.resolve(data[key] || {});
          if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
        });
        return defered.promise;
      }
      return null;
    }

    /**
    * Get All data from from the local web store.
    *
    * @return {Promise} Promise to be resolved with the settings object
    * @private
    */
    function getAllFromStore() {
      var defered = $q.defer();
      if (hasChromeStorage) {
        chrome.storage.local.get(null, function(data) {
          console.log("getAllFromChrome" );
          defered.resolve(data);
          if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
        });
        return defered.promise;
      }
      return null;
    }

    /**
    * Remove the specified value from the local web store.
    *
    * @param {string} key The name of the value.
    * @return {Promise} Promise to be resolved with the settings object
    * @private
    */
    function removeFromStore(key) {
      var defered = $q.defer();
      if (hasChromeStorage) {
        chrome.storage.local.get(key, function() {
          console.log("removeFromChrome: " + key);
          defered.resolve();
          if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
        });
        return defered.promise;
      }
      return null;
    }

    /**
    * Clear all data from storage (will not work on API).
    *
    * @return {Promise} Promise to be resolved with the settings object
    * @private
    */
    function clearFromStore() {
      var defered = $q.defer();
      if (hasChromeStorage) {
        chrome.storage.local.clear(function() {
          console.log("clearFromChrome");
          defered.resolve();
          if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
        });
        return defered.promise;
      }
      return null;
    }

    /**
     * Test the client's support for storing values in the local store.
     *
     * @return {boolean} True if the client has support for the local store, else false.
     * @private
     */
    function testChromeStorage() {
      try {
        chrome.storage.local.set({'angular.chromeStorage.test': true}, function() {
          console.log('set: success');
        });
        chrome.storage.local.remove('angular.chromeStorage.test', function() {
          console.log('remove: success');
        });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    /**
     * Test the client's support for storing values in the local store.
     *
     * @return {boolean} True if the client can access the API with the Key, else false.
     * @private
     */
    function testApiStorage() {
        return false;
    }

    return {
      isSupported: hasChromeStorage,
      add: addToStore,
      get: getFromStore,
      getAll: getAllFromStore,
      remove: removeFromStore, // removeFromChrome,
      clear: clearFromStore // clearChrome */
    };

  });
