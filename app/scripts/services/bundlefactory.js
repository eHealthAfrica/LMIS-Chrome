'use strict';

angular.module('lmisChromeApp')
    .factory('bundleFactory', function ($q, storageService) {

      function saveBundleReceipt(bundleReceipt) {
        var deferred = $q.defer(), batches = [];
        storageService.save(storageService.BUNDLE_RECEIPT, bundleReceipt).then(function (data) {
          if (data !== undefined) {
            angular.forEach(bundleReceipt.bundle_receipt_lines, function (receiptLine) {
              var newInventory = {
                date_receipt: bundleReceipt.date_receipt,
                receiving_facility: bundleReceipt.receiving_facility,
                sending_facility: bundleReceipt.sending_facility,
                batch: receiptLine.batch,
                quantity: receiptLine.verify,
                program: receiptLine.program,
                storage_unit: receiptLine.storage_unit,
                uom: receiptLine.quantity_uom,
                bundle_no: bundleReceipt.bundle
              };
              batches.push(newInventory);
            });

            storageService.insertBatch(storageService.INVENTORY, batches).then(function (result) {
              deferred.resolve(result);
            }, function (error) {
              deferred.reject(error);
            });
          }
        });
        return deferred.promise;
      }

      /**
       * function used get JSON response for a bundle.
       *
       * @param bundleUUID
       * @returns {promise|*}
       */
      function get(bundleUUID) {
        var deferred = $q.defer();
        var facilities = {};
        var users = {};

        //TODO: consider refactoring these into their respective factory(JIDEOBI).
        storageService.get(storageService.FACILITY).then(function (data) {
          facilities = data;
        });

        storageService.get(storageService.USER).then(function (data) {
          users = data;
        });

        try {
          storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
            //compose bundle response
            if (data !== undefined) {
              var bundle = {
                'uuid': data.uuid,
                'receiving_facility': facilities[data.receiving_facility],
                'parent': facilities[data.parent],
                'order': '12345-90882', //TODO: replace with order object when complete
                'bundle_lines': getBundleLines(bundleUUID)
              };
              deferred.resolve(bundle);
            } else {
              deferred.reject();
            }
          });
        } catch (e) {
          deferred.reject(e);
        } finally {
          return deferred.promise;
        }
      }

      /**
       * This functions returns a collection of bundle lines that belongs to the given bundleUUID
       * @param bundleUUID
       * @returns {Array}
       */
      function getBundleLines(bundleUUID) {
        var batches = {};
        var programs = {};
        var productTypes = {};
        var uomList = {};

        storageService.get(storageService.BATCH).then(function (data) {
          batches = data;
        });

        storageService.get(storageService.PROGRAM).then(function (data) {
          programs = data;
        });

        storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
          productTypes = data;
        });

        storageService.get(storageService.UOM).then(function (data) {
          uomList = data;
        });

        var bundleLines = [];
        storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
          if (data !== undefined) {
            for (var index in data.bundle_lines) {
              var bundleLineUUID = data.bundle_lines[index];
              storageService.find(storageService.BUNDLE_LINES, bundleLineUUID).then(function (data) {
                if (data !== undefined) {
                  var batch = batches[data.batch];
                  batch.product = productTypes[batch.product];
                  var bundleLine = {
                    'uuid': data.uuid,
                    'program': programs[data.program],
                    'batch': batch,
                    'quantity': data.quantity,
                    'quantity_uom': uomList[data.quantity_uom],
                    'verify': 0,
                    'storage_units': ''
                  };
                  bundleLines.push(bundleLine);
                }
              });
            }

          }
        });
        return bundleLines;
      }

      function getBundleReceiptLine(bundleUUID) {
        var batches = {};
        var programs = {};
        var productTypes = {};
        var uomList = {};
        var bundleLines = [];

        storageService.get(storageService.BATCH).then(function (data) {
          batches = data;
        });

        storageService.get(storageService.PROGRAM).then(function (data) {
          programs = data;
        });

        storageService.get(storageService.PRODUCT_TYPES).then(function (data) {
          productTypes = data;
        });

        storageService.get(storageService.UOM).then(function (data) {
          uomList = data;
        });

        storageService.find(storageService.BUNDLE, bundleUUID).then(function (data) {
          if (data !== undefined) {
            for (var index in data.bundle_lines) {
              var bundleLineUUID = data.bundle_lines[index];
              storageService.find(storageService.BUNDLE_LINES, bundleLineUUID).then(function (data) {
                if (data !== undefined) {
                  var batch = batches[data.batch];
                  batch.product = productTypes[batch.product];

                  var bundleLine = {
                    'bundle': data.uuid,
                    'program': programs[data.program].name,
                    'batch': batch,
                    'quantity': data.quantity,
                    'quantity_uom': uomList[data.quantity_uom],
                    'verify': 0
                  };
                  bundleLines.push(bundleLine);
                }
              });
            }
          }
        });
        return bundleLines;
      }

      /**
       * This functions, currently returns collection of bundle object uuid(bundle no.).
       *
       * @returns {promise|promise|*|Function|promise}
       */
      function getBundleNumbers() {
        var bundleNumbers = [];
        var deferred = $q.defer();
        storageService.get(storageService.BUNDLE).then(function (data) {
          bundleNumbers = Object.keys(data);
          deferred.resolve(bundleNumbers);
        });
        return deferred.promise;
      }

      return {
        getBundleNumbers: getBundleNumbers,
        getBundleLines: getBundleLines,
        getBundle: get,
        saveBundleReceipt: saveBundleReceipt,
        getBundleReceiptLines: getBundleReceiptLine
      };
    });
