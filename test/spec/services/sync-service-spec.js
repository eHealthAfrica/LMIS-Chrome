'use strict';

describe('Service: SyncService', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var syncService, pouchdb, $q, db, dbName, recordWithoutUuid, storageService, recordWithUuid, $window, deviceInfoFactory;

  beforeEach(inject(function(_syncService_, _pouchdb_, _$q_, _$window_, _storageService_, _deviceInfoFactory_) {
    syncService = _syncService_;
    pouchdb = _pouchdb_;
    deviceInfoFactory = _deviceInfoFactory_;
    $q = _$q_;
    $window = _$window_;
    storageService = _storageService_;
    recordWithoutUuid = {name: 'test', date: new Date() };
    recordWithUuid = {uuid: '1234', name: 'test', date: new Date() };

    db = {
      destroy: function() {
        return $q.when(true);
      },
      info: function() {
        return $q.when({});
      },
      get: function(uuid) {
        return $q.when({ _rev: '1234', _id: uuid, name: 'test', date: new Date() });
      },
      allDocs: function() {
        return $q.when([]);
      }
    };
    dbName = 'testdb';
    spyOn(pouchdb, 'create').andCallFake(function() {
      return db;
    });
  }));

  it('i expect sync-service to be defined ', function() {
    expect(syncService).toBeDefined();
  });

  it('i expect addSyncStatus to throw an exception when called with non-array parameter', function() {
    expect(function() {
      syncService.addSyncStatus('non-array');
    }).toThrow();
  });

  it('i expect addSyncStatus return an array where each object has its correct sync status', function() {
    var now = new Date();
    var intervalDiff = 60 * 1000;//1 minute
    var objList = [
      {uuid: 1, dateSynced: new Date()}, //synced = false
      {uuid: 2, modified: new Date()}, //synced = false
      {uuid: 3, modified: now, dateSynced: new Date(now.getTime() + intervalDiff)},//synced = true
      {uuid: 4, modified: new Date(now + intervalDiff), dateSynced: now}, //synced = False,
      {uuid: 5}//synced = false
    ];
    var objSyncStatusList = syncService.addSyncStatus(objList);
    for (var index in objSyncStatusList) {
      var obj = objSyncStatusList[index];
      if (obj.uuid === 3) {
        expect(obj.synced).toBeTruthy();
      } else {
        expect(obj.synced).toBeFalsy();
      }
    }
  });

  it('i expect syncUpRecord to update pending sync record if device is offline', function() {
    expect(deviceInfoFactory.isOnline()).toBeFalsy();
    spyOn(storageService, 'save').andCallThrough();
    syncService.syncUpRecord(dbName, { uuid: '123456', name: 'testuser', password: '123456' });
    expect(storageService.save).toHaveBeenCalled();
  });

  it('i expect addToPendingSync to throw exception when called with undefined pendingSync.uuid and pendingSync.dbName', function() {
    var pendingSync = { dbName: undefined, uuid: undefined };
    expect(function() {
      syncService.addToPendingSync(pendingSync);
    }).toThrow();
  });

  it('i expect addToPendingSync to throw exception when called with pendingSync that has undefined dbName', function() {
    var pendingSync = {dbName: undefined, uuid: recordWithUuid.uuid};
    expect(function() {
      syncService.addToPendingSync(pendingSync);
    }).toThrow();
  });

  it('i expect addToPendingSync to throw exception when called with non-string dbName', function() {
    var pendingSync = { dbName: {name: '1234'}, uuid: '12345' };
    expect(function() {
      syncService.addToPendingSync(pendingSync);
    }).toThrow();
  });

  it('i expect addToPendingSync to call storageService.save when called with correct parameters.', function() {
    spyOn(storageService, 'save').andCallThrough();
    var pendingSync = { dbName: dbName, uuid: '12345' };
    syncService.addToPendingSync(pendingSync);
    expect(storageService.save).toHaveBeenCalled();
  });

});
