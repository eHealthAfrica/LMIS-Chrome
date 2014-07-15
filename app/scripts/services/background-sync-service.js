'use strict';

angular.module('lmisChromeApp')
  .service('backgroundSyncService', function($q, storageService, appConfigService, i18n, growl, pouchStorageService, syncService, deviceInfoFactory, fixtureLoaderService, analyticsSyncService){

    var backgroundSyncInProgress = false;

    /**
     * @private
     */
    var syncPendingSyncRecord = function(pendingSync) {
      return storageService.find(pendingSync.dbName, pendingSync.uuid)
        .then(function(unsyncedDoc) {
          return syncService.syncUpRecord(pendingSync.dbName, unsyncedDoc)
            .then(function() {
              return storageService.removeRecord(storageService.PENDING_SYNCS, pendingSync.uuid);
            });
        });
    };

    /**
     * @public
     * @param {Object} pendingSync - with dbName and uuid of record to be updated, properties.
     * @returns {*|Promise|Promise|Promise}
     */
    this.syncPendingSync = function(pendingSync) {
      return syncPendingSyncRecord(pendingSync);
    };

    /**
     * @private
     * @returns {Promise|*}
     */
    var syncPendingRecords = function() {
      function syncNextPendingRecord(pendingSyncs, index) {
        var innerDeferred = $q.defer();
        var nextIndex = index - 1;
        if (nextIndex >= 0) {
          var pendingSyncRecord = pendingSyncs[nextIndex];
          syncPendingSyncRecord(pendingSyncRecord)
            .finally(function() {
              syncNextPendingRecord(pendingSyncs, nextIndex);
            });
        } else {
          innerDeferred.resolve(true);//completed
        }
        return innerDeferred.promise;
      };
      //load pending syncs and attempt to sync all of them.
      return storageService.all(storageService.PENDING_SYNCS)
        .then(function(pendingSyncs) {
          return syncNextPendingRecord(pendingSyncs, pendingSyncs.length)
            .then(function(result) {
              return result;
            });
        });
    };

    /**
     * @public
     * @returns {Promise|*}
     */
    this.syncPendingSyncs = function() {
      return syncPendingRecords();
    };

    var updateAppConfigFromRemote = function() {
      return appConfigService.getCurrentAppConfig()
        .then(function(appConfig) {
          if (angular.isObject(appConfig)) {
            var db = pouchStorageService.getRemoteDB(storageService.APP_CONFIG);
            return db.get(appConfig.uuid)
              .then(function(remoteAppConfig) {
                //TODO: should we just update local copy with remote or update only if they are different???.
                //NB: at this point we already have both remote and local copies.
                remoteAppConfig.lastUpdated = new Date().toJSON();
                return appConfigService.save(remoteAppConfig);
              });
          } else {
            return 'app config is not an object.'
          }
        })
    };

    /**
     * This does the following:
     *  1. updates local copy of remote fixture from remote db,
     *  2. updates local copy of app config.
     *  3. sync up pending syncs.
     *  4. runs database compactions.
     *  returns True when an attempt has been made to perform all the steps stated above..
     *
     * @returns {*|Promise}
     */
    this.startBackgroundSync = function() {
      var completedBackgroundSync = true;
      if (backgroundSyncInProgress === true) {
        var deferred = $q.defer();
        deferred.reject('background sync in progress.');
        return deferred.promise;
      }
      return deviceInfoFactory.canConnect()
        .then(function() {
          backgroundSyncInProgress = true;
          return fixtureLoaderService.loadRemoteAndUpdateStorageAndMemory(fixtureLoaderService.REMOTE_FIXTURES)
            .then(function() {
              return updateAppConfigFromRemote()
                .then(function() {
                  growl.success(i18n('remoteAppConfigUpdateMsg'), { ttl: -1 });
                  return syncPendingRecords()
                    .finally(function(){
                      return storageService.compactDatabases();
                    });
                });
            });
        })
        .finally(function() {
          backgroundSyncInProgress = false;
          return completedBackgroundSync;
        });
    };
    
  //analytics syncing bit
  this.syncOfflineAnalytics = function(){
      var deferred = $q.defer();
      deviceInfoFactory.canConnect()
        .then(function () {
           analyticsSyncService.syncAnalyticsTable(storageService.CLICKS,0);
           analyticsSyncService.syncAnalyticsTable(storageService.PAGEVIEWS,1);
           analyticsSyncService.syncAnalyticsTable(storageService.EXCEPTIONS,2);
           
           analyticsSyncService.syncLostRecords(storageService.ANALYTICS_LOST_CLICKS ,'clicks');
           analyticsSyncService.syncLostRecords(storageService.ANALYTICS_LOST_PAGEVIEWS ,'pageviews');
           analyticsSyncService.syncLostRecords(storageService.ANALYTICS_LOST_EXCEPTIONS ,'exceptions');
        }).catch(function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
  };

  });
