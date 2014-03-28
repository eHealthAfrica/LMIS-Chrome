'use strict';

angular.module('lmisChromeApp')
    .factory('storageService', function ($q, $rootScope, $http, $window, chromeStorageApi) {

      /**
       *  Global variables used to define table names, with this there will be one
       *  point in the code to add and/or update local storage table names.
       *
       *  table names are matched to the corresponding json file at fixtures
       *  folder that holds data used to pre-fill local storage if it is empty.
       *
       */
      var productTypes = 'product_types';
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
      var orders = 'orders';
      var bundles = 'bundle';
      var bundleLines = 'bundle_lines';
      var bundleReceipt = 'bundle_receipts';
      var bundleReceiptLines = 'bundle_receipt_lines';
      var locations = 'locations';
      var stockCount = 'stockCount';
      var wasteCount = 'wasteCount';
      var appConfig = 'app_config';

      /**
       * Add new table to the chrome store.
       *
       * @param {string} key - Table name.
       * @param {mixed} value - rows of the table (all values are stored as JSON.)
       * @return {Promise} Promise object
       * @private
       */

      function addTable(key, value) {
        var obj = {};
        obj[key] = value;
        var promise = chromeStorageApi.set(obj);
        return promise;
      }

      /**
       * Get table data from the chrome store
       *
       * @param {string} key - Table name.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */

      function getTable(key) {
         var promise = chromeStorageApi.get(key, false);
         return promise;
        }

      /**
       * Get All data from the chrome store.
       *
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
        // TODO - consider to deprecate
        function getAllFromStore() {
          var promise = chromeStorageApi.get(null, true);
          return promise;
        }

      /**
       * Remove a table from the chrome store.
       *
       * @param {string} key - Table name.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */

        function removeTable(key) {
          var promise = chromeStorageApi.remove(key);
          return promise;
        }

      /**
       * Clear all data from the chrome storage (will not work on API).
       *
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
        function clearFromStore() {
          var promise = chromeStorageApi.clear();
          return promise;
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
       * Get list of tables from the chrome storage.
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
       * Add new or update database table row.
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

                if (Object.prototype.toString.call(table_data) == '[object Object]') {
                  var uuid_test = (Object.keys(obj)).indexOf('uuid') != -1 ? true : false;
                  obj['created'] = (uuid_test) ? obj['created'] : getDateTime();
                  obj['modified'] = (uuid_test) ? '0000-00-00 00:00:00' : getDateTime();
                  var uuid = (uuid_test) ? obj['uuid'] : uuid_generator();
                  obj['uuid'] = uuid;
                  table_data[uuid] = obj;
                  addTable(table, table_data);
                  deferred.resolve(uuid);
                }
                else {
                  deferred.resolve(null);
                  console.log(table_data);
                }
              });
            }
            else {

              var table_data = {};
              obj['uuid'] = (Object.keys(obj).indexOf('uuid') != -1) ? obj['uuid'] : uuid_generator();
              obj['created'] = getDateTime();
              obj['modified'] = '0000-00-00 00:00:00';
              table_data[obj['uuid']] = obj;
              addTable(table, table_data);
              deferred.resolve(obj.uuid);
              //console.log("new entry");
            }
          });
          if (!$rootScope.$$phase) $rootScope.$apply();
          return deferred.promise;
        }

      /**
       * loads fixtures on app startup
       * @param void
       * @returns {void}
       */
      function loadFixtures() {
        var database = [
          productTypes,
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
          bundleReceipt,
          locations
        ];
        function loadData(db_name) {
          var test_data = [];
          getTable(db_name).then(function (data) {
                test_data = data;
                if (angular.isUndefined(data)) {
                  var file_url = 'scripts/fixtures/' + db_name + '.json';
                  $http.get(file_url).success(function (data) {
                    addTable(db_name, data);
                  }).error(function (err) {
                        console.log(err);
                  });
                }
                else {
                  //console.log(db_name + " is loaded with " + JSON.stringify(test_data));
                  //loadRelatedObject(db_name);
                }

              },
              function (reason) {
                //console.log(reason);
              }
          );
        };
        for (var i in database) {
          loadData(database[i]);
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

      function uuid_generator() {
        var now = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (now + Math.random() * 16) % 16 | 0;
          now = Math.floor(now / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
      }

      function getFromTableByKey(tableName, key) {
        var deferred = $q.defer();
        var result = null;
        var key = String(key);//force conversion to string
        try {
          getTable(tableName).then(function (data) {
            result = data[key];
            deferred.resolve(result);
            if (!$rootScope.$$phase) $rootScope.$apply();
          });
        } catch (e) {
          deferred.resolve(result);
          if (!$rootScope.$$phase) $rootScope.$apply();
        } finally {
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

      function insertBatch(tableName, batchList){

        var deferred = $q.defer();
        getTable(tableName).then(function(tableData){
          var batches = (angular.isArray(batchList))? batchList : [];
          var results = [];
          console.log(tableName+" "+tableData);
          for(var index in batches){
            var batch = batches[index];
            var hasUUID = batch.hasOwnProperty('uuid');
            batch['uuid'] = hasUUID? batch['uuid'] : uuid_generator();
            batch['created'] = hasUUID? batch['created'] : getDateTime();
            batch['modified'] = hasUUID? '0000-00-00 00:00:00' : getDateTime();
            tableData[batch.uuid] = batch;
            results.push(addTable(tableName, tableData).then(function(result){
              return batch['uuid'];
            }, function(error){
              console.log(error);
            }));
            batches[index] = batch;
          }
          console.log(results);
          console.log(batches.length);
          (results.length === batches.length)? deferred.resolve(batches): deferred.resolve("batch insertion failed");;
        });
        if (!$rootScope.$$phase) $rootScope.$apply();
        return deferred.promise;
      }

      return {
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
        insertBatch: insertBatch,
        PRODUCT_TYPES: productTypes,
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
        BUNDLE_RECEIPT_LINES: bundleReceiptLines,
        LOCATIONS: locations,
        STOCK_COUNT: stockCount,
        WASTE_COUNT: wasteCount,
        APP_CONFIG: appConfig
      };

    });
