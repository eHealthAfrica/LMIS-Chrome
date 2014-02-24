'use strict';

angular.module('lmisChromeApp')
  .factory('presentationFactory', function ($q, uomFactory, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.get(storageService.PRODUCT_PRESENTATION).then(function(data){
          var productPresentation = data[uuid];
          if(productPresentation !== undefined){
            uomFactory.get(productPresentation.uom).then(function(data){
              productPresentation.uom  = data;
            });
          }
          deferred.resolve(productPresentation);
        });
        return deferred.promise;
      }

    // Public API here
    return {



      get: getByUUID
    };

  });
