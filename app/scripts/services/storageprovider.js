'use strict';

angular.module('lmisChromeApp')
    .factory('storageService', function ($q, $rootScope, $http, $window) {

      /**
       *  Global variables used to define table names, with this there will be one
       *  point in the code to add and/or update local storage table names.
       *
       *  table names are matched to the corresponding json file at fixtures
       *  folder that holds data used to pre-fill local storage if it is empty.
       *
       */
      var product_types = 'product_types';
      
      var productCategory = 'product_category';
      var address = 'address';
      var uom = 'uom';
      var uomCategory = 'uom_category';
      var facility = 'facility';
      var program = 'programs';
      var programProducts = 'program_products';
      var facilityType = 'facility_type';
      var employeeCategory = 'employee_category';
      var company = 'company';
      var companyCategory = 'company_category';
      var currency = 'currencies';
      var employee = 'employee';
      var rate = 'rate';
      var ccuType = 'ccu_type';
      var ccu = 'ccu';
      var user = 'user';
      var productPresentation = 'product_presentation';
      var productFormulation = 'product_formulations';
      var modeOfAdministration = 'mode_of_administration';
      var batches = 'batches';
      var ccuProblem = 'ccu_problems';
      var ccuTemperatureLog = 'ccu_temp_log';
      var productProfile = 'product_profiles';
      var inventory = 'inventory';
      var orders = "orders";
      var bundles = "bundle";
      var bundleLines = "bundle_lines";
      var bundleReceipt = "bundle_receipts";
      var bundleReceiptLines = "bundle_receipt_lines";

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
       * @param {string} key The name of the table, the value under.
       * @param {mixed} value The value(table rows) to set (all values are stored as JSON.)
       * @return {Promise} return promise object
       * @private
       */
      function addTable(key, value) {

        var newStorage = {};
        var defered = $q.defer();
        newStorage[key] = value;

        if (hasChromeStorage) {
          $window.chrome.storage.local.set(newStorage, function () {
            console.log("saved: " + key);
            defered.resolve();
            if (!$rootScope.$$phase) $rootScope.$apply(); // flush evalAsyncQueue
          });
          return defered.promise;
        }
        return null; // defer.reject?
      }

      /**
       * Get the rows that belongs to the given table name from the local web store.
       *
       * @param {string} key The name of the value.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
      function getTable(key) {
        var defered = $q.defer();
        if (hasChromeStorage) {
          $window.chrome.storage.local.get(key, function (data) {
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
          $window.chrome.storage.local.get(null, function (data) {
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
       * @param {string} key The name of table to be removed.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
      function removeTable(key) {
        var defered = $q.defer();
        if (hasChromeStorage) {
          $window.chrome.storage.local.get(key, function () {
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
          $window.chrome.storage.local.clear(function () {
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
          $window.chrome.storage.local.set({'angular.chromeStorage.test': true}, function () {
            //console.log('set: success');
          });
          $window.chrome.storage.local.remove('angular.chromeStorage.test', function () {
            //console.log('remove: success');
          });
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
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
        var datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
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
        getAllFromStore().then(function (data) {
          var tbl = Object.keys(data);
          deferred.resolve(tbl);
        });
        return deferred.promise;
      }

      /**
       * add new or update database table row.
       *
       * @return {promise} promise to access data from local storage.
       * @private
       */
      function insert(table, obj) {

        var deferred = $q.defer();
        //get list of existing tables in database. if table exist
        getTables().then(function (tables) {
          if (tables.indexOf(table) != -1) {
            getTable(table).then(function (table_data) {
                console.log(obj);
                if(Object.prototype.toString.call(table_data) == '[object Object]'){
                    var uuid_test = (Object.keys(obj)).indexOf('uuid') != -1? true:false;
                    obj['created'] = (uuid_test) ? obj['created']:getDateTime();
                    obj['modified'] = (uuid_test) ? '0000-00-00 00:00:00':getDateTime();
                    var uuid = (uuid_test)? obj['uuid'] : uuid_generator();
                    table_data[uuid] = obj;
                    addTable(table, table_data);
                    deferred.resolve(uuid);
                }
                else{
                  deferred.resolve(null);
                    console.log(table_data);
                }
            });
          }
          else {

            var table_data = {};
            obj['uuid'] = (Object.keys(obj).indexOf('uuid') != -1)?obj['uuid']:uuid_generator();
            obj['created'] = getDateTime();
              obj['modified'] = '0000-00-00 00:00:00';
            table_data[obj['uuid']] = obj;
            addTable(table, table_data);
            deferred.resolve(obj.uuid);
            //console.log("new entry");
          }
        });
        return deferred.promise;
      }

      /**
       * loads fixtures on app startup
       * @param void
       * @returns {void}
       */
      function loadFixtures() {
        var database = [
          product_types,
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
          ccuType,
          ccu,
          inventory,
          ccuProblem,
          ccuTemperatureLog,
          user,
          productCategory,
          productPresentation,
          productProfile,
          productFormulation,
          modeOfAdministration,
          batches,
          orders,
          bundles,
          bundleLines,
          bundleReceipt
        ]
        for (var i in database) {
          loadData(database[i]);
        }
        function loadData(db_name) {
          var test_data = [];

          getTable(db_name).then(function (data) {
                test_data = data;
                if (test_data.length == 0 || test_data.length == undefined) {

                  var file_url = 'scripts/fixtures/' + db_name + '.json';
                  $http.get(file_url).success(function (data) {
                    addTable(db_name, data);
                    //console.log(data);
                    //loadRelatedObject(db_name);

                  }).error(function (err) {
                        console.log(err);
                      });
                }
                else {
                  console.log(db_name + " is loaded with " + test_data.length);
                  //loadRelatedObject(db_name);
                }

              },
              function (reason) {
                //console.log(reason);
              }
          );
        }
      }

      /**
       * coveverts table array to object using uuid as key for data row,
       * also appends array index (array_index) to each row
       * @param db_name
       * @returns {promise}
       */
      function loadRelatedObject(db_name) {
        var deferred = $q.defer();
        //create a new table name by prefixing the original with 're'
        var related_name = 're_' + db_name;
        //when called get data from storage and create an object using uuid as key
        getTable(db_name).then(function (data) {
          if (data.length != 0 && data.length != undefined) {
            //load table data into object
            var related_object = {};
            for (var k in data) {
              if (Object.prototype.toString.call(data[k]) === '[object Object]') {
                //var keys = Object.keys(data[k]);
                if (data[k].uuid != undefined) {
                  data[k]["array_index"] = k;
                  related_object[data[k].uuid] = data[k];
                }
                else if (data[k].id != undefined) {

                  related_object[data[k].id] = data[k];
                }
              }
            }
            //store new object in local storage
            addTable(related_name, related_object);
            deferred.resolve(related_object);
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

      function uuid_generator() {
        var now = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (now + Math.random() * 16) % 16 | 0;
          now = Math.floor(now / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
      }

      function getFromTableByKey(tableName, key){
         var deferred = $q.defer();
          var result = null;
          var key = String(key);//force conversion to string
          try{
            getTable(tableName).then(function (data) {
              result = data[key];
              deferred.resolve(result);
              if (!$rootScope.$$phase) $rootScope.$apply();
            });
          }catch(e){
            deferred.resolve(result);
            if (!$rootScope.$$phase) $rootScope.$apply();
          }finally{
             return deferred.promise;
          }
      }

      /**
       * This returns an array or collection of rows in the given table name, this collection can not be
       * indexed via key, to get table rows that can be accessed via keys use all() or getTable()
      */
      function getAllFromTable(tableName) {
        var deferred = $q.defer();
        getTable(tableName).then(function (data) {
          var rows = [];
          for (var key in data) {
            rows.push(data[key]);
          }
          deferred.resolve(rows);
          if (!$rootScope.$$phase) $rootScope.$apply();
        });
        return deferred.promise;
      }

      return {
        isSupported: hasChromeStorage,
        all: getAllFromTable,
        add: addTable,
        get: getTable,
        getAll: getAllFromStore,
        remove: removeTable, // removeFromChrome,
        clear: clearFromStore, // clearChrome */
        uuid: uuid_generator,
        loadFixtures: loadFixtures,
        loadTableObject: loadRelatedObject,
        insert: insert,
        find: getFromTableByKey,
        PRODUCT_TYPES: product_types,
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
        CCU_TYPE: ccuType,
        CCU: ccu,
        USER: user,
        PRODUCT_PRESENTATION: productPresentation,
        PRODUCT_FORMULATION: productFormulation,
        MODE_OF_ADMINISTRATION: modeOfAdministration,
        BATCH: batches,
        CCU_PROBLEM: ccuProblem,
        CCU_TEMPERATURE_LOG: ccuTemperatureLog,
        PRODUCT_PROFILE: productProfile,
        INVENTORY: inventory,
        ORDERS: orders,
        BUNDLE: bundles,
        BUNDLE_LINES: bundleLines,
        BUNDLE_RECEIPT: bundleReceipt,
        BUNDLE_RECEIPT_LINES: bundleReceiptLines
      };

    });
