'use strict';

angular.module('lmisChromeApp')
  .service('fixtureLoaderService', function($q, $http, locationService, facilityFactory, $rootScope, memoryStorageService, config, storageService, utility, pouchdb, syncService, pouchStorageService) {

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
      //var dbUrl = [REMOTE_URI, '/', dbName].join('');
      return pouchStorageService.getRemoteDB(dbName)
        .then(function(db){
          return db.allDocs()
            .then(function(res){
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
        promises.push(syncService.syncUpRecord(dbName, record, true));
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

    var loadRemoteAndUpdateStorageAndMemory = function(dbNames) {
      var promises = {};
      //TODO: refactor this later.
      var databases = 'DATABASES';
      var lgas = 'LGAS'
      promises[databases] = loadDatabasesFromRemote(dbNames);
      promises[lgas] = getLgasByState("f87ed3e017cf4f8db26836fd910e4cc8");
      return $q.all(promises)
        .then(function(res) {
          var result = res[databases];

          result[storageService.LOCATIONS] = res[lgas];
          return saveDatabasesToLocalStorage(result)
            .then(function(res) {
              loadDatabasesIntoMemoryStorage(result);
              return res;
            });
        });
    };

    this.loadRemoteAndUpdateStorageAndMemory = function(dbNames) {
      return loadRemoteAndUpdateStorageAndMemory(dbNames);
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
      return loadRemoteAndUpdateStorageAndMemory(dbNames)
        .finally(function() {
          $rootScope.$emit('LOADING_COMPLETED', {completed: true});
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

    var getLgasByState = function(stateId) {
      var db = pouchdb.create(config.api.url + '/' + storageService.LOCATIONS);
      var lgaView = 'lga/by_id';
      var options = {
        include_docs: true
      };
      return db.get(stateId)
        .then(function(state) {
          options.keys = state.lgas;
          return db.query(lgaView, options)
            .then(function(res) {
              return res.rows
                .map(function(row) {
                  var lga = row.value;
                  if (utility.has(lga, '_id')) {
                    return lga;
                  }
                });
            });
        });
    };

    this.getLgas = getLgasByState;

    this.getWardsByLgas = function(lgas) {
      var db = pouchdb.create(config.api.url + '/' + storageService.LOCATIONS);
      var lgaView = 'lga/by_id';
      var wardView = 'ward/by_id'
      var options = {
        include_docs: true,
        keys: lgas
      };
      var wardIds = [];
      return db.query(lgaView, options)
        .then(function(res) {
          res.rows.forEach(function(row) {
            var lga = row.value;
            if (utility.has(lga, 'wards') && angular.isArray(lga.wards)) {
              wardIds = wardIds.concat(lga.wards);
            }
          });
          options.keys = wardIds;
          return db.query(wardView, options)
            .then(function(res) {
              return res.rows
                .map(function(row) {
                  var ward = row.value;
                  if (utility.has(ward, '_id')) {
                    return ward;
                  }
                });
            });
        });
    };

    var getFacilities = function(facilityIds) {
      var view = 'facilities/by_id';
      var db = pouchdb.create(config.api.url + '/facilities');
      var options = {
        include_docs: true,
        keys: facilityIds
      };
      return db.query(view, options)
        .then(function(res) {
          return res.rows
            .map(function(row) {
              return row.value;
            });
        });
    };

    this.setupWardsAndFacilitesByLgas = function(lgas) {
      return this.getWardsByLgas(lgas)
        .then(function(wards) {
          return locationService.saveBatch(wards)
            .then(function() {
              var wardFacilityIds = [];
              wards.forEach(function(w) {
                if (angular.isArray(w.facilities)) {
                  wardFacilityIds = wardFacilityIds.concat(w.facilities);
                }
              });
              return getFacilities(wardFacilityIds)
                .then(function(facilities){
                  return facilityFactory.saveBatch(facilities);
                });
            });
        });
    };

  });
