'use strict';

describe('Factory: uomFactory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'memoryStoreMocks'));

  // instantiate dependencies
  var uomFactory;
  var storageService;
  var memoryStorageService;
  var memoryStore;

  beforeEach(inject(function (_uomFactory_, _storageService_, _memoryStorageService_, memoryStoreMock, cacheService) {
    uomFactory = _uomFactory_;
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

  it('i expect uomFactory to be defined ', function () {
    expect(uomFactory).toBeDefined();
  });

  it('i expect uomFactory.get() to return expected uom.', function () {
    var uuid = 'e5def927-b173-44b6-9112-3103a473a65c';//doses
    var result = uomFactory.get(uuid);
    var expectedResult = memoryStore[storageService.UOM][uuid];
    expect(result).toBe(expectedResult);
    expect(result.name).toBe('Dose');
  });

  it('i expect get() to call memoryStorageService.get() with the right parameter.', function(){
    expect(memoryStorageService.get).not.toHaveBeenCalled();
    var uuid = 'e5def927-b173-44b6-9112-3103a473a65c';//doses
    uomFactory.get(uuid);
    expect(memoryStorageService.get).toHaveBeenCalledWith(storageService.UOM, uuid);
  });

  it('i expect uomFactory.getAll() to call memoryStorageService.getDatabase() with the right parameters.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    uomFactory.getAll();
    expect(memoryStorageService.getDatabase).toHaveBeenCalledWith(storageService.UOM);
  });

  it('i expect uomFactory.getAll() to return an array of unit of measurements.', function () {
    expect(memoryStorageService.getDatabase).not.toHaveBeenCalled();
    var result = uomFactory.getAll();
    expect(result.length).toBeGreaterThan(0);
    var elem = result[0];
    expect(elem).toBeDefined();
  });

});
