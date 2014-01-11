'use strict';

angular.module('lmisChromeApp', ['ngResource'])
    .provider('storageProvider', function () {

        // Method for instantiating
        this.$get = ['$rootScope', function ($rootScope) {
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

            var appStorage = {
                chromeStore: {
                    isSupported: hasChromeStorage,
                    add: addToChrome,
                    get: getFromChrome,
                    remove: false, // removeFromChrome,
                    clear: false // clearChrome
                },
                apiStore: {
                    isSupported: hasApiStorage,
                    add: false, //addToApi,
                    get: false, //getFromApi,
                    remove: false, //removeFromApi,
                    clear: false // should return warning/error
                }
            };

            /**
             * Test the client's support for storing values in the local store.
             *
             * @return {boolean} True if the client has support for the local store, else false.
             * @private
             */
            function testChromeStorage() {
                try {
                    chrome.storage.local.set({'angular.chromeStorage.test': true}, function() {
                        $rootScope.$emit('chromeStorageSuccess');
                    });
                    chrome.storage.remove('angular.chromeStorage.test', function() {
                        $rootScope.$emit('chromeStorageSuccess');
                    });
                    return true;
                } catch (e) {
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

            /**
             * Setter for the key/value web store.
             *
             * NOTE: This method will use local or session storage depending on the
             * client's support as well as the order set in the module constant
             * 'order'. If 'allEngines' is true (default is false) then the key/value
             * pair will be added to all available storage engines.
             *
             * @param {string} key Name to store the given value under.
             * @param {mixed} value The value to store.
             * @param {string} EMIT_STR event name to emit
             * @return {boolean} True on success, else false.
             */
            appStorage.add = function(key, value, EMIT_STR) {
                var result = false;

                var engine = appStorage[0];
                if (engine.isSupported) {
                    result = engine.add(key, value, EMIT_STR) || result;
                }

                return result;
            };

            /**
            * Getter for the key/value web store.
            *
            * NOTE: This method will use local or session storage depending on the
            * client's support as well as the order set in the module constant 'order'.
            * If 'allEngines' is false (default is true) then only the first supported
            * storage engine will be queried for the specified key/value, otherwise all
            * engines will be queried in turn until a non-null value is returned.
            *
            * @param {string} key Name of the value to retrieve.
            * @param {string} EMIT_STR event to emit
            * @return {mixed} The value previously added under the specified key,
            *   else null.
            */
            appStorage.get = function (key, EMIT_STR) {
                var engine = appStorage[0];
                if (engine.isSupported) {
                    var value = engine.get(key, EMIT_STR);
                    return value;
                }
                return null;
            };

            /**
            * Add the specified key/value pair to the local web store.
            *
            * NOTE: The web store API only specifies that implementations should be able to
            * handle string values, this method will therefore stringify all values into
            * JSON strings before storing them.
            *
            * @param {string} key The name to store the value under.
            * @param {mixed} value The value to set (all values are stored as JSON.)
            * @param {string} EMIT_STR event name to emit
            * @return {boolean} True on success, else false.
            * @private
            */
            function addToChrome(key, value, EMIT_STR) {
                if (hasChromeStorage) {
                    var newStorage = {};
                    newStorage[key]= value;
                    try {
                        chrome.storage.local.set(newStorage, function() {
                            if (!!EMIT_STR) {
                                $rootScope.$emit(EMIT_STR)
                            }
                        });
                    } catch (e) {
                        return false; // croak(e);
                    }
                    return true;
                }
                return false;
            }

            /**
            * Get the specified value from the local web store.
            *
            * NOTE: Since all values are stored as JSON strings, this method will parse the fetched
            * JSON string and return the resulting object/value.
            *
            * @param {string} key The name of the value.
            * @param {string} EMIT_STR The name of the value.
            * @return {mixed} The value previously added under the specified key, else null.
            * @private
            */
            function getFromChrome(key, EMIT_STR) {
                if (hasChromeStorage) {
                    try {
                        chrome.storage.local.get(key, function(data) {
                            $rootScope.$emit(EMIT_STR, data[key]);
                            return data[key];
                        });

                    } catch (e) {
                        //croak(e);
                        return null;
                    }
                }
                return null;
            }

            return appStorage;
        }];
  });
