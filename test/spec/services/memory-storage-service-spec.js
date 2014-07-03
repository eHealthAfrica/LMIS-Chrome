'use strict';

describe('Service: memoryStorageService ', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate dependencies
  var cacheService;
  var memoryStorageService;
  var dbName = 'testdb';
  var obj = {uuid: '2345'};

  beforeEach(inject(function (_cacheService_, _memoryStorageService_) {
    cacheService = _cacheService_;
    memoryStorageService = _memoryStorageService_;
  }));

  describe('put', function () {

    it('should throw exception if called with non-string dbName parameter.', function () {
      var nonStringDbName = {dbName: 'product_types'};
      expect(function () {
        memoryStorageService.put(nonStringDbName, obj);
      }).toThrow();
    });

    it('should throw exception when called with empty string', function () {
      var emptyString = '';
      expect(function () {
        memoryStorageService.put(emptyString, obj);
      }).toThrow();
    });

    it('should throw an exception when called non-string obj.uuid or empty string obj.uuid.', function(){
      obj.uuid = '';
     expect(function () {
        memoryStorageService.put(dbName, obj);
      }).toThrow();

      obj.uuid = {type: 'wrong uuid format'}
      expect(function () {
        memoryStorageService.put(dbName, obj);
      }).toThrow();
    });

  });

});
