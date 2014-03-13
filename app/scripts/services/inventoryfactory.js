'use strict';
// jshint camelcase: false

angular.module('lmisChromeApp')
  .factory('inventoryFactory', function($q, storageService, productTypeFactory, programsFactory, storageUnitFactory, batchFactory, facilityFactory, uomFactory) {

    function getByUUID(uuid) {
      var deferred = $q.defer();
      storageService.find(storageService.INVENTORY, uuid).then(function(data) {

        var inventoryLine = data;

        if (data !== undefined) {

          // Attach nested attributes complete JSON object.
          batchFactory.getByBatchNo(inventoryLine.batch).then(function(data) {
            if(data.toString() === '[object Object]') {
              inventoryLine.batch = data;
            }

            var promises = [
              productTypeFactory.get(inventoryLine.product_type),
              programsFactory.get(inventoryLine.program),
              uomFactory.get(inventoryLine.uom),
              facilityFactory.get(inventoryLine.receiving_facility),
              facilityFactory.get(inventoryLine.sending_facility),
              storageUnitFactory.get(inventoryLine.storage_unit)
            ];

            $q.all(promises).then(function(result) {
              inventoryLine.product_type = result[0];
              inventoryLine.program = result[1];
              inventoryLine.uom = result[2];
              inventoryLine.receiving_facility = result[3];
              inventoryLine.sending_facility = result[4];
              inventoryLine.storage_unit = result[5];
              deferred.resolve(inventoryLine);
            });
          });
        }
      });
      return deferred.promise;
    }

    return {
      get: getByUUID,

      /**
       *  This functions returns all the inventory of a given facility.
       *
       * @param facility - this can be a string(facilityUUID) or an object(facility object with uuid as its property).
       */
      getFacilityInventory: function(facility) {
        var uuid = angular.isObject(facility) ? facility.uuid : facility;
        var deferred = $q.defer(),
          inventory = [];

        storageService.all(storageService.INVENTORY).then(function(data) {

          angular.forEach(data, function(datum) {
            if (datum.receiving_facility === uuid) {
              inventory.push(getByUUID(datum.uuid).then(function(inventoryLine) {
                deferred.notify(datum);
                return inventoryLine;
              }));
            }
          });

          $q.all(inventory).then(function(results) {
            deferred.resolve(results);
          });

        });
        return deferred.promise;
      },

      getUniqueProducts: function(facility) {
        var deferred = $q.defer();
        this.getFacilityInventory(facility)
          .then(function(inventories) {
            var collateCodes = function() {
              var codes = {}, code = '', batch;
              for(var i = inventories.length - 1; i >= 0; i--) {
                batch = inventories[i].batch;
                if(typeof batch !== 'string') {
                  if('product' in batch) {
                    code = batch.product.code;
                    codes[code] = {};
                  }
                }
              }
              deferred.resolve(codes);
            };
            collateCodes();
          });
        return deferred.promise;
      },

      save: function(inventory) {
        var batches = [],
          deferred = $q.defer();

        angular.forEach(inventory.inventory_lines, function(inventoryLine) {

          var newInventory = {
            date_receipt: inventory.date_receipt,
            receiving_facility: inventory.receiving_facility.uuid,
            sending_facility: inventory.sending_facility,
            batch: inventoryLine.batch_no,
            quantity: inventoryLine.quantity,
            program: inventoryLine.program,
            storage_unit: inventoryLine.storage_unit,
            uom: inventoryLine.uom,
            bundle_no: inventory.bundle_no,
            product_type: inventoryLine.productType
          };
          batches.push(newInventory);
        });

        storageService.insertBatch(storageService.INVENTORY, batches).then(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        });

        return deferred.promise;

      }

    };
  });
