'use strict';

describe('User controller', function () {
// Load the controller's module
  beforeEach(module('lmisChromeApp', 'lmisChromeAppMocks'));

  var q;
  beforeEach(module(function ($provide) {
    var storageServiceMock = {
      find: function () {
        var deferred = q.defer();
        deferred.resolve([]);
        return deferred.promise;
      },
      loadFixtures: function () {
      }
    };
    $provide.value('storageService', storageServiceMock);
  }));

  beforeEach(inject(function ($q) {
    q = $q;
  }));

});