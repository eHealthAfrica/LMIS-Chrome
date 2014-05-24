'use strict';

describe('Service: SyncService', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var syncService, pouchdb, $q, db, dbName, $window;

  beforeEach(inject(function(_syncService_, _pouchdb_, _$q_, _$window_) {
    syncService = _syncService_;
    pouchdb = _pouchdb_;
    $q = _$q_;
    $window = _$window_;
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

  it('i expect syncItem to fail with appropriate error msg if device is offline', function(){
    $window.navigator.onLine = false; //simulate offline
    runs(
        function () {
          return syncService.syncItem(dbName, {name: 'testuser', password: '123456'});
        },
        function checkExpectations(result) {
          expect(result).toBe(syncService.DEVICE_OFFLINE_ERR_MSG);
        }
    );
  });

});
