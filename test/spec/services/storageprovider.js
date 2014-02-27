'use strict';

describe('User factory', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  it('should have storageProvider Defined', function () {
    inject(function (storageService) {
      expect(storageService).toBeDefined();
    });
  });


  it('should get return a user from user object store', function () {
    inject(function (storageService) {
      storageService.find(storageService.USER, "1").then(function(data){
        expect(data).toBeDefined();
        expect(data.id).toBe("1");
        expect(data.id).not.toBe("2");
      });
    });
  });

  it('should get return undefined from user object store', function () {
    inject(function (storageService) {
      storageService.find(storageService.USER, "1").then(function(data){
        expect(data).toBeUndefined();
      });
    });
  });

});