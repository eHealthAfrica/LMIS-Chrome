'use strict';

angular.module('lmisChromeApp')
  .service('bundleService', function(storageService) {

    this.INCOMING = '0';
    this.OUTGOING = '1';

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
