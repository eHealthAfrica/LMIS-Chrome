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
      var stockOut = 'stock_out';

      /**
       * Add new table data to the chrome store.
       *
       * @param {string} key - Table name.
       * @param {mixed} value - rows of the table (all values are stored as JSON.)
       * @return {Promise} Promise object
       * @private
       */

      function setData(table, data) {
        var deferred = $q.defer();
        var obj = {};
        getData(table).then(function(tableData){
          if(angular.isUndefined(tableData)){
            var tableData = {};
            tableData[data.uuid] = data;
            obj[table] = tableData;
          }else{
            tableData[data.uuid] = data;
            obj[table] = tableData;
          }
          chromeStorageApi.set(obj);
          deferred.resolve(data.uuid);
        });
        return deferred.promise;
      }

      /**
       * Load init table data to the chrome store.
       *
       * @param {string} table - Table name.
       * @param {mixed} data - object of table rows
       * @return {Promise} Promise object
       * @private
       */
      function setTable(table, data) {
        var obj = {};
        obj[table] = data;
        var promise = chromeStorageApi.set(obj);
        return promise;
      };


      /**
       * Get table data from the chrome store
       *
       * @param {string} key - Table name.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */

      function getData(key) {
         var promise = chromeStorageApi.get(key);
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
          var promise = chromeStorageApi.get(null, {collection:true});
          return promise;
        }

      /**
       * Remove a table from the chrome store.
       *
       * @param {string} key - Table name.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */

        function removeData(key) {
          var promise = chromeStorageApi.remove(key);
          return promise;
        }

      /**
       * Clear all data from the chrome storage (will not work on API).
       *
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
        function clearStorage() {
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
         * Insert new database table row.
         *
         * @return {promise}
         */
        function insertData(table, data) {
          data['uuid'] = uuidGenerator();
          data['created'] = data['modified'] = getDateTime();
          var promise = setData(table, data);
          return promise;
        }

        /**
         *  Update database table row.
         *
         * @return {promise}
         */

        function updateData(table, data) {
          //todo: refactor to dateModified
          data['modified'] = getDateTime();
          var promise = setData(table, data);
          return promise;
        }

        /**
         *  Encapsulates insert/update database table row operations.
         *
         * @return {promise}
         */
        function saveData(table, data) {
          var promise = null;
          if((typeof data === "object") && (data !== null)){
            if(Object.keys(data).indexOf('uuid') !== -1 && data.uuid.length > 0){
              promise = updateData(table, data);
            } else {
              promise = insertData(table, data);
            }
          }
          return promise;
        }

      /**
       * loads fixtures on app startup
       * @param void
       * @returns {void}
       */
      function loadFixtures() {
        var deferred = $q.defer();
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
          locations,
          stockOut
        ];
        var isLoading = false;
        function loadData(db_name) {
          var test_data = [];
          getData(db_name).then(function (data) {

                if (angular.isUndefined(data)) {
                  console.log('loading '+db_name);
                  var file_url = 'scripts/fixtures/' + db_name + '.json';
                  $http.get(file_url).success(function (data) {
                      setTable(db_name, data).then(function(res){isLoading=false;},function(err){isLoading=false;});
                  }).error(function (err) {
                        console.log(err);
                        isLoading=false;
                  });
                }
                else {
                  isLoading=false;
                  console.log(db_name + " is already loaded: " + Object.keys(data).length);
                  //loadRelatedObject(db_name);
                }

              },
              function (reason) {
                console.log('error loading '+db_name+' '+reason);
              }
          );
        };
        var loadNext = function(i)
        {
          if(!isLoading)
          {
            console.log('calling load '+(i-1));
            isLoading=true;
            loadData(database[--i]);
          } else {
            console.log('still loading '+i)
          }
          if(i > 0)
            setTimeout(function() { loadNext(i) }, 10);
          else
          {
            //this is when the app is actually ready
          }
        };
        loadNext(database.length);
        deferred.resolve(true);
        return deferred.promise;
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
        getData(db_name).then(function (data) {
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
              setTable(related_name, related_object);
            deferred.resolve(related_object);
          }
        });
        return deferred.promise;
      }

      function uuidGenerator() {
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
          getData(tableName).then(function (data) {
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
       * indexed via key, to get table rows that can be accessed via keys use all() or getData()
       */
      function getAllFromTable(tableName) {
        var deferred = $q.defer();
        getData(tableName).then(function (data) {
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
        getData(tableName).then(function(tableData){
          var batches = (angular.isArray(batchList))? batchList : [];
          var results = [];
          console.log(tableName+" "+tableData);
          for(var index in batches){
            var batch = batches[index];
            var hasUUID = batch.hasOwnProperty('uuid');
            batch['uuid'] = hasUUID? batch['uuid'] : uuidGenerator();
            batch['created'] = hasUUID? batch['created'] : getDateTime();
            batch['modified'] = hasUUID? '0000-00-00 00:00:00' : getDateTime();
            tableData[batch.uuid] = batch;
            results.push(setData(tableName, tableData).then(function(result){
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
        add: setData,
        get: getData,
        getAll: getAllFromStore,
        remove: removeData, // removeFromChrome,
        clear: clearStorage, // clearChrome */
        uuid: uuidGenerator,
        loadFixtures: loadFixtures,
        loadTableObject: loadRelatedObject,
        insert: insertData,
        update: updateData,
        save: saveData,
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
        APP_CONFIG: appConfig,
        STOCK_OUT: stockOut
      };

    });
