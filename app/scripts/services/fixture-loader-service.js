angular.module('lmisChromeApp')
  .service('fixtureLoaderService', function ($q, $http, $rootScope, memoryStorageService) {

    var PATH = 'scripts/fixtures/';

    var loadFilesIntoCache = function (fileNames) {
      $rootScope.$emit('START_LOADING', {started: true});
      var deferred = $q.defer();
      var promises = {};
      for (var i in fileNames) {
        var fileName = fileNames[i];
        var fileUrl = [PATH, fileName, '.json'].join('');
        promises[fileName] = $http.get(fileUrl);
      }

      $q.all(promises)
        .then(function (result) {
          var resultSet = {};
          for (var fileName in result) {
            var data = result[fileName].data;
            resultSet[fileName] = data;
            memoryStorageService.setDatabase(fileName, data);
          }
          $rootScope.$emit('LOADING_COMPLETED', {completed: true});
          deferred.resolve(resultSet);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    this.loadFiles = function (fileNames) {
      return loadFilesIntoCache(fileNames);
    };

  });