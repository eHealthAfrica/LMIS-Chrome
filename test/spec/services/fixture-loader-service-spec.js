'use strict';

describe('Service: fixtureLoaderService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'memoryStoreMocks'));

  // instantiate dependencies
  var fixtureLoaderService;
  var memoryStorageService;
  var testDb1;
  var testDb2;
  var databases;
  var storageService;

  beforeEach(inject(function(_fixtureLoaderService_, _memoryStorageService_, memoryStoreMock, _storageService_) {
    fixtureLoaderService = _fixtureLoaderService_;
    memoryStorageService = _memoryStorageService_;
    storageService = _storageService_;

    spyOn(memoryStorageService, 'setDatabase').andCallFake(function(dbName, db) {
      memoryStoreMock.memoryStore[dbName] = db;
    });

    spyOn(memoryStorageService, 'get').andCallFake(function(dbName, uuid){
      var db = memoryStoreMock.memoryStore[dbName];
      if(typeof db === 'object'){
        return db[uuid];
      }
    });

    testDb1 = {
      '1': { uuid: '1', name: 'testdb1 record 1'},
      '2': { uuid: '2', name: 'testdb1 record 2'}
    };

    testDb2 = {
      '3': { uuid: '3', name: 'testdb2 record 1'},
      '4': { uuid: '4', name: 'testdb2 record 2'}
    };

    databases = {
      testDb1: testDb1,
      testDb2: testDb2
    };

    spyOn(storageService, 'get').andCallThrough();
    spyOn(storageService, 'setDatabase').andCallThrough();

  }));

  describe('loadDatabasesIntoMemoryStorage', function() {
    it('should call memoryStorageService.setDatabase() .', function() {
      expect(memoryStorageService.setDatabase).not.toHaveBeenCalled();
      fixtureLoaderService.loadDatabasesIntoMemoryStorage(databases);
      expect(memoryStorageService.setDatabase).toHaveBeenCalledWith('testDb1', databases.testDb1);
      expect(memoryStorageService.setDatabase).toHaveBeenCalledWith('testDb2', databases.testDb2);
    });

    it('should throw exception when called without nested object.', function(){
      var wrongDatabases = [testDb1, testDb2];
      expect(function(){ fixtureLoaderService.loadDatabasesIntoMemoryStorage(wrongDatabases); }).toThrow();
    });

    it('should set database into memory so i can access database via memory service.', function(){
      var result = memoryStorageService.get('testDb1', '1');
      expect(result).toBeUndefined();
      fixtureLoaderService.loadDatabasesIntoMemoryStorage(databases);
      result = memoryStorageService.get('testDb1', '1');
      expect(result).toBeDefined();
    })
  });

  describe('loadLocalDatabasesIntoMemory', function(){
    it('should call storageService.get', function(){
      expect(storageService.get).not.toHaveBeenCalled();
      fixtureLoaderService.loadLocalDatabasesIntoMemory(['testDb1']);
      expect(storageService.get).toHaveBeenCalledWith('testDb1');
    });
  });

  describe('saveDatabases', function(){
    it('should save databases to local storage', function(){
      expect(storageService.setDatabase).not.toHaveBeenCalled();
      fixtureLoaderService.saveDatabases(databases);
      expect(storageService.setDatabase).toHaveBeenCalled();
    });
  });

});
