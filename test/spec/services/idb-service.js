'use strict';

describe('idbService', function () {
  beforeEach(module('lmisChromeApp', 'i18nMocks', 'idbServiceMocks'));

  var idbService, indexedDB;
  beforeEach(inject(function(_idbService_, _idbMock_) {
    idbService = _idbService_;
    indexedDB = _idbMock_.indexedDB;
  }));

  describe('clear', function() {
    it('should call webkitGetDatabaseNames', function() {
      spyOn(indexedDB, 'webkitGetDatabaseNames').andCallThrough();
      idbService.clear('');
      expect(indexedDB.webkitGetDatabaseNames).toHaveBeenCalled();
    });

    it('should wrap IDB methods with Q', function() {
      expect(idbService.clear().then).toBeDefined();
    });
  });

});
