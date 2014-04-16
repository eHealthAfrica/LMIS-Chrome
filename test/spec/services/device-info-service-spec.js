'use strict';

describe('DeviceInfoService service', function () {
  // Load the controller's module
  beforeEach(module('lmisChromeApp'));

  var deviceInfoService;
  beforeEach(inject(function(_deviceInfoService_) {
    deviceInfoService = _deviceInfoService_;
  }));

  it('as a user, i expect "deviceInfoService" to exist for accessing device info', function(){
    expect(deviceInfoService).toBeDefined();
  });

  it('as a user, i want to be able to get device information', function() {
    runs(
        function () {
          return deviceInfoService.getDeviceInfo();
        },
        function checkExpectations(result) {
          expect(result).toBe(deviceInfoService.NOT_SUPPORTED_MSG);
          expect(result).not.toBe('just a check to make sure it test promise');
        }
    );
  });

});
