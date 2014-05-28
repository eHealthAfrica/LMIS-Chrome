'use strict';

angular.module('lmisChromeApp').service('syncService', function ($q, storageService, pouchdb, $rootScope, config, $window) {

  var isSyncing = false;
  var DEVICE_OFFLINE_ERR_MSG = 'device is not online, check your internet connection settings.';
  this.DEVICE_OFFLINE_ERR_MSG = DEVICE_OFFLINE_ERR_MSG;//make err msg public

  var getLocalDb = function(dbUrl){
    return pouchdb.create(dbUrl);
  };

  var getRemoteDB = function(dbName){
    var REMOTE = config.api.url + '/' + dbName;
    return pouchdb.create(REMOTE);
  };

  var updateItemKeysAndUpdateLocalCopy = function(dbName, item, response){
    item._id = response.id;
    item._rev = response.rev;
    var updateModifiedDate = false;
    return storageService.update(dbName, item, updateModifiedDate);
  };

  var saveItem = function(dbName, db, item){
    var deferred = $q.defer();
    item.dateSynced = new Date().toJSON();//update sync date
    db.get(item.uuid).then(function (response) {
      item._id = response._id;
      item._rev = response._rev;
      db.put(item, response._id, response._rev)
      .then(function (result) {
        updateItemKeysAndUpdateLocalCopy(dbName, item, result);//FIXME: resolve this promise and return it.
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    }, function () {
      db.put(item, item.uuid)
      .then(function (result) {
        updateItemKeysAndUpdateLocalCopy(dbName, item, result)
            .finally(function(){
              $rootScope.$$phase || $rootScope.$digest();//update view.
            }); //FIXME: resolve this promise and return it.
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    });
    return deferred.promise;
  };

  this.syncItem = function(dbName, item, allowMultipleSync){
    var deferred = $q.defer();
    if(typeof allowMultipleSync !== 'undefined'){
      isSyncing  = allowMultipleSync;
    }
    if (isSyncing) {
      deferred.reject('Syncing is already in progress');
    }else if(!$window.navigator.onLine){
      deferred.reject(DEVICE_OFFLINE_ERR_MSG);
    }else{
      isSyncing = true;
      var remoteDB = getRemoteDB(dbName);
      remoteDB.info()
        .then(function(){
          saveItem(dbName, remoteDB, item).then(function(response){
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
    return getLocalDb(dbName).destroy();
  };

  this.addSyncStatus = function (objList) {
    if (!angular.isArray(objList)) {
      throw 'an array parameter is expected.';
    }
    return objList.map(function (obj) {
      if (obj !== 'undefined') {
        if((obj.dateSynced && obj.modified) && (new Date(obj.dateSynced) >= new Date(obj.modified))){
          obj.synced = true;
        }else{
          obj.synced = false;
        }
        return obj;
      }
    });
  };

});