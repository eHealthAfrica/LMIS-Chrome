'use strict'

angular.module('lmisChromeApp').service('syncService', function ($q, $log, $rootScope, storageService, pouchdb, config) {

  var isSyncing = false;

  var getLocalDB = function(dbUrl){
    return pouchdb.create(dbUrl);
  };

  var getRemoteDB = function(dbName){
    var REMOTE = config.api.url + '/' + dbName;
    return pouchdb.create(REMOTE);
  };

  var updatePouchDBWithItem = function(db, item){
    var deferred = $q.defer();
    db.get(item.uuid).then(function (response) {
      item._id = response._id;
      item._rev = response._rev;
      db.put(item, response._id, response._rev)
      .then(function (result) {
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    }, function (error) {
      db.put(item, item.uuid)
      .then(function (result) {
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    });
    return deferred.promise;
  };

  this.syncItem = function(dbName, item){
    var deferred = $q.defer();
    if (isSyncing) {
      deferred.reject('Syncing is already in progress');
    }else{
      var remoteDB = getRemoteDB(dbName);
      var localDB = getLocalDB(dbName);
      isSyncing = true;

      var onSyncComplete = function (deferred) {
        isSyncing = false;
        deferred.resolve(true);
      };

      updatePouchDBWithItem(localDB, item).then(function (result) {
        remoteDB.info().then(function (response) {
          localDB.replicate.to(remoteDB, {complete: onSyncComplete(deferred) });
        }, function (error) {
          deferred.reject(error);
          isSyncing =  false;
        });
      }, function (error) {
        deferred.reject(error);
        isSyncing = false;
      });
    }
    return deferred.promise;
  };

  this.clearPouchDB = function(dbName){
    return getLocalDB(dbName).destroy();
  };

});