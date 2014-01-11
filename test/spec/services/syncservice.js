'use strict';

describe('Service: syncService', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var syncService;
  beforeEach(inject(function (_syncService_) {
    syncService = _syncService_;
  }));

  it('should do something', function () {
    expect(!!syncService).toBe(true);
  });

});
