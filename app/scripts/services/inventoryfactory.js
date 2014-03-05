'use strict';

angular.module('lmisChromeApp')
    .factory('inventoryFactory', function ($q, storageService, programsFactory, storageUnitFactory, batchFactory, facilityFactory, uomFactory) {

      function getByUUID(uuid) {
        var deferred = $q.defer();
        storageService.find(storageService.INVENTORY, uuid).then(function (data) {
          var inventoryLine = data;
          if (data !== undefined) {
            //Attach nested attributes complete JSON object.
            batchFactory.getByBatchNo(inventoryLine.batch).then(function (data) {
              inventoryLine.batch = data;
            });

            programsFactory.get(inventoryLine.program).then(function (data) {
              inventoryLine.program = data;
            });

            uomFactory.get(inventoryLine.uom).then(function (data) {
              inventoryLine.uom = data;
            });

            facilityFactory.get(inventoryLine.receiving_facility).then(function (data) {
              inventoryLine.receiving_facility = data;
            });

            facilityFactory.get(inventoryLine.sending_facility).then(function (data) {
              inventoryLine.sending_facility = data;
            });

            storageUnitFactory.get(inventoryLine.storage_unit).then(function (data) {
              inventoryLine.storage_unit = data;
            });

          }
          deferred.resolve(inventoryLine);
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
        getFacilityInventory: function (facility) {
          var uuid = angular.isObject(facility) ? facility.uuid : facility;
          var deferred = $q.defer(), inventory = [];

          storageService.all(storageService.INVENTORY).then(function (data) {
            console.log(data);
            angular.forEach(data, function (datum) {
              if (datum.receiving_facility === uuid) {
                inventory.push(getByUUID(datum.uuid).then(function (inventoryLine) {
                  deferred.notify(datum);
                  return inventoryLine;
                }))
              }
            });

            $q.all(inventory).then(function (results) {
              deferred.resolve(results);
            });

          });
          return deferred.promise;
        },

        save: function (inventory) {
          var batches = [], deferred = $q.defer();
          angular.forEach(inventory.inventory_lines, function (inventoryLine) {
            var newInventory = {
              date_receipt: inventory.date_receipt,
              receiving_facility: inventory.receiving_facility,
              sending_facility: inventory.sending_facility,
              batch: inventoryLine.batch_no,
              quantity: inventoryLine.quantity,
              program: inventoryLine.program,
              storage_unit: inventoryLine.storage_unit,
              uom: inventoryLine.uom,
              bundle_no: inventory.bundle_no
            }
            batches.push(newInventory);
          });

          storageService.insertBatch(storageService.INVENTORY, batches).then(function (result) {
            deferred.resolve(result);
          }, function (error) {
            deferred.reject(error);
          });

          return deferred.promise;

        }

      };
    });
