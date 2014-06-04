'use strict';

describe('Factory: ccuBreakdownFactory', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate factory
  var ccuBreakdownFactory, storageService, ccuBreakdownReport, syncService;

  beforeEach(inject(function(_ccuBreakdownFactory_, _storageService_, _syncService_) {
    ccuBreakdownFactory = _ccuBreakdownFactory_;
    storageService = _storageService_;
    syncService = _syncService_;
    ccuBreakdownReport = {
      uuid: '1234',
      facility: { uuid: '1234', name: 'test facility' },
      ccuProfile: { dhis2_modelid: '1234-89292' }
    };
    spyOn(syncService, 'syncItem').andCallThrough();
  }));

  it('i expect ccuBreakdownFactory to be defined ', function(){
    expect(ccuBreakdownFactory).toBeDefined();
  });

  it('i expect ccuBreakdownFactory.save() to call storageService.save', function(){
    spyOn(storageService, 'save').andCallThrough();
    expect(storageService.save).not.toHaveBeenCalled();
    ccuBreakdownFactory.save(ccuBreakdownReport);
    expect(storageService.save).toHaveBeenCalled();
  });

  it('i expect ccuBreakdownFactory.saveAndSendReport() to call storageService then syncService.syncItem.', function(){
    spyOn(storageService, 'save').andCallThrough();
    ccuBreakdownFactory.saveAndSendReport(ccuBreakdownReport);
    expect(storageService.save).toHaveBeenCalled();
  });

  it('i expect ccuBreakdownFactory.broadcast() to call syncService.syncItem().', function(){
    expect(syncService.syncItem).not.toHaveBeenCalled();
    ccuBreakdownFactory.broadcast(ccuBreakdownReport);
    var allowMultipleSync = true;
     expect(syncService.syncItem).toHaveBeenCalledWith(storageService.CCU_BREAKDOWN, ccuBreakdownReport, allowMultipleSync);
  });

});
