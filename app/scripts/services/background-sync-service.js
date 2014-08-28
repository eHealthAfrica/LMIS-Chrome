'use strict';

angular.module('lmisChromeApp')
  .service('backgroundSyncService', function($q, storageService, appConfigService, i18n, growl, pouchStorageService, syncService, deviceInfoFactory, fixtureLoaderService, $timeout) {

    var backgroundSyncInProgress = false;
    var sync;

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
      }

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
                // SEE: item #776
                remoteAppConfig.lastUpdated = new Date().toJSON();
                var nearbyLgas = remoteAppConfig.facility.selectedLgas
                  .map(function(lga) {
                    if (lga._id) {
                      return lga._id;
                    }
                  });
                return fixtureLoaderService.setupWardsAndFacilitesByLgas(nearbyLgas)
                  .then(function() {
                    return appConfigService.save(remoteAppConfig);
                  });
              });
          } else {
            return $q.reject('app config is not an object.');
          }
        });
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

      sync = $timeout(function() {
        return deviceInfoFactory.canConnect()
          .then(function() {
            backgroundSyncInProgress = true;
            return fixtureLoaderService.loadRemoteAndUpdateStorageAndMemory(fixtureLoaderService.REMOTE_FIXTURES)
              .then(function() {
                return updateAppConfigFromRemote()
                  .then(function() {
                    var TEN_SECS = 10000;
                    growl.success(i18n('remoteAppConfigUpdateMsg'), { ttl: TEN_SECS });
                    return syncPendingRecords()
                      .finally(function() {
                        return storageService.compactDatabases();
                      })
                      .finally(function() {
                        return storageService.viewCleanups();
                      });
                  });
              });
          })
          .finally(function() {
            backgroundSyncInProgress = false;
            $timeout.cancel(sync);
            return completedBackgroundSync;
          });
      }, 1);

      return sync;
    };

    this.cancel = function() {
      $timeout.cancel(sync);
    };

  });
