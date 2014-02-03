'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function($http, storageService, $q) {
    function loadFixtures() {
      var database = [
        storageService.PRODUCT,
        storageService.ADDRESS,
        storageService.UOM,
        storageService.UOM_CATEGORY,
        storageService.FACILITY,
        storageService.PROGRAM,
        storageService.PROGRAM_PRODUCTS,
        storageService.FACILITY_TYPE,
        storageService.EMPLOYEE_CATEGORY,
        storageService.COMPANY,
        storageService.COMPANY_CATEGORY,
        storageService.CURRENCY,
        storageService.EMPLOYEE,
        storageService.RATE,
        storageService.STORAGE_LOCATION_TYPE,
        storageService.STORAGE_LOCATION,
        storageService.USER,
        storageService.PRODUCT_CATEGORY,
        storageService.PRODUCT_PRESENTATION,
        storageService.PRODUCT_FORMULATION,
        storageService.MODE_OF_ADMINISTRATION,
        storageService.PRODUCT_ITEM,
        storageService.STORAGE_LOCATION_PROBLEM,
        storageService.STORAGE_LOCATION_TEMPERATURE,
        storageService.PRODUCT_PROFILE,
        storageService.INVENTORY,
        storageService.ORDERS
      ];

      function loadData(db) {
        var testData = [];

        storageService.get(db).then(function(data) {
          testData = data;
          if (testData.length === 0 || testData.length === undefined) {

            var file = 'scripts/fixtures/' + db + '.json';
            $http.get(file).success(function(data) {
              storageService.add(db, data);
              //console.log(data);
              //loadRelatedObject(db);

            }).error(function(err) {
              console.log(err);
            });
          } else {
            console.log(db + ' is loaded with ' + testData.length);
            //loadRelatedObject(db);
          }

        }, function(reason) {
            console.log(reason);
          }
        );
      }

      for (var i in database) {
        loadData(database[i]);
      }

    }

    function loadRelatedObject(db) {
      var deferred = $q.defer();

      //TODO: add key validation and identifier type (uuid | id)
      //create a new table name by prefixing the original with 're'
      var relatedName = 're_' + db;

      //when called get data from storage and create an object using uuid as key
      storageService.get(db).then(function(data) {
        if (data.length !== 0 && data.length !== undefined) {
          //load table data into object
          var relatedObject = {};
          for (var k in data) {
            if (Object.prototype.toString.call(data[k]) === '[object Object]') {
              //var keys = Object.keys(data[k]);
              if (data[k].uuid !== undefined) {
                // jshint camelcase: false
                data[k].array_index = k;
                relatedObject[data[k].uuid] = data[k];
              } else if (data[k].id !== undefined) {
                relatedObject[data[k].id] = data[k];
              }
            }
          }
          //store new object in local storage
          storageService.add(relatedName, relatedObject);
          deferred.resolve(relatedObject);
        }
      });
      return deferred.promise;
    }
    // Public API here
    return {
      loadFixtures: loadFixtures,
      loadTableObject: loadRelatedObject
    };
  });
