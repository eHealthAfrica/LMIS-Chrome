'use strict';

ddescribe('DeviceInfoService service', function () {
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
          expect(result).toBe('cordova not supported!');
        }
    );
  });

});
