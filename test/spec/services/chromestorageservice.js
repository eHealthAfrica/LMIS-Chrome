'use strict';

describe('Service: ChromeStorageService', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var ChromeStorageService;
  beforeEach(inject(function (_ChromeStorageService_) {
    ChromeStorageService = _ChromeStorageService_;
  }));

  it('should do something', function () {
    expect(!!ChromeStorageService).toBe(true);
  });

});
