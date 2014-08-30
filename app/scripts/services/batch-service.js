'use strict';

angular.module('lmisChromeApp')
  .service('batchService', function(storageService, $q) {

    this.save = function(batch){
      return storageService.save(storageService.BATCHES, batch);
    };

    this.saveBatches =  function(batches){
      var promises = [];
      batches.forEach(function(b){
        promises.push(storageService.save(storageService.BATCHES, b));
      });
     return $q.all(promises);
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
      var batchNos = {};
      return this.getAll()
        .then(function(batches){
          batches.forEach(function(b){
            batchNos[b.batchNo] = b;
          });
          return batchNos;
        });
    };

    this.extractBatch = function(bundleLines){
      var batches = [];
      var bl;
      var batch;
      for(var i in bundleLines){
        bl = bundleLines[i];
        batch = {
          batchNo: bl.batchNo,
          expiryDate: bl.expiryDate,
          profile: bl.productProfile
        };
        batches.push(batch);
      }
      return batches;
    };

  });
