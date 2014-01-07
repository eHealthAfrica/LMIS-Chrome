'use strict';

describe('Service: FacilityService', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var FacilityService;
  beforeEach(inject(function (_FacilityService_) {
    FacilityService = _FacilityService_;
  }));

  it('should do something', function () {
    expect(!!FacilityService).toBe(true);
  });

});
