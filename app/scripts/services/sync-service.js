'use strict';

angular.module('lmisChromeApp').service('syncService', function ($q, storageService, pouchdb, $rootScope, config, $window, $interval) {

  var isSyncing = false;
  var deviceIsOfflineMsg = 'device is not online, check your internet connection settings.';
  this.DEVICE_OFFLINE_ERR_MSG = deviceIsOfflineMsg;//make err msg public
  var syncAlreadyInProgress = 'Syncing is already in progress. please wait.';
  this.SYNC_ALREADY_IN_PROGRESS = syncAlreadyInProgress;
  var pendingSyncRecordNotFound = 'Pending Sync record does not exist!';
  this.PENDING_SYNC_RECORD_NOT_FOUND = pendingSyncRecordNotFound;
  var sameRevisionNoMsg = 'both local and remote copy have same revision number.';
  var THIRTY_SECS_DELAY = 30 * 1000;//30 secs
  var MAX_CONNECTION_ATTEMPT = 10;

  var getLocalDb = function (dbUrl) {
    return pouchdb.create(dbUrl);
  };

  var getRemoteDb = function (dbName) {
    var REMOTE = config.api.url + '/' + dbName;
    return pouchdb.create(REMOTE);
  };

  var updateLocalRecordAfterSync = function (dbName, item, response) {
    item._id = response.id;
    item._rev = response.rev;
    var updateModifiedDate = false;
    //TODO: pull local copy, update its _id, _rev and dateSynced properties and save back.
    return storageService.update(dbName, item, updateModifiedDate);
  };

  var saveItem = function (dbName, db, item) {
    item.dateSynced = new Date().toJSON();//update sync date
    var deferred = $q.defer();
    db.get(item.uuid)
        .then(function (response) {
          item._id = response._id;
          item._rev = response._rev;
          //TODO: consider refactoring db.put into a separate function
          db.put(item, response._id, response._rev)
              .then(function (saveResult) {
                updateLocalRecordAfterSync(dbName, item, saveResult)
                    .finally(function () {
                      deferred.resolve(saveResult);
                    });
              })
              .catch(function (error) {
                deferred.reject(error);
              });
        }).catch(function () {
          //TODO: consider refactoring db.put into a separate function
          db.put(item, item.uuid)
              .then(function (result) {
                updateLocalRecordAfterSync(dbName, item, result)
                    .finally(function () {
                      deferred.resolve(result);
                    });
              })
              .catch(function (error) {
                deferred.reject(error);
              });
        });
    return deferred.promise;
  };


  /**
   * This syncs a given record to remote db of the given dbName, returns sync status if successful
   * Else: add record to pending sync record and returns reason for failed syncing.
   * @param dbName
   * @param record
   * @returns {promise|Function|promise|promise|promise|*}
   */
  var syncARecord = function (dbName, record, allowMultipleSync) {
    if(typeof allowMultipleSync === 'undefined'){
      isSyncing = allowMultipleSync;
    }
    var pendingSyncRecord = { dbName: dbName, uuid: record.uuid };
    var deferred = $q.defer();
    if (isSyncing) {
      //add to pending sync list
      addToPendingSyncList(pendingSyncRecord)
          .finally(function () {
            deferred.reject(syncAlreadyInProgress);
          });
    } else if (!$window.navigator.onLine) {
      //add to pending sync list
      addToPendingSyncList(pendingSyncRecord)
          .finally(function () {
            deferred.reject(deviceIsOfflineMsg);
          });
    } else {
      isSyncing = true;
      var remoteDB = getRemoteDb(dbName);
      remoteDB.info()
          .then(function () {
            saveItem(dbName, remoteDB, record)
                .then(function (response) {
                  isSyncing = false;
                  deferred.resolve(response);
                }).catch(function (saveError) {
                  addToPendingSyncList(pendingSyncRecord)
                      .finally(function () {
                        deferred.reject(saveError);
                        isSyncing = false;
                      });
                });
          })
          .catch(function (dbConError) {
            addToPendingSyncList(pendingSyncRecord)
                .finally(function () {
                  deferred.reject(dbConError);
                  isSyncing = false;
                });
          });
    }
    return deferred.promise;
  };

  /**
   * expose or make sync an single item function public.
   * @type {Function}
   */
  this.syncItem = syncARecord;

  this.clearPouchDB = function (dbName) {
    return getLocalDb(dbName).destroy();
  };

  this.addSyncStatus = function (objList) {
    if (!angular.isArray(objList)) {
      throw 'an array parameter is expected.';
    }
    return objList.map(function (obj) {
      if (obj !== 'undefined') {
        if ((obj.dateSynced && obj.modified) && (new Date(obj.dateSynced) >= new Date(obj.modified))) {
          obj.synced = true;
        } else {
          obj.synced = false;
        }
        return obj;
      }
    });
  };

  /**
   * This checks if the dbName and record is defined so that records are not saved as undefined in the pending sync db.
   * @param dbName
   * @param record
   * @returns {*|Session}
   */
  var addToPendingSyncList = function (pendingSync) {
    if (!angular.isString(pendingSync.dbName)) {
      throw 'dbName is undefined or not a string';
    }
    if (!angular.isString(pendingSync.uuid)) {
      throw 'record.uuid is undefined or not a string.';
    }
    return storageService.save(storageService.PENDING_SYNCS, pendingSync);
  };

  /**
   * expose addToPendingSyncList and make it public;
   * @type {Function}
   */
  this.addToPendingSync = addToPendingSyncList;


  /**
   * This function takes a single YET-TO-BE-SYNCED record, then uses the pendingSyncRecord dbName and uuid to load the
   * complete record from the dbName table and syncs the record then removes the record from pending sync record list.
   * @param pendingSync
   * @returns {promise|Function|promise|promise|promise|*}
   */
  var updatePendingSyncRecord = function (pendingSync) {
    var deferred = $q.defer();
    //FIXME: storageService.find() will return records without complete object for nested attributes, think of best way
    //FIXME: to use the appropriate factory get() function which will return complete nested object.
    //TODO: first of all consider if it is necessary to sync complete object or sync just what is on local db.
    storageService.find(pendingSync.dbName, pendingSync.uuid)
        .then(function (record) {
          if (typeof record === 'undefined') {
            deferred.reject(pendingSyncRecordNotFound);
          } else if (!record.hasOwnProperty('uuid')) {
            deferred.reject('record found but does not have a uuid.');
          } else {
            syncARecord(pendingSync.dbName, record)
                .then(function (result) {
                  //remove pending sync record if SYNC was successful and resolve sync result, because sync result is
                  //of higher priority here.
                  storageService.removeRecord(storageService.PENDING_SYNCS, pendingSync.uuid)
                      .then(function () {
                        deferred.resolve(result);
                      })
                      .catch(function () {
                        deferred.resolve(result);
                      });
                })
                .catch(function (syncError) {
                  deferred.reject(syncError);
                });
          }
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    return deferred.promise;
  };

  /**
   * expose private method.
   * @type {Function}
   */
  this.syncPendingSyncRecord = updatePendingSyncRecord;

  /**
   * This determines if the device/app can make a connection to a remote server by performing the following checks.
   *
   * 1) checks if the device is online or has internet connection.
   * 2) makes multiple connection attempts to remote test connection db.
   *
   * This resolves True if:
   *
   * 1) device is online AND
   * 2) connects successfully to remote test connection db
   *
   * Else: rejects with connection error after making MAX connection attempts..
   *
   * @returns {promise|Function|promise|promise|promise|*}
   */
  var canConnect = function () {
    var deferred = $q.defer();
    var testDb = 'connection_test';
    var counter = 0;
    var reason;
    if (!$window.navigator.onLine) {
      deferred.reject(deviceIsOfflineMsg);
    } else {
      var syncRequest = $interval(function () {
        if (counter < MAX_CONNECTION_ATTEMPT) {
          try {
            var remoteDb = getRemoteDb(testDb);
            remoteDb.info()
                .then(function () {
                  $interval.cancel(syncRequest);//free $interval to avoid memory leak
                  deferred.resolve(true);
                  counter = MAX_CONNECTION_ATTEMPT;
                })
                .catch(function (conError) {
                  reason = conError;
                  counter = counter + 1;
                });
          } catch (e) {
            reason = e;
            counter = counter + 1;
          }
        } else {
          deferred.reject(reason);//couldn't establish connection
          $interval.cancel(syncRequest);//free $interval to avoid memory leak
        }
      }, THIRTY_SECS_DELAY);
    }
    return deferred.promise;
  };

  /**
   * expose private method
   * @type {Function}
   */
  this.canConnect = canConnect;

  /**
   * This goes through pending sync list and try to sync all yet to be synced records, it returns True when
   * it must have tried to sync all pending syncs that DOES NOT mean that all syncs were completed successfully.
   *
   * @returns {promise|Function|promise|promise|promise|*}
   */
  var backgroundSyncingOfPendingRecords = function () {
    var outerDeferred = $q.defer();
    var syncNextPendingRecord = function (pendingSyncs, index) {
      var innerDeferred = $q.defer();
      var nextIndex = index - 1;
      if (nextIndex >= 0) {
        var pendingSyncRecord = pendingSyncs[nextIndex];
        updatePendingSyncRecord(pendingSyncRecord)
            .finally(function () {
              syncNextPendingRecord(pendingSyncs, nextIndex);
            });
      } else {
        innerDeferred.resolve(true);//completed
      }
      return innerDeferred.promise;
    };

    //load pending syncs and attempt to sync all of them.
    storageService.all(storageService.PENDING_SYNCS)
        .then(function (pendingSyncs) {
          syncNextPendingRecord(pendingSyncs, pendingSyncs.length)
              .then(function (result) {
                outerDeferred.resolve(result);
              })
              .catch(function (error) {
                outerDeferred.reject(error);
              });
        })
        .catch(function (error) {
          outerDeferred.reject(error);
        });
    return outerDeferred.promise;
  };

  /**
   * expose private methods.
   * @type {Function}
   */
  this.backgroundSyncingOfPendingRecords = backgroundSyncingOfPendingRecords;

  /**
   * This uses canConnect() to get device/app connection status if it can connect, it starts background syncing.
   *
   * It rejects with reason why it couldn't connect, if it can establish connection, it returns true which means that
   * an attempt has been made toi sync all pending syncs this does not guarantee that all pending syncs has been
   * completed.
   *
   * {promise|Function|promise|promise|promise|*}
   */
  this.backgroundSync = function(){
    var deferred = $q.defer();
    canConnect()
        .then(function () {
          backgroundSyncingOfPendingRecords()
              .then(function (result) {
                deferred.resolve(result);
              })
              .catch(function (reason) {
                deferred.reject(reason);
              })
              .finally(function(){
                $rootScope.$$phase || $rootScope.$digest(); //update views
              });
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    return deferred.promise;
  };

//
//  /**
//   * This function makes MAX_CONNECTION_ATTEMPT attempts to to sync yet to be synced records.
//   * @returns {promise|Function|promise|promise|promise|*}
//   */
//  this.persistentBackgroundSync = function(){
//    var deferred = $q.defer();
//    var counter = 0;
//    var terminate = function(syncRequest){
//      deferred.resolve(true); //True to show that max connection attempts or background has been completed.
//      $interval.cancel(syncRequest);//cancel further interval fxn execution.
//    };
//    var syncRequest = $interval(function () {
//      if (counter < MAX_CONNECTION_ATTEMPT) {
//        canConnect()
//            .then(function (result) {
//              if (result === true && counter < MAX_CONNECTION_ATTEMPT) {
//                counter = MAX_CONNECTION_ATTEMPT; //cancel further connection attempt
//                backgroundSyncingOfPendingRecords()
//                    .finally(function () {
//                      terminate(syncRequest);
//
//                    });
//              } else {
//                counter = counter + 1;
//              }
//            })
//            .catch(function () {
//              counter = counter + 1;
//            });
//      } else {
//        terminate(syncRequest);
//      }
//    }, THIRTY_SECS_DELAY);
//    return deferred.promise;
//  };

  /**
   *
   * @param dbName{String} - database name of the record to be updated.
   * @param record{Object} - object with uuid as one of its properties.
   * @returns {promise|Function|promise|promise|promise|*}
   */
  this.updateFromRemote = function(dbName, record){
    if(!record.hasOwnProperty('uuid')){
      throw 'record to be updated remotely does not have a uuid.';
    }
    var deferred = $q.defer();
    var remoteDb = getRemoteDb(dbName);
    remoteDb.info()
        .then(function () {
          remoteDb.get(record.uuid)
              .then(function(result){
                //TODO: discuss if it is possible that remote and local copy record structure will be different.
                if(record._rev !== result._rev){
                  storageService.update(dbName, result)
                      .then(function(saveResult){
                        deferred.resolve(saveResult);
                      })
                      .catch(function(saveError){
                        deferred.reject(saveError);
                      });
                }else{
                  deferred.reject(sameRevisionNoMsg);
                }
              })
              .catch(function(reason){
                deferred.reject(reason);
              });
        })
        .catch(function (dbConError) {
          deferred.reject(dbConError);
        });
    return deferred.promise;
  };

});