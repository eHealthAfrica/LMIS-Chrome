'use strict';

angular.module('lmisChromeApp')
  .factory('storageService', function($q, $rootScope, $http) {
    /**
     *  Global variables used to define table names, with this there will be one
     *  point in the code to add and/or update local storage table names.
     *
     *  table names are matched to the corresponding json file at fixtures
     *  folder that holds data used to pre-fill local storage if it is empty.
     *
     */
    var product = 'products',
        productCategory = 'product_category',
        address = 'address',
        uom = 'uom',
        uomCategory = 'uom_category',
        facility = 'facility',
        program = 'programs',
        programProducts = 'program_products',
        facilityType = 'facility_type',
        employeeCategory = 'employee_category',
        company = 'company',
        companyCategory = 'company_category',
        currency = 'currencies',
        employee = 'employee',
        rate = 'rate',
        storageLocationType = 'storage_location_type',
        storageLocation = 'storage_locations',
        user = 'user',
        productPresentation = 'product_presentation',
        productFormulation = 'product_formulations',
        modeOfAdministration = 'mode_of_administration',
        productItem = 'product_items',
        storageLocationProblem = 'cce_problems',
        storageLocationTemperature = 'storage_location_temperature_logs',
        productProfile = 'product_profiles',
        inventory = 'inventory',
        orders = 'orders';

    /**
     * Test the client's support for storing values in the local store.
     *
     * @return {boolean} True if the client has support for the local store, else false.
     * @private
     */
    function testChromeStorage() {
      try {
        chrome.storage.local.set({
          'angular.chromeStorage.test': true
        }, function() {
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
     * Test the client's support for storing values in the local store.
     *
     * @return {boolean} True if the client can access the API with the Key, else false.
     * @private
     */
    function testApiStorage() {
      return false;
    }

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
      newStorage[key] = value;

      if (hasChromeStorage) {
        chrome.storage.local.set(newStorage, function() {
          console.log('saved: ' + key);
          defered.resolve();
          if (!$rootScope.$$phase) {
            // flush evalAsyncQueue
            $rootScope.$apply();
          }
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
          //console.log('getFromChrome: ' + key);
          defered.resolve(data[key] || {});
          if (!$rootScope.$$phase) {
            // flush evalAsyncQueue
            $rootScope.$apply();
          }
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
          //console.log('getAllFromChrome' );
          defered.resolve(data);
          if (!$rootScope.$$phase) {
            // flush evalAsyncQueue
            $rootScope.$apply();
          }
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
          console.log('removeFromChrome: ' + key);
          defered.resolve();
          if (!$rootScope.$$phase) {
            // flush evalAsyncQueue
            $rootScope.$apply();
          }
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
          console.log('clearFromChrome');
          defered.resolve();
          if (!$rootScope.$$phase) {
            // flush evalAsyncQueue
            $rootScope.$apply();
          }
        });
        return defered.promise;
      }
      return null;
    }

    /**.
     * @return {string} yyyy-MMMM-dd H:m:s  of current date and time.
     * @private
     */
    function getDateTime() {
      var now = new Date();
      var day = now.getDate();
      day = day < 10 ? '0' + day : day;
      var month = now.getMonth() + 1;
      month = month < 10 ? '0' + month : month;
      var year = now.getFullYear();
      var hour = now.getHours();
      hour = hour < 10 ? '0' + hour : hour;
      var minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var seconds = now.getSeconds();
      seconds = seconds < 10 ? '0' + seconds : seconds;
      var datetime = year + '-' + month + '-' + day + ' ' + hour + ':' +
        minutes + ':' + seconds;
      return datetime;
    }

    /**
     * get list of tables from local storage.
     *
     * @return {array} array list of tables in local storage.
     * @private
     */
    function getTables() {
      var deferred = $q.defer();
      getAllFromStore().then(function(data) {
        var tbl = Object.keys(data);
        deferred.resolve(tbl);
      });
      return deferred.promise;
    }

    /**
     * Add new or update database table row.
     *
     * XXX: This needs refactoring.
     *
     * @return {promise} promise to access data from local storage.
     * @private
     */
    function insert(table, obj) {

      var deferred = $q.defer();
      getTables().then(function(tables) {
        if (tables.indexOf(table)) {
          console.log();
          getFromStore(table).then(function(data) {

            // jshint camelcase: false
            if (Object.prototype.toString.call(data) === '[object Array]') {
              console.log(data);

              var object_keys = Object.keys(obj);
              var object_uuid = object_keys.indexOf('uuid') !== -1 ? obj.uuid : '';
              object_uuid = (object_uuid === '') ? false : true;

              var uuid_test = false;
              if (object_uuid) {
                if (data[parseInt(obj.array_index)] === undefined) {
                  uuid_test = false;
                } else if (data[parseInt(obj.array_index)].uuid !== obj.uuid) {
                  uuid_test = false;
                } else {
                  uuid_test = true;
                }
              }
              if (object_uuid && uuid_test) {

                console.log('updated');
                obj.modified = getDateTime();
                data[parseInt(obj.array_index)] = obj;
                //console.log( data[parseInt(obj['array_index'])] );
                //addToStore(table, data);
              } else {
                console.log('new save 1');
                obj.uuid = (Object.keys(obj).indexOf('uuid') !== -1) ? obj.uuid : uuidGenerator();
                obj.created = getDateTime();
                obj.array_index = data.length === undefined ? 0 : data.length;
                data.push(obj);
                addToStore(table, data);
              }
              deferred.resolve(true);
            } else {
              console.log('new save 2 no array');
              obj.uuid = (Object.keys(obj).indexOf('uuid') !== -1) ? obj.uuid : uuidGenerator();
              obj.created = getDateTime();
              obj.array_index = data.length === undefined ? 0 : data.length;
              addToStore(table, [obj]);
              deferred.resolve(true);
            }
          });
        } else {
          // FIXME: data isn't defined here
          var data = [];

          console.log('new save 2 no table');
          obj.uuid = (Object.keys(obj).indexOf('uuid') !== -1) ? obj.uuid : uuidGenerator();
          obj.created = getDateTime();
          // jshint camelcase: false
          obj.array_index = data.length === undefined ? 0 : data.length;
          addToStore(table, [obj]);
          deferred.resolve(true);
          //console.log('new entry');
        }
      });
      return deferred.promise;
    }

    /**
     * Loads fixtures on app startup.
     *
     * @param void
     * @returns {void}
     */
    function loadFixtures() {
      var database = [
        product,
        address,
        uom,
        uomCategory,
        facility,
        program,
        programProducts,
        facilityType,
        employeeCategory,
        company,
        companyCategory,
        currency,
        employee,
        rate,
        storageLocationType,
        storageLocation,
        user,
        productCategory,
        productPresentation,
        productFormulation,
        modeOfAdministration,
        productItem,
        orders
      ];

      function loadData(db) {
        var testData = [];

        getFromStore(db).then(function(data) {
            testData = data;
            if (testData.length === 0 || testData.length === undefined) {

              var file = 'scripts/fixtures/' + db + '.json';
              $http.get(file).success(function(data) {
                addToStore(db, data);
                //console.log(data);
                //loadRelatedObject(db);

              }).error(function(err) {
                console.log(err);
              });
            } else {
              console.log(db + ' is loaded with ' + testData.length);
              //loadRelatedObject(db);
            }

          },
          function(reason) {
            console.log(reason);
          }
        );
      }

      for (var i in database) {
        loadData(database[i]);
      }
    }

    /**
     * Converts table array to object using uuid as key for data row,
     * also appends array index (array_index) to each row
     *
     * @param db
     * @returns {promise}
     */
    function loadRelatedObject(db) {
      var deferred = $q.defer();
      //create a new table name by prefixing the original with 're'
      var relatedName = 're_' + db;
      //when called get data from storage and create an object using uuid as key
      getFromStore(db).then(function(data) {
        if (data.length !== 0 && data.length !== undefined) {
          //load table data into object
          var relatedObject = {};
          for (var k in data) {
            if (Object.prototype.toString.call(data[k]) ===
              '[object Object]') {
              //var keys = Object.keys(data[k]);
              if (data[k].uuid !== undefined) {
                // jshint camelcase: false
                data[k].array_index = k;
                relatedObject[data[k].uuid] = data[k];
              } else if (data[k].id !== undefined) {

                relatedObject[data[k].id] = data[k];
              }
            }
          }
          //store new object in local storage
          addToStore(relatedName, relatedObject);
          deferred.resolve(relatedObject);
        }
      });
      return deferred.promise;
    }

    function uuidGenerator() {
      var now = Date.now();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c) {
          var r = (now + Math.random() * 16) % 16 || 0;
          now = Math.floor(now / 16);
          return (c === 'x' ? r : (r && 0x7 || 0x8)).toString(16);
        });
      return uuid;
    }

    return {
      isSupported: hasChromeStorage,
      isSupportedAPI: hasApiStorage,
      add: addToStore,
      get: getFromStore,
      getAll: getAllFromStore,
      remove: removeFromStore, // removeFromChrome,
      clear: clearFromStore, // clearChrome */
      uuid: uuidGenerator,
      loadFixtures: loadFixtures,
      loadTableObject: loadRelatedObject,
      insert: insert,
      PRODUCT: product,
      PRODUCT_CATEGORY: productCategory,
      ADDRESS: address,
      UOM: uom,
      UOM_CATEGORY: uomCategory,
      FACILITY: facility,
      PROGRAM: program,
      PROGRAM_PRODUCTS: programProducts,
      FACILITY_TYPE: facilityType,
      EMPLOYEE_CATEGORY: employeeCategory,
      COMPANY: company,
      COMPANY_CATEGORY: companyCategory,
      CURRENCY: currency,
      EMPLOYEE: employee,
      RATE: rate,
      STORAGE_LOCATION_TYPE: storageLocationType,
      STORAGE_LOCATION: storageLocation,
      USER: user,
      PRODUCT_PRESENTATION: productPresentation,
      PRODUCT_FORMULATION: productFormulation,
      MODE_OF_ADMINISTRATION: modeOfAdministration,
      PRODUCT_ITEM: productItem,
      STORAGE_LOCATION_PROBLEM: storageLocationProblem,
      STORAGE_LOCATION_TEMPERATURE: storageLocationTemperature,
      PRODUCT_PROFILE: productProfile,
      INVENTORY: inventory,
      ORDERS: orders
    };

  });
