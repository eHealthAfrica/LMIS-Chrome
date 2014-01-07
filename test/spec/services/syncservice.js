'use strict';

describe('Service: SyncService', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var SyncService;
  beforeEach(inject(function (_SyncService_) {
    SyncService = _SyncService_;
  }));

  it('should do something', function () {
    expect(!!SyncService).toBe(true);
  });

});
