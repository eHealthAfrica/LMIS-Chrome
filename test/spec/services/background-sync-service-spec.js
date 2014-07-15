'use strict';

describe('Service: BackgroundSyncService', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var backgroundSyncService;
  var storageService;
  var syncService;
  var $q;
  var deviceInfoFactory;
  var pendingSync = { dbName: 'testdb', uuid: '1234567' };
  var $timeout;

  beforeEach(inject(function(_backgroundSyncService_, _storageService_, _$timeout_, _syncService_, _$q_, _deviceInfoFactory_) {
    backgroundSyncService = _backgroundSyncService_;
    storageService = _storageService_;
    syncService = _syncService_;
    $q =_$q_;
    deviceInfoFactory = _deviceInfoFactory_;
    $timeout = _$timeout_;
    spyOn(storageService, 'find').andCallThrough();
  }));

  describe('syncPendingSync', function(){
    it('should call storageService.find()', function(){
      expect(storageService.find).not.toHaveBeenCalled();
      backgroundSyncService.syncPendingSync(pendingSync);
      expect(storageService.find).toHaveBeenCalled();
    });

    it('should fail with reason if pending sync record does not exist.', function() {
      runs(function() {
        return backgroundSyncService.syncPendingSync(pendingSync)
          .catch(function(reason) {
            expect(reason).toBeDefined();
          });
      });
    });
  });

  describe('syncPendingSyncs', function(){
    it('should call storageService.all with correct parameter.', function(){
      spyOn(storageService, 'all').andCallThrough();
      expect(storageService.all).not.toHaveBeenCalled();
      backgroundSyncService.syncPendingSyncs();
      expect(storageService.all).toHaveBeenCalledWith(storageService.PENDING_SYNCS);
    });
  });

  describe('startBackgroundSync', function(){
    it('should call deviceInfoFactory.canConnect()', function(){
      spyOn(deviceInfoFactory, 'canConnect').andCallThrough();
      expect(deviceInfoFactory.canConnect).not.toHaveBeenCalled();
      backgroundSyncService.startBackgroundSync();
      $timeout.flush(1);
      expect(deviceInfoFactory.canConnect).toHaveBeenCalled();
    });

    it('should fail with a reason', function() {
      runs(function() {
        return backgroundSyncService.startBackgroundSync()
          .catch(function(reason) {
            expect(reason).toBeDefined();
          });
      });
    });
  });

  describe('cancel', function(){
    it('should call $timeout.cancel()', function(){
      spyOn($timeout, 'cancel').andCallThrough();
      expect($timeout.cancel).not.toHaveBeenCalled();
      backgroundSyncService.cancel();
      expect($timeout.cancel).toHaveBeenCalled();
    });
  });

});
