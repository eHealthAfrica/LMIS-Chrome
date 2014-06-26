'use strict';

describe('Factory: productCategoryFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'memoryStoreMocks'));

  // instantiate dependencies
  var productCategoryFactory;
  var storageService;
  var memoryStorageService;
  var memoryStore;

  beforeEach(inject(function (_productCategoryFactory_, _storageService_, _memoryStorageService_, memoryStoreMock, cacheService) {
    productCategoryFactory = _productCategoryFactory_;
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

  it('i expect productCategoryFactory to be defined ', function () {
    expect(productCategoryFactory).toBeDefined();
  });

  it('i expect productCategoryFactory.get() to return expected product category.', function () {
    var uuid = '1c761db0-d7f3-4abf-8c12-6c678f862851';//dry store safety boxes
    var result = productCategoryFactory.get(uuid);
    var expectedResult = memoryStore[storageService.PRODUCT_CATEGORY][uuid];
    expect(result).toBe(expectedResult);
    expect(result.name).toBe('Dry Store Safety Boxes');
  });

  it('i expect get() to call memoryStorageService.getDatabase() with the right parameter.', function(){
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    var uuid = '1c761db0-d7f3-4abf-8c12-6c678f862851';//dry store safety boxes
    productCategoryFactory.get(uuid);
    expect(memoryStorageService.getDatabase).toHaveBeenCalledWith(storageService.PRODUCT_CATEGORY);
  });

  it('i expect productCategoryFactory.getAll() to call memoryStorageService.getDatabase() with the right parameters.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    productCategoryFactory.getAll();
    expect(memoryStorageService.getDatabase).toHaveBeenCalledWith(storageService.PRODUCT_CATEGORY);
  });

  it('i expect productCategoryFactory.getAll() to return an array of product categories.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    var result = productCategoryFactory.getAll();
    expect(result.length).toBeGreaterThan(0);
    var elem = result[0];
    expect(elem).toBeDefined();
  });

});
