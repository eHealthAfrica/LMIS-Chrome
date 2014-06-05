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

    var sparseEmail = function(success) {
      // vliesaputra/DeviceInformationPlugin serialises as a string
      var acc = '{account0Name: \'test@example.com\'}';
      return success(acc);
    };

    var emptySuccess = function(success) {
      return success('');
    };

    return {
      failure: cordovaFactory(failure),
      sparseEmail: cordovaFactory(sparseEmail),
      emptySuccess: cordovaFactory(emptySuccess)
    };

  });
