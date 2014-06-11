'use strict';

describe('Service: appConfigService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  // instantiate service
  var appConfigService;

  beforeEach(inject(function(_appConfigService_) {
    appConfigService = _appConfigService_;
  }));

  it('as a user, i expect appConfigService to be defined ', function(){
    expect(appConfigService).toBeDefined();
  });

  it('as a user, i expect appConfigService to have stockCountIntervals as property', function(){
    expect(appConfigService.stockCountIntervals).toBeDefined();
    expect(appConfigService.stockCountIntervals.length).toBe(4);
  });

  it('as a user, i expect appConfigService to have function for loading app facility profile from remote DB', function(){
    expect(appConfigService.getAppFacilityProfileByEmail).toBeDefined();
  });

});
