'use strict';

angular.module('lmisChromeApp')
  .factory('presentationFactory', function ($q, uomFactory, storageService) {

      function getByUUID(uuid){
        var deferred = $q.defer();
        storageService.find(storageService.PRODUCT_PRESENTATION, uuid).then(function(data){
          var productPresentation = data
          productPresentation.uom = data.uom;
          if(productPresentation !== undefined){
            uomFactory.get(productPresentation.uom).then(function(data){
              productPresentation.uom  = data;
              deferred.notify(productPresentation.uom);
              deferred.resolve(productPresentation);
            });
          }
        });
        return deferred.promise;
      }

    // Public API here
    return {

    getAll: function(){
        var deferred = $q.defer();
        storageService.get(storageService.PRODUCT_PRESENTATION).then(function(data){
          var presentations = [];
          for(var uuid in data){
            getByUUID(uuid).then(function(data){
                if(data !== undefined){
                  presentations.push(data);
                }
            });
          }
          deferred.resolve(presentations);
        });
        return deferred.promise;
      },

      get: getByUUID
    };

  });
