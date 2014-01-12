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
    * NOTE: The web store API only specifies that implementations should be able to
    * handle string values, this method will therefore stringify all values into
    * JSON strings before storing them.
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
    * NOTE: Since all values are stored as JSON strings, this method will parse the fetched
    * JSON string and return the resulting object/value.
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
      remove: false, // removeFromChrome,
      clear: false // clearChrome */
    };

  });
