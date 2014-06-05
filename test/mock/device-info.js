'use strict';

angular.module('deviceInfoMocks', [])
  .factory('deviceInfoMocks', function() {

    var cordovaFactory = function(getMock) {
      return {
        require: function() {
          return {
            get: getMock
          };
        }
      };
    };

    var failure = function(success, failure) {
      return failure('Mocked getDeviceInfo failure');
    };

    return {
      failure: cordovaFactory(failure)
    };

  });
