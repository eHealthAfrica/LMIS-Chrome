'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService) {

    this.get = function(uuid){
      return storageService.find(storageService.BUNDLE, uuid);
    };

    this.getAll = function(){
      return storageService.all(storageService.BUNDLE);
    };

    this.save = function(bundle){
      return storageService.save(storageService.BUNDLE, bundle);
    };

  });
