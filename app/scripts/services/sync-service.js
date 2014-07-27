'use strict';

angular.module('lmisChromeApp')
  .service('syncService', function($q, storageService, pouchStorageService, utility, deviceInfoFactory) {

    /**
     * @private
     * @param {String} dbName
     * @param {Object} item
     * @param {Object} syncResult - sync response object that has _id and _rev property.
     * @returns {*|Progress}
     */
    var updateLocalRecordAfterSync = function(dbName, item, syncResult) {
      item._id = syncResult.id;
      item._rev = syncResult.rev;
      var shouldUpdateModifiedDate = false;
      return storageService.update(dbName, item, shouldUpdateModifiedDate);
    };

    /**
     * @private
     * @param {String} dbName
     * @param {Object} doc - expected to have uuid property.
     * @returns {*}
     */
    var syncUp = function(dbName, doc) {
      if (typeof doc.uuid !== 'string') {
        throw new Error('document\'s uuid is not a string.');
      }
      if (typeof dbName !== 'string') {
        throw new Error('database name is not a string.');
      }
      doc.dateSynced = new Date().toJSON();//update sync date
      var db = pouchStorageService.getRemoteDB(dbName);
      return db.get(doc.uuid)
        .then(function(response) {
          doc._id = response._id;
          doc._rev = response._rev;
          return db.put(doc, response._id, response._rev);
        }).catch(function() {
          return db.put(doc, doc.uuid);
        });
    };

    /**
     * @private
     * @param {String} dbName
     * @param {Object} doc
     * @returns {*|Promise|Promise|!Promise.<R>}
     */
    var syncUpAndUpdateLocal = function(dbName, doc) {
      return syncUp(dbName, doc)
        .then(function(syncResult) {
          return updateLocalRecordAfterSync(dbName, doc, syncResult);
        });
    };

    var addToPendingSyncList = function(pendingSync) {
      if (!angular.isString(pendingSync.dbName)) {
        throw new Error('dbName is undefined or not a string');
      }
      if (!angular.isString(pendingSync.uuid)) {
        throw new Error('record.uuid is undefined or not a string.');
      }
      return storageService.save(storageService.PENDING_SYNCS, pendingSync);
    };

    /**
     * @private
     * @param {String} dbName
     * @param {Object} doc
     * @returns {*|Promise|Promise|!Promise}
     */
    var syncUpDoc = function(dbName, doc) {
      var pendingSync = { dbName: dbName, uuid: doc.uuid };
      if (deviceInfoFactory.isOnline()) {
        return syncUpAndUpdateLocal(dbName, doc)
          .catch(function(reason) {
            console.error(reason);
            return addToPendingSyncList(pendingSync);
          });
      } else {
        return addToPendingSyncList(pendingSync);
      }
    };

    /**
     * @public
     * @param {String} dbName
     * @param {Object} doc
     * @returns {*|Promise|Promise|!Promise}
     */
    this.syncUpRecord = function(dbName, doc) {
      return syncUpDoc(dbName, doc);
    };

    this.addSyncStatus = function(objList) {
      if (!angular.isArray(objList)) {
        throw new Error('an array parameter is expected.');
      }
      return objList.map(function(obj) {
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
     * @param {Object} pendingSync - with string dbName and uuid property.
     * @returns {*|Promise|Promise}
     */
    this.addToPendingSync = function(pendingSync) {
      return addToPendingSyncList(pendingSync);
    };
  });
