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
          //console.log("getFromChrome: " + key);
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
          //console.log("getAllFromChrome" );
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
          //console.log('set: success');
        });
        chrome.storage.local.remove('angular.chromeStorage.test', function() {
          //console.log('remove: success');
        });
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    /**
     * get list of tables from local storage.
     *
     * @return {string} yyyy-MMMM-dd H:m:s  of current date and time.
     * @private
     */

    function getDateTime(){
        var now = new Date();
        var day = now.getDate();
        day = day<10?'0'+day:day;
        var month = now.getMonth()+1;
        month = month<10?'0'+month:month;
        var year = now.getFullYear();
        var hour = now.getHours();
        hour = hour<10?'0'+hour:hour;
        var minutes = now.getMinutes();
        minutes = minutes<10?'0'+minutes:minutes;
        var seconds = now.getSeconds();
        seconds = seconds<10?'0'+seconds:seconds;
        var datetime = year+'-'+month+'-'+day+' '+hour+':'+minutes+':'+seconds;
        return datetime;
    }

     /**
     * get list of tables from local storage.
     *
     * @return {array} array list of tables in local storage.
     * @private
     */
    function getTables(){
        var deferred = $q.defer();
        getAllFromStore().then(function(data){
            var tbl = Object.keys(data);
            deferred.resolve(tbl);
        });
        return deferred.promise;
     }

     function insert(table, obj){
       var deferred = $q.defer();
       getTables().then(function(tables){
           if(tables.indexOf(table)){
                getFromStore(table).then(function(data){
                    if(Object.prototype.toString.call(data) == '[object Array]'){
                        data.push(obj);
                        obj['uuid'] = uuid_generator();
                        obj['created'] = getDateTime();
                        addToStore(table, data);
                    }
                });
           }
           else{
               addToStore(table, [data]);
               deferred.resolve(true);
           }
       });
       return deferred.promise;
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

    function  uuid_generator () {
        var now = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (now + Math.random()*16)%16 | 0;
            now = Math.floor(now/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
      }
    return {
      isSupported: hasChromeStorage,
      add: addToStore,
      get: getFromStore,
      getAll: getAllFromStore,
      remove: removeFromStore, // removeFromChrome,
      clear: clearFromStore, // clearChrome */
      uuid: uuid_generator,
      insert: insert
    };

  });
