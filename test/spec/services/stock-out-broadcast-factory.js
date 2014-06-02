'use strict';

describe('StockOutBroadcast Factory', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var stockOutBroadcastFactory, storageService, syncService, notificationService, stockOut, $q, inventoryRulesFactory;

  beforeEach(inject(function(_stockOutBroadcastFactory_, _storageService_, _syncService_, _notificationService_, _$q_
      , _inventoryRulesFactory_) {
    stockOutBroadcastFactory = _stockOutBroadcastFactory_;
    storageService = _storageService_;
    syncService = _syncService_;
    notificationService = _notificationService_;
    $q = _$q_;
    inventoryRulesFactory = _inventoryRulesFactory_;
    stockOut = { uuid: '1234', facility: { uuid: '123-88766' } , stockLevel: 121, productType: { uuid: '3214' } };
  }));

  it('as a user, i expect "stockOutBroadcastFactory" to be defined', function(){
    expect(stockOutBroadcastFactory).toBeDefined();
  });

  it('i expect stockOutBroadcastFactory.save() to call storageService.save() with given stockOut object.', function(){
    spyOn(storageService, 'save').andCallThrough();
    expect(storageService.save).not.toHaveBeenCalled();
    stockOutBroadcastFactory.save(stockOut);
    expect(storageService.save).toHaveBeenCalledWith(storageService.STOCK_OUT, stockOut);
  });

  it('i expect stockOutBroadcastFactory.broadcast() to call syncService.syncItem(). with multipleSync = true', function(){
    spyOn(syncService, 'syncItem').andCallThrough();
    expect(syncService.syncItem).not.toHaveBeenCalled();
    stockOutBroadcastFactory.broadcast(stockOut);
    var allowMultipleSync =  true;
    expect(syncService.syncItem).toHaveBeenCalledWith(storageService.STOCK_OUT, stockOut, allowMultipleSync);
  });

  it('i expect stockOutBroadcastFactory.getAll() to call storageService.all()', function(){
    spyOn(storageService, 'all').andCallThrough();
    expect(storageService.all).not.toHaveBeenCalled();
    stockOutBroadcastFactory.getAll();
    expect(storageService.all).toHaveBeenCalledWith(storageService.STOCK_OUT);
  });

  it('i expect stockOutBroadcastFactory.addStockLevelAndSave() to call inventoryRulesFactory.getStockLevel', function(){
    spyOn(inventoryRulesFactory, 'getStockLevel').andCallThrough();
    spyOn(storageService, 'save').andCallThrough();
    expect(inventoryRulesFactory.getStockLevel).not.toHaveBeenCalled();
    stockOutBroadcastFactory.addStockLevelAndSave(stockOut);
    expect(inventoryRulesFactory.getStockLevel).toHaveBeenCalled();
  });

});
