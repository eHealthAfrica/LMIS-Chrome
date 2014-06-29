'use strict';

angular.module('lmisChromeApp')
    .factory('storageService', function ($q, $rootScope, $http, $window, chromeStorageApi, utility, collections, pouchStorageService) {

      /**
       *  Global variables used to define table names, with this there will be one
       *  point in the code to add and/or update local storage table names.
       *
       *  table names are matched to the corresponding json file at fixtures
       *  folder that holds data used to pre-fill local storage if it is empty.
       *
       */
      var stockCount = 'stockcount';
      var discardCount = 'discard_count';
      var appConfig = 'app_config';
      var surveyResponse = 'survey_response';
      var ccuBreakdown = 'ccu_breakdown';
      var pendingSyncs = 'pending_syncs';

      var FIXTURE_NAMES = utility.values(collections);

      /**
       * Add new table data to the chrome store.
       *
       * @param {string} table - Table name.
       * @param {mixed} data - rows of the table (all values are stored as JSON.)
       * @return {promise|Function|promise|promise|promise|*}
       * @private
       */
      var setData = function (table, data) {
        if(!data.hasOwnProperty('uuid')){
          throw 'data should have a uuid or primary key field.';
        }
        return pouchStorageService.put(table, data);
      };

      var getData = function(key) {
        return pouchStorageService.allDocs(key);
      };

      /**
       * This function removes a given record with the given uuid from the given
       * tableName and returns True if it was done successfully else rejects
       * with reason why removeData failed.
       *
       * @param tableName
       * @param uuid
       * @returns {promise|Function|promise|promise|promise|*}
       */
      var removeRecordFromTable = function(tableName, uuid){
        return pouchStorageService.get(tableName, uuid)
          .then(function(doc) {
            return pouchStorageService.remove(tableName, uuid, doc._rev);
          });
      };

      /**
       * Remove a table from the chrome store.
       *
       * @param key - Table name.
       * @returns {*|boolean|Array|Promise|string}
       */
      var removeData = function(key) {
        return pouchStorageService.destroy(key);
      };

      /**
       * Clear all data from the chrome storage (will not work on API).
       *
       * @returns {*|boolean|!Promise|Promise}
       */
      var clearStorage = function() {
        return pouchStorageService.clear();
      };

    /**
     * returns current date time string
     * @returns {string|*}
     */
    var getDateTime = function () {
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
        data.uuid = utility.uuidGenerator();
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
    var updateData = function (table, data, updateDateModified) {
      if (!data.hasOwnProperty('uuid')) {
        throw 'update should only be called with data that has UUID or primary key already.';
      }
      if (updateDateModified !== false) {
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
    var saveData = function (table, data) {
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

      var getFromTableByKey = function (tableName, _key) {
        var deferred = $q.defer();
        var key = String(_key);//force conversion to string
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

      /**
       * This returns an array or collection of rows in the given table name,
       * this collection can not be indexed via key, to get table rows that can
       * be accessed via keys use all() or getData()
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
                  batch.uuid = utility.uuidGenerator();
                  batch.created = now;
                }
                batch.modified = now;
                var oldRecord = tableData[batch.uuid];
                tableData[batch.uuid] = utility.copy(oldRecord, batch);//update old copy if it exists.
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

      var api = {
        all: getAllFromTable,
        add: setData,
        get: getData,
        removeRecord: removeRecordFromTable,
        remove: removeData, // removeFromChrome,
        clear: clearStorage, // clearChrome */:
        uuid: utility.uuidGenerator,
        insert: insertData,
        update: updateData,
        save: saveData,
        setDatabase: setTable,
        where: getFromTableByLambda,
        find: getFromTableByKey,
        insertBatch: insertBatch,
        APP_CONFIG: appConfig,
        CCU_BREAKDOWN: ccuBreakdown,
        DISCARD_COUNT: discardCount,
        PENDING_SYNCS: pendingSyncs,
        STOCK_COUNT: stockCount,
        SURVEY_RESPONSE: surveyResponse,
        FIXTURE_NAMES: FIXTURE_NAMES
      };

      return angular.extend(api, collections);
    });
