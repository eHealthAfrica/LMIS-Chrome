'use strict';

describe('Factory: productTypeFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'memoryStoreMocks'));

  // instantiate dependencies
  var productTypeFactory;
  var storageService;
  var memoryStorageService;
  var memoryStore;

  beforeEach(inject(function (_productTypeFactory_, _storageService_, _memoryStorageService_, memoryStoreMock, cacheService) {
    productTypeFactory = _productTypeFactory_;
    storageService = _storageService_;
    memoryStorageService = _memoryStorageService_;
    memoryStore = memoryStoreMock.memoryStore;

    spyOn(memoryStorageService, 'get').andCallFake(function(dbName, key){
      return memoryStoreMock.memoryStore[dbName][key];
    });

    spyOn(cacheService, 'get').andCallFake(function () {
      return memoryStoreMock.memoryStore
    });

    spyOn(memoryStorageService, 'getDatabase').andCallFake(function (dbName) {
      return memoryStore[dbName];
    });

  }));

  it('i expect productTypeFactory to be defined ', function () {
    expect(productTypeFactory).toBeDefined();
  });

  it('i expect productTypeFactory.get() to return expected productType.', function () {
    var uuid = '00f987e4-54e1-46f0-820b-b249a6d38759';//Measles
    var result = productTypeFactory.get(uuid);
    var expectedResult = memoryStore[storageService.PRODUCT_TYPES][uuid];
    expect(result).toBe(expectedResult);
    expect(result.code).toBe('Measles');
  });

  it('i expect productTypeFactory.get() to call memoryStorageService.get() with the right parameter.', function(){
    expect(memoryStorageService.get).not.toHaveBeenCalled();
    var uuid = '00f987e4-54e1-46f0-820b-b249a6d38759';//Measles
    productTypeFactory.get(uuid);
    expect(memoryStorageService.get).toHaveBeenCalledWith(storageService.PRODUCT_TYPES, uuid);
  });

  it('i expect productTypeFactory.getAll() to call memoryStorageService.getDatabase() with the right parameters.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    productTypeFactory.getAll();
    expect(memoryStorageService.getDatabase).toHaveBeenCalledWith(storageService.PRODUCT_TYPES);
  });

  it('i expect productTypeFactory.getAll() to return an array of product types.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    var result = productTypeFactory.getAll();
    expect(result.length).toBeGreaterThan(0);
    var elem = result[0];
    expect(elem).toBeDefined();
  });

   it('i expect productTypeFactory.get() to call uomFactory.get() so that base_uom: object is loaded.', function(){
    expect(memoryStorageService.get).not.toHaveBeenCalled();
    var uuid = '00f987e4-54e1-46f0-820b-b249a6d38759';//Measles
     var base_uom = 'e5def927-b173-44b6-9112-3103a473a65c';//doses
    productTypeFactory.get(uuid);
    expect(memoryStorageService.get).toHaveBeenCalledWith(storageService.PRODUCT_TYPES, uuid);
    expect(memoryStorageService.get).toHaveBeenCalledWith(storageService.UOM, base_uom);
  });

});
