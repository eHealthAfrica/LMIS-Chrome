'use strict';

ddescribe('Device info factory', function() {

  it('should be defined', function() {
    module('lmisChromeApp');
    inject(function(deviceInfoFactory) {
      expect(deviceInfoFactory).toBeDefined();
    });
  });

  describe('without Cordova support', function() {

    it('should reject with a reason', function() {
      module('lmisChromeApp');
      inject(function(deviceInfoFactory) {

        runs(function() {
          return deviceInfoFactory.getDeviceInfo()
            .catch(function(reason) {
              expect(reason).toBeDefined();
            });
        });

      });
    });

  });

  describe('with Cordova support', function() {
    beforeEach(module('lmisChromeApp', 'deviceInfoMocks'));

    var deviceInfoFactory;
    beforeEach(inject(function(_deviceInfoFactory_) {
      deviceInfoFactory = _deviceInfoFactory_;
    }));

    it('should not reject', function() {
    });

  });
});
