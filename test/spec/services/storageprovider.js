'use strict';

describe('Service: storageProvider', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var storageProvider;
  beforeEach(inject(function (_storageProvider_) {
    storageProvider = _storageProvider_;
  }));

  it('should do something', function () {
    expect(!!storageProvider).toBe(true);
  });

});
