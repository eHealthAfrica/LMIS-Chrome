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

  it('should go return user whose user id exists', function (done) {
    inject(function (userFactory) {
      userFactory.get('1').then(function (result) {
        expect(result.id).toBe('1');
        done();
      });
    });
  });

  it('should go return undefined for non-existent user id', function (done) {
    inject(function (userFactory) {
      userFactory.get('-1').then(function (result) {
        expect(result.id).toBeDefined();
        expect(result.id).toBe('-1');
        done();
      });
    });
  });

});