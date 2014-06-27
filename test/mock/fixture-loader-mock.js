'use strict';

angular.module('fixtureLoaderMocks', [])
  .factory('fixtureLoaderMock', function (storageService, $httpBackend) {

    var FIXTURE_PATH = 'scripts/fixtures/';

    return {
      loadFixtures: function () {
        for (var index in storageService.FIXTURE_NAMES) {
          var fileName = storageService.FIXTURE_NAMES[index];
          var url = [FIXTURE_PATH, fileName, '.json'].join('');
          $httpBackend.when('GET', url).respond({});
        }
      }
    };

  });
