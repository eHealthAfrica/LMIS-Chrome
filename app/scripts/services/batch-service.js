'use strict';

angular.module('lmisChromeApp')
  .service('batchService', function(storageService) {

    this.save = function(batch){
      return storageService.save(storageService.BATCHES, batch);
    };

    this.get = function(uuid){
      return storageService.find(storageService.BATCHES, uuid);
    };

    this.getAll = function(){
      return storageService.all(storageService.BATCHES);
    };

    this.getByBatchNo = function(batchNo){
      return this.getAll()
        .then(function(res){
          var batches = res.filter(function(b){
            return b.batchNo == batchNo;
          });
          if(batches.length > 0){
            return batches[0];
          }else{
            return $q.reject('batch no does not exist.');
          }
        })
    };

    this.getBatchNos = function(){
      return this.getAll()
        .then(function(batches){
          return batches.map(function(b){
            return b.batchNo;
          });
        });
    };

  });
