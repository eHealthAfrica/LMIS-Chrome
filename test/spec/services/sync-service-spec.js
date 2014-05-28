'use strict';

describe('Service: SyncService', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var syncService, pouchdb, $q, db, dbName, recordWithoutUuid, storageService, recordWithUuid, $window;

  beforeEach(inject(function(_syncService_, _pouchdb_, _$q_, _$window_, _storageService_) {
    syncService = _syncService_;
    pouchdb = _pouchdb_;
    $q = _$q_;
    $window = _$window_;
    storageService = _storageService_;
    recordWithoutUuid = {name: 'test', date: new Date() };
    recordWithUuid = {uuid: '123', name: 'test', date: new Date() };
    db = {
      destroy: function(){ return $q.when(true); },
      info: function(){ return $q.when({}); }
    };
    dbName = 'testdb';
    spyOn(pouchdb, 'create').andCallFake(function(dbName){ return db });
  }));

  it('i expect sync-service to be defined ', function(){
    expect(syncService).toBeDefined();
  });

  it('i expect addSyncStatus to throw an exception when called with non-array parameter', function(){
    expect(function(){ syncService.addSyncStatus('non-array')}).toThrow();
  });

  it('i expect addSyncStatus return an array where each object has its correct sync status', function(){
    var now = new Date();
    var intervalDiff = 60 * 1000;//1 minute
    var objList =  [
      {uuid: 1, dateSynced: new Date()}, //synced = false
      {uuid: 2, modified: new Date()}, //synced = false
      {uuid: 3, modified: now, dateSynced: new Date(now.getTime() + intervalDiff)},//synced = true
      {uuid: 4, modified: new Date(now + intervalDiff), dateSynced: now}, //synced = False,
      {uuid: 5}//synced = false
    ];
    var objSyncStatusList = syncService.addSyncStatus(objList);
    for(var index in objSyncStatusList){
      var obj = objSyncStatusList[index];
      if(obj.uuid === 3){
        expect(obj.synced).toBeTruthy();
      }else{
        expect(obj.synced).toBeFalsy();
      }
    }
  });

  it('i expect clearPouchDB(dbName) to clear local pouchDb copy of dbName', function(){
    spyOn(db, 'destroy').andCallThrough();
    syncService.clearPouchDB(dbName)
    expect(pouchdb.create).toHaveBeenCalledWith(dbName);
    expect(db.destroy).toHaveBeenCalled();
  });

  it('i expect syncItem to update pending sync record if device is offline', function(){
    expect($window.navigator.onLine).toBeFalsy();//ensure that device is offline
    spyOn(storageService, 'save').andCallThrough();
    syncService.syncItem(dbName, {uuid: '123456', name: 'testuser', password: '123456'});
    expect(storageService.save).toHaveBeenCalled();
  });

  it('i expect addToPendingSync to throw exception when called with undefined pendingSync.uuid and pendingSync.dbName', function(){
    var pendingSync = { dbName: undefined, uuid: undefined };
    expect(function(){ syncService.addToPendingSync(pendingSync); }).toThrow();
  });

  it('i expect addToPendingSync to throw exception when called with pendingSync that has undefined dbName', function(){
    var pendingSync = {dbName: undefined, uuid: recordWithUuid.uuid};
    expect(function(){syncService.addToPendingSync(pendingSync)}).toThrow();
  });

  it('i expect addToPendingSync to throw exception when called with non-string dbName', function(){
    var pendingSync = { dbName: {name: '1234'}, uuid: '12345' };
    expect(function(){ syncService.addToPendingSync(pendingSync); }).toThrow();
  });

  it('i expect addToPendingSync to call storageService.save when called with correct parameters.', function(){
    spyOn(storageService, 'save').andCallThrough();
    var pendingSync = { dbName: dbName, uuid: '12345' }
    syncService.addToPendingSync(pendingSync);
    expect(storageService.save).toHaveBeenCalled();
  });

  it('i expect syncPendingSyncRecord to sync pending records', function(){
    var pendingSyncs = {
      '123': { uuid: 123, dbName: 'testDb'},
      '234': { uuid: 234, dbName: 'testDb2'}
    };
    spyOn(storageService, 'find').andCallFake(function(dbName, uuid){
      if(dbName === storageService.PENDING_SYNCS){
        var pendingSync = pendingSyncs[uuid];
        return $q.when(pendingSync);
      }else{
        return $q.when(undefined);//not found
      }
    });
    var pendingSyncRecord = {uuid: '123', dbName: 'testDb' };
    syncService.syncPendingSyncRecord(pendingSyncRecord);
    expect(storageService.find).toHaveBeenCalledWith(pendingSyncRecord.dbName, pendingSyncRecord.uuid);
    //FIXME: add more test when you mock $window.navigator.onLine
  });

  it('i expect backgroundSyncingOfPendingRecords to retrieve yet to be synced record list.', function(){
    spyOn(storageService, 'all').andCallThrough();
    syncService.backgroundSyncingOfPendingRecords();
    expect(storageService.all).toHaveBeenCalledWith(storageService.PENDING_SYNCS);
  });

});
