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

  var saveItem = function(db, item){
    var deferred = $q.defer();
    db.get(item.uuid).then(function (response) {
      item._id = response._id;
      item._rev = response._rev;
      item.dateSynced = new Date().toJSON();
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
    //TODO: check if device is online before trying to sync else reject with message while syncing is not possible.
    var deferred = $q.defer();
    if (isSyncing) {
      deferred.reject('Syncing is already in progress');
    }else{
      isSyncing = true;
      var remoteDB = getRemoteDB(dbName);
      console.log('syncing...')
      remoteDB.info()
        .then(function(dbInfo){
          saveItem(remoteDB, item).then(function(response){
            isSyncing = false;
            deferred.resolve(response);
          }, function(saveError){
            isSyncing = false;
            deferred.reject(saveError);
          });
        }, function(dbConError){
          isSyncing = false;
          deferred.reject(dbConError);
      });
    }
    return deferred.promise;
  };

  this.clearPouchDB = function(dbName){
    return getLocalDB(dbName).destroy();
  };

});