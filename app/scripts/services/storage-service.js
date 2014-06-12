'use strict';

angular.module('lmisChromeApp')
    .factory('storageService', function ($q, $rootScope, $http, $window, chromeStorageApi, utility) {

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
      var stockCount = 'stockcount';
      var discardCount = 'discard_count';
      var appConfig = 'app_config';
      var stockOut = 'stock_out';
      var surveyResponse = 'survey_response';
      var ccuProfile = 'ccu_profile';
      var ccuBreakdown = 'ccu_breakdown';
      var pendingSyncs = 'pending_syncs';

      /**
       * Add new table data to the chrome store.
       *
       * @param {string} table - Table name.
       * @param {mixed} data - rows of the table (all values are stored as JSON.)
       * @return {Promise} Promise object
       * @private
       */

      var setData = function (table, data) {
        if(!data.hasOwnProperty('uuid')){
          throw 'data should have a uuid or primary key field.';
        }
        var deferred = $q.defer();
        var obj = {};
        getData(table).then(function(tableData){
          if(angular.isUndefined(tableData)){
            tableData = {};
          }
          var oldRecord = tableData[data.uuid];
          data = utility.copy(oldRecord, data);
          tableData[data.uuid] = data;
          obj[table] = tableData;
          chromeStorageApi.set(obj)
              .then(function(){
                deferred.resolve(data.uuid);
              })
              .catch(function(reason){
                deferred.reject(reason);
              });

        }).catch(function(reason){
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      /**
       * This function removes a given record with the given uuid from the given tableName and returns True
       * if it was done successfully else rejects with reason why removeData failed.
       *
       * @param tableName
       * @param uuid
       * @returns {promise|Function|promise|promise|promise|*}
       */
      var removeRecordFromTable = function(tableName, uuid){
        var deferred = $q.defer();
        var tableObj = {};
        getData(tableName)
            .then(function(tableData){
              if(typeof tableData !== 'undefined'){
                if(typeof tableData[uuid] !== 'undefined'){
                  delete tableData[uuid];
                  tableObj[tableName] = tableData;
                  chromeStorageApi.set(tableObj)
                      .then(function () {
                        deferred.resolve(true);
                      })
                      .catch(function (reason) {
                        deferred.reject(reason);
                      });
                }else{
                  deferred.reject('record with given uuid does not exist.');
                }
              }else{
                deferred.reject('table does not exist.');
              }
            })
            .catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      /**
       * Load init table data to the chrome store.
       *
       * @param {string} table - Table name.
       * @param {mixed} data - object of table rows
       * @return {Promise} Promise object
       * @private
       */
      var setTable = function (table, data) {
        var obj = {};
        obj[table] = data;
        return  chromeStorageApi.set(obj);
      };


      /**
       * Get table data from the chrome store
       *
       * @param {string} key - Table name.
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */

      var getData = function(key) {
        return chromeStorageApi.get(key);
      };

      /**
       * Get All data from the chrome store.
       *
       * @return {Promise} Promise to be resolved with the settings object
       * @private
       */
        // TODO - consider to deprecate
      var getAllFromStore = function() {
        return chromeStorageApi.get(null, {collection:true});
      };

      /**
       * Remove a table from the chrome store.
       *
       * @param key - Table name.
       * @returns {*|boolean|Array|Promise|string}
       */
      var removeData = function(key) {
        return chromeStorageApi.remove(key);
      };

      /**
       * Clear all data from the chrome storage (will not work on API).
       *
       * @returns {*|boolean|!Promise|Promise}
       */
      var clearStorage = function() {
        return chromeStorageApi.clear();
      };

      /**
       * returns current date time string
       * @returns {string|*}
       */
      var getDateTime = function() {
        return new Date().toJSON();
      };

      /**
       * Insert new database table row.
       *
       * @param table
       * @param data
       * @returns {Promise}
       */
      var insertData = function(table, data) {
        if(data.hasOwnProperty('uuid')){
          throw 'insert should only be called with fresh record that has not uuid or primary key field.';
        }
        data.uuid = uuidGenerator();
        data.created = data.modified = getDateTime();
        return setData(table, data);
      };

      /**
       * Update database table row.
       *
       * @param table
       * @param data
       * @returns {Promise}
       */
      var updateData = function(table, data, updateDateModified) {
        if(!data.hasOwnProperty('uuid')){
          throw 'update should only be called with data that has UUID or primary key already.';
        }
        if(updateDateModified !== false){
           data.modified = getDateTime();
        }
        return setData(table, data);
      };

      /**
       *  Encapsulates insert/update database table row operations.
       *
       * @param table
       * @param data
       * @returns {*}
       */
      var saveData = function(table, data) {
        if ((typeof data === 'object') && (data !== null)) {
          if (Object.keys(data).indexOf('uuid') !== -1 && data.uuid.length > 0) {
            return updateData(table, data);
          } else {
            return insertData(table, data);
          }
        } else {
          var deferred = $q.defer();
          deferred.reject(data + ' is null or non-object data.');
          return deferred.promise;
        }
      };

      /**
       * loads fixtures on app startup
       *
       * @returns {promise|promise|*|promise|promise}
       */
      var loadFixtures = function() {

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
          stockOut,
          ccuProfile
        ];
        var isLoading = false;
        var loadData = function(count){

          if(count >= 0){
            isLoading = true;
            $rootScope.$emit('START_LOADING', {started: true});
            var dbName = database[count];
            getData(dbName)
                .then(function(result){
                  if (angular.isUndefined(result)) {
                    var fileUrl = 'scripts/fixtures/' + dbName + '.json';
                    $http.get(fileUrl)
                        .success(function (data) {
                          setTable(dbName, data)
                              .then(function () {
                                console.log(dbName +' was loaded successfully, remaining '+(count)+' database');
                                loadData(count - 1);
                              }, function (reason) {
                                console.log(reason);
                                loadData(count - 1);
                              });
                        })
                        .error(function (err) {
                          console.log(err);
                          loadData(count - 1);
                        });
                  }
                  else{
                    loadData(count - 1);
                    console.log(dbName +' already exist, remaining '+(count)+' database to go');
                  }

                })
                .catch(function(reason){
                  loadData(count - 1);
                  //console.log(reason); // stop showing logs during test
                });
          }else{
            deferred.resolve(true);
            $rootScope.$emit('LOADING_COMPLETED', {completed: true});
            isLoading = false;
          }
        };
        loadData(database.length - 1);

        return deferred.promise;
      };


      var uuidGenerator = function () {
        var now = Date.now();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (now + Math.random() * 16) % 16 | 0;
          now = Math.floor(now / 16);
          return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
      };

      var getFromTableByKey = function (tableName, _key) {
        var deferred = $q.defer();
        var key = String(_key);//force conversion to string
        getData(tableName)
            .then(function (data) {
              deferred.resolve(data[key]);
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      /**
       * TODO: there must be a better framework way of doing this.
       * this is basically just filter() but the idea is that there are probably ways to pass this
       * to the storage layer to get the filtering done in the db, so make it a separae fn and figure that out later
       */
      var getFromTableByLambda = function (tableName, fn) {
        var deferred = $q.defer();
        var results = [];
        try {
          getData(tableName)
              .then(function (data) {
                results = data.filter(fn);
                deferred.resolve(results);
              }).catch(function (reason) {
                deferred.reject(reason);
              });
        } catch (e) {
          deferred.reject(e);
        } finally {
          return deferred.promise;
        }
      };

      /**
       * This returns an array or collection of rows in the given table name, this collection can not be
       * indexed via key, to get table rows that can be accessed via keys use all() or getData()
       */
      var getAllFromTable = function (tableName) {
        var deferred = $q.defer();
        getData(tableName)
            .then(function (data) {
              var rows = [];
              for (var key in data) {
                rows.push(data[key]);
              }
              deferred.resolve(rows);
            })
            .catch(function (reason) {
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      var insertBatch = function (table, batchList){
        var deferred = $q.defer();
        var obj = {};
        var newBatchList = [];
        if(Object.prototype.toString.call(batchList) !== '[object Array]'){
          throw 'batchList is not an array';
        }
        getData(table)
            .then(function(tableData){
              if(angular.isUndefined(tableData)){
                tableData = {};
              }
              for(var i=0; i < batchList.length; i++){
                var batch = batchList[i];
                var now = getDateTime();
                if(batch.hasOwnProperty('uuid') === false){
                  batch.uuid = uuidGenerator();
                  batch.created = now;
                }
                batch.modified = now;
                var oldRecord = tableData[batch.uuid];
                  console.log(oldRecord);
                tableData[batch.uuid] = utility.copy(oldRecord, batch);//update old copy if it exists.
                console.log(tableData[batch.uuid]);
                newBatchList.push(batch);
              }
              obj[table] = tableData;
              chromeStorageApi.set(obj)
                  .then(function(){
                    deferred.resolve(newBatchList);
                  })
                  .catch(function(reason){
                    deferred.reject(reason);
                  });

            })
            .catch(function(reason){
              deferred.reject(reason);
            });
        return deferred.promise;
      };

      return {
        all: getAllFromTable,
        add: setData,
        get: getData,
        removeRecord: removeRecordFromTable,
        getAll: getAllFromStore,
        remove: removeData, // removeFromChrome,
        clear: clearStorage, // clearChrome */
        uuid: uuidGenerator,
        loadFixtures: loadFixtures,
        insert: insertData,
        update: updateData,
        save: saveData,
        where: getFromTableByLambda,
        find: getFromTableByKey,
        insertBatch: insertBatch,
        getDateTime: getDateTime,
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
        DISCARD_COUNT: discardCount,
        APP_CONFIG: appConfig,
        STOCK_OUT: stockOut,
        SURVEY_RESPONSE: surveyResponse,
        CCU_PROFILE: ccuProfile,
        CCU_BREAKDOWN: ccuBreakdown,
        PENDING_SYNCS: pendingSyncs
      };

    });
