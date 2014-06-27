'use strict';

angular.module('lmisChromeApp')
    .factory('presentationFactory', function ($q, uomFactory, storageService, memoryStorageService, utility) {

      var getByUuid = function(key) {
        var uuid = utility.getStringUuid(key);
        var presentation = memoryStorageService.get(storageService.PRODUCT_PRESENTATION, uuid);
        if(typeof presentation === 'object'){
          presentation.uom = uomFactory.get(presentation.uom);
        }
        return presentation;
      };

      var getAllPresentation = function () {
        var presentationDb = memoryStorageService.getDatabase(storageService.PRODUCT_PRESENTATION);
        var presentations = [];
        for(var key in presentationDb){
          var presentation = presentationDb[key];
          if(typeof presentation === 'object'){
            var uuid = utility.getStringUuid(presentation);
            presentations.push(uuid);
          }else{
            console.error('presentation is not an object: '+presentation);
          }
        }
        return presentations;
      };

      return {
        getAll: getAllPresentation,
        get: getByUuid
      };

    });
