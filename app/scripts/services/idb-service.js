'use strict';

angular.module('lmisChromeApp')
  .service('idbService', function($q, $window) {
    var qify = function(idbFun, args) {
      var deferred = $q.defer();
      var request = $window.indexedDB[idbFun](args);
      request.onerror = function(reason) {
        return deferred.reject(reason);
      };
      request.onsuccess = function(result) {
        return deferred.resolve(result.target.result);
      };
      return deferred.promise;
    };

    var getIDBNames = function() {
      return qify('webkitGetDatabaseNames');
    };

    var filterDBs = function(dbs, prefix) {
      var _dbs = [];
      for (var db in dbs) {
        db = dbs[db].toString();
        if (db.indexOf(prefix) === 0) {
          _dbs.push(db);
        }
      }
      return _dbs;
    };

    var createDeletePromises = function(dbs) {
      var promises = [];
      for (var i = dbs.length - 1; i >= 0; i--) {
        promises.push(qify('deleteDatabase', dbs[i]));
      }
      return promises;
    };

    /**
     * Deletes all IDBs named with the given prefix.
     *
     * @param {String} prefix The DB prefix.
     * @return {Array.<Promise>} An array of promises
     */
    this.clear = function(prefix) {
      return getIDBNames()
        .then(function(dbs) {
          return filterDBs(dbs, prefix);
        })
        .then(createDeletePromises)
        .then($q.all);
    };
  });
