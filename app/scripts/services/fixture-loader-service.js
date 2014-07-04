'use strict';

angular.module('lmisChromeApp')
  .service('fixtureLoaderService', function($q, $http, $rootScope, memoryStorageService, config, storageService, utility, pouchdb, syncService) {

    var PATH = 'scripts/fixtures/';
    var REMOTE_URI = config.api.url;
    this.REMOTE_FIXTURES = [
      storageService.UOM,
      storageService.UOM_CATEGORY,
      storageService.PRODUCT_TYPES,
      storageService.PRODUCT_CATEGORY,
      storageService.PRODUCT_PRESENTATION,
      storageService.CCEI,
      storageService.MODE_OF_ADMINISTRATION,
      storageService.PRODUCT_FORMULATIONS,
      storageService.PRODUCT_PROFILES
    ];

    /**
     *  loads database from remote db.
     * @param {String} dbName
     * @returns {*}
     */
    var loadDatabaseFromRemote = function(dbName) {
      var dbUrl = [REMOTE_URI, '/', dbName].join('');
      var db = pouchdb.create(dbUrl);
      var map = function(doc) {
        if (doc) {
          /* globals emit: false */
          // PouchDB injects this, see:
          // http://pouchdb.com/api.html#query_database
          emit(doc);
        }
      };
      return db.info()
        .then(function() {
          return db.query({map: map}, {reduce: false})
            .then(function(res) {
              var data = res.rows;
              var dbRecords = [];
              for (var i in data) {
                var record = data[i].key;
                dbRecords.push(record);
              }
              return utility.castArrayToObject(dbRecords, 'uuid');
            });
        });
    };

    /**
     *  This loads databases from remote server.
     *
     * @private
     * @param {Array} dbNames - collection of dbNames to be loaded from remote.
     * @returns {Promise}
     */
    var loadDatabasesFromRemote = function(dbNames) {
      var promises = {};
      for (var i in dbNames) {
        var dbName = dbNames[i];
        promises[dbName] = loadDatabaseFromRemote(dbName);
      }
      return $q.all(promises);
    };

    /**
     * This saves databases to the local storage.
     *
     * @private
     * @param {Object} databases - nested key-value pairs object, where the key is the database name, pair is the database records.
     * @returns {Promise}
     */
    var saveDatabasesToLocalStorage = function(databases) {
      var promises = [], promise, db;
      var dbNames = Object.keys(databases);
      dbNames.forEach(function(dbName) {
        db = databases[dbName];
        // TODO: change callee's return value to an array
        db = utility.values(db);
        promise = storageService.setDatabase(dbName, db);
        promises.push(promise);
      });
      return $q.all(promises);
    };

    this.saveDatabases = function(databases) {
      return saveDatabasesToLocalStorage(databases);
    };

    /**
     * loads given databases into memory store.
     * @private
     * @param {Object} databases - nested object, dbName is the key, values are nested database records.
     */
    var loadDatabasesIntoMemoryStorage = function(databases) {
      if (Object.prototype.toString.call(databases) !== '[object Object]') {
        throw 'databases should be nested object.';
      }
      for (var dbName in databases) {
        var db = databases[dbName];
        memoryStorageService.setDatabase(dbName, db);
      }
    };

    this.loadDatabasesIntoMemoryStorage = function(databases) {
      return loadDatabasesIntoMemoryStorage(databases);
    };

    var loadDataToRemote = function(dbName, batch) {
      //TODO: utility function used to load fixtures into remote DB deprecated if not necessary later.
      var promises = [];
      for (var key in batch) {
        var record = batch[key];
        promises.push(syncService.syncItem(dbName, record, true));
      }
      return $q.all(promises);
    };

    /**
     * loads fixture into memory, then loads the result into remote database.
     * @param {Array} fixtureNames
     * @returns {*|Promise|Promise|!Promise.<R>}
     */
    this.loadFixturesIntoRemoteDb = function(fixtureNames) {
      //TODO: utility function created for loading fixtures into remote db. deprecate when no longer needed.
      var deferred = $q.defer();
      loadFilesIntoCache(fixtureNames)
        .then(function(result) {
          var promises = [];
          for (var dbName in result) {
            var db = result[dbName];
            if (!angular.isArray(db)) {
              db = utility.values(db);
            }
            promises.push(loadDataToRemote(dbName, db));
          }
          $q.all(promises)
            .then(function(result) {
              deferred.resolve(result);
            })
            .catch(function(reason) {
              deferred.reject(reason);
            });
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    // TODO: deprecate. Pouch returns an array of docs by sequence, whereas
    // we're expecting a nested object by ID. Consider rewriting callers, or
    // perhaps using a persisted Pouch view?
    var indexByID = function(results) {
      var table, _results = {}, _table;
      var byID = function(doc) {
        _table[doc.uuid] = doc;
      };
      for (var db in results) {
        table = results[db];
        _table = {};
        table.forEach(byID);
        _results[db] = _table;
      }
      return _results;
    };

    /**
     *  This reads databases from local storage into memory storage.
     *
     * @param {Array} dbNames - array of strings which are databases names.
     * @returns {Promise|*}
     */
    this.loadLocalDatabasesIntoMemory = function(dbNames) {
      var promises = {};
      for (var index in dbNames) {
        var dbName = dbNames[index];
        promises[dbName] = storageService.get(dbName);
      }
      return $q.all(promises)
        .then(indexByID)
        .then(function(results) {
          loadDatabasesIntoMemoryStorage(results);
          return results;
        });
    };

    /**
     *  This function does the following:
     *  1. loads databases from remote.
     *  2. saves the remote databases to local storage.
     *  3. loads the local databases into memory storage.
     *
     * @param {Array} dbNames - collection of database names(strings).
     * @returns {Promise|*}
     */
    this.setupLocalAndMemoryStore = function(dbNames) {
      $rootScope.$emit('START_LOADING', {started: true});
      return loadDatabasesFromRemote(dbNames)
        .then(function(result) {
          return saveDatabasesToLocalStorage(result)
            .then(function(res) {
              loadDatabasesIntoMemoryStorage(result);
              $rootScope.$emit('LOADING_COMPLETED', {completed: true});
              return res;
            });
        });
    };

    var loadFilesIntoCache = function(fileNames) {
      //TODO: deprecate ASAP, if we stop using fixture files.
      $rootScope.$emit('START_LOADING', {started: true});
      var deferred = $q.defer();
      var promises = {};
      for (var i in fileNames) {
        var fileName = fileNames[i];
        var fileUrl = [PATH, fileName, '.json'].join('');
        promises[fileName] = $http.get(fileUrl);
      }

      $q.all(promises)
        .then(function(result) {
          var resultSet = {};
          for (var fileName in result) {
            var data = result[fileName].data;
            if (angular.isArray(data)) {
              continue; //skip array fixtures, we don't use them currently
            }
            resultSet[fileName] = data;
            console.log('loaded: ' + fileName);
            memoryStorageService.setDatabase(fileName, data);
          }
          $rootScope.$emit('LOADING_COMPLETED', {completed: true});
          deferred.resolve(resultSet);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    this.loadFiles = function(fileNames) {
      //TODO: deprecate ASAP
      return loadFilesIntoCache(fileNames);
    };

  });
