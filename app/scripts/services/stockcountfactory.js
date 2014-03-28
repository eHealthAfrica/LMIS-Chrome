'use strict';

angular.module('lmisChromeApp')
  .factory('stockCountFactory', function ($q, storageService, $http, $filter) {

    var discardedReasons = {
      '0': 'VVM Stage 3',
      '1': 'Broken Vial',
      '2': 'Label Missing',
      '3': 'Unopened Expiry',
      '4': 'Opened Expiry',
      '5': 'Suspected Freezing',
      '6': 'Other'
    };

    var months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    };

    var programProducts= [
      'BCG doses',
      'BCG Diluent',
      'Hep.B doses',
      'OPV doses',
      'PENTA doses',
      'PCV doses',
      'Measles doses',
      'Measles Diluent',
      'Yellow Fever doses',
      'Yellow Fever Diluent',
      'CSM doses',
      'CSM Diluent',
      'Tetanus Toxoid doses',
      'BCG Syringes',
      'Auto Disable Syringes',
      '5mls Syringes',
      'Safety boxes'
    ];
    var productProfileMock =
    {
      "075bd789-4b29-4033-80b6-4f834e602628": {
        "uuid": "075bd789-4b29-4033-80b6-4f834e602628",
        "created": "2014-01-30T11:13:53.058Z",
        "modified": "2014-01-30T11:13:53.144Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "ads-0.05mL-100PerBox-PlasticNeedle-ID-",
        "product": "251fc8c2-0273-423f-a519-4ea20fc74832",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "presentation": "8ee9ff30-a9f5-41f9-8054-8257920adf2d",
        "formulation": "e16c54e4-74bd-4de0-9360-7067cc98648e",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 5.0,
        "diluent_per_volume": 0.0,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "87115282-6a35-42fb-ae2b-860e510b592f": {
        "uuid": "87115282-6a35-42fb-ae2b-860e510b592f",
        "created": "2014-01-30T11:14:42.608Z",
        "modified": "2014-01-30T11:14:42.655Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "ads-0.05mL-200PerBox-PlasticNeedle-ID",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "product": "251fc8c2-0273-423f-a519-4ea20fc74832",
        "presentation": "441e1be5-ce61-465c-8b72-8c0bd8ee9749",
        "formulation": "e16c54e4-74bd-4de0-9360-7067cc98648e",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 5.0,
        "diluent_per_volume": 0.0,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "f97be2aa-d5b6-4560-8f31-5a559fb80567": {
        "uuid": "f97be2aa-d5b6-4560-8f31-5a559fb80567",
        "created": "2014-01-30T11:15:04.585Z",
        "modified": "2014-01-30T11:15:04.640Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "ads-0.05mL-25PerBox-PlasticNeedle-ID",
        "product": "251fc8c2-0273-423f-a519-4ea20fc74832",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "presentation": "bb67c3a1-6719-49d0-832a-16a85f6562e2",
        "formulation": "e16c54e4-74bd-4de0-9360-7067cc98648e",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 5.0,
        "diluent_per_volume": 0.0,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "756fe956-aaad-4114-93fc-43199d86e59d": {
        "uuid": "756fe956-aaad-4114-93fc-43199d86e59d",
        "created": "2014-01-30T11:15:18.338Z",
        "modified": "2014-01-30T11:15:18.384Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "ads-0.05mL-500PerBox-PlasticNeedle-ID",
        "product": "251fc8c2-0273-423f-a519-4ea20fc74832",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "presentation": "0b3c2b22-7719-488d-b74e-b75124e3c68f",
        "formulation": "e16c54e4-74bd-4de0-9360-7067cc98648e",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 5.0,
        "diluent_per_volume": 0.0,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "abf5f2fc-056a-45cc-b7b7-553a09c927d7": {
        "uuid": "abf5f2fc-056a-45cc-b7b7-553a09c927d7",
        "created": "2014-01-30T11:15:29.344Z",
        "modified": "2014-01-30T11:15:29.387Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "ads-0.05mL-50PerBox-PlasticNeedle-ID",
        "product": "251fc8c2-0273-423f-a519-4ea20fc74832",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "presentation": "c8dac343-4f92-4974-af5c-0737bd8e68e9",
        "formulation": "e16c54e4-74bd-4de0-9360-7067cc98648e",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 5.0,
        "diluent_per_volume": 0.0,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "641a0739-4365-43be-ab5c-ef70ea7be45c": {
        "uuid": "641a0739-4365-43be-ab5c-ef70ea7be45c",
        "created": "2014-01-30T11:18:37.588Z",
        "modified": "2014-01-30T11:18:37.640Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "BCG-20DPV-Lyophilized-ID-1.2PackedVol-0.6DilPerVol",
        "product": "e55e1452-b0ab-4046-9d7e-3a98f1f968d0",
        "category": "d5ffa6bd-58d2-41b5-a688-6a9d6894c5ae",
        "presentation": "299939e1-94d7-4e8e-bfb7-c008af1692af",
        "formulation": "d2a1ae75-8fb0-4c80-80f7-0b05ba445b8a",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 1.2,
        "diluent_per_volume": 0.6,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "143d67cd-a08f-4b5b-bc2e-900857d0f29b": {
        "uuid": "143d67cd-a08f-4b5b-bc2e-900857d0f29b",
        "created": "2014-01-30T11:19:15.188Z",
        "modified": "2014-01-30T11:19:15.234Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "BCG-10DPV-Lyophilized-ID-1.2PackedVol-0.6DilPerVol",
        "product": "e55e1452-b0ab-4046-9d7e-3a98f1f968d0",
        "presentation": "c0994b0e-c607-445c-b202-4d61b8c6cff0",
        "formulation": "d2a1ae75-8fb0-4c80-80f7-0b05ba445b8a",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 1.2,
        "diluent_per_volume": 0.6,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      },
      "511690ef-23da-4b33-9248-6e9c851277de": {
        "uuid": "511690ef-23da-4b33-9248-6e9c851277de",
        "created": "2014-01-30T11:20:22.741Z",
        "modified": "2014-01-30T11:20:22.782Z",
        "is_deleted": false,
        "created_by": 1,
        "modified_by": 1,
        "name": "BCG-50DPV-Lyophilized-ID-1.2PackedVol-0.6DilPerVol",
        "product": "e55e1452-b0ab-4046-9d7e-3a98f1f968d0",
        "presentation": "623ad47f-a4da-4723-a350-d39bc6b02171",
        "formulation": "d2a1ae75-8fb0-4c80-80f7-0b05ba445b8a",
        "mode_of_use": "d4957c68-d977-4ff2-a5c2-3e8538d302cd",
        "description": "",
        "packed_volume": 1.2,
        "diluent_per_volume": 0.6,
        "volume_uom": "6e2a882b-eeeb-4caf-96e2-46167c0c1aac"
      }
    };

    var productType = function(){
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };
    var facilityProducts = function(){
      //TODO: add logic to retrieve data from database when facility settings is complete
      return productProfileMock;
    };
    var addRecord={
      /**
       * Add/Update Stock count
       *
       * @param {object} Stock Data.
       * @return {Promise} return promise object
       * @public
       */
      stock: function(object){
        var deferred = $q.defer();
        if(object.countDate instanceof Date){
          object.countDate = object.countDate.toJSON();
        }
        validate.countExist(object.countDate).then(function(stockCount){
          if(stockCount !== null){
            object.uuid = stockCount.uuid;
          }
          storageService.insert('stockCount', object).then(function(uuid){
            deferred.resolve(uuid);
          });
        });
        return deferred.promise;
      },
      /**
       * Add/Update Stock wastage count
       *
       * @param {object} Stock wastage Data.
       * @return {Promise} return promise object
       */
      waste: function(object){
        var deferred = $q.defer();

        storageService.insert('wastageCount', object).then(function(uuid){
          deferred.resolve(uuid);
        });
        return deferred.promise;
      }
    };

    var validate = {
     /*
      * I'm going to assume any value entered that is not a number is invalid
      */
      invalid: function(entry){
        return !!((entry === '' || angular.isUndefined(entry) || isNaN(entry) || entry < 0));
      },
      countExist: function(date){
        return getStockCountByDate(date);
      }
    };

    var getStockCountByDate = function (date) {
      var deferred = $q.defer();
      storageService.all(storageService.STOCK_COUNT).then(function (stockCounts) {
        var stockCount = null;
        for (var index in stockCounts) {
          var row = stockCounts[index];
          var stockCountDate = $filter('date')(new Date(row.countDate), 'yyyy-MM-dd');
          date = $filter('date')(new Date(date), 'yyyy-MM-dd');
          if (date === stockCountDate) {
            stockCount = row;
            break;
          }
        }
        deferred.resolve(stockCount);
      });
      return deferred.promise;
    };

    var getWasteCountByDate = function (date) {
      var deferred = $q.defer();
      storageService.all(storageService.WASTE_COUNT).then(function (wasteCounts) {
        var wasteCount = null;
        for (var index in wasteCounts) {
          var row = wasteCounts[index];
          var wasteCountDate = $filter('date')(new Date(row.countDate), 'yyyy-MM-dd');
          date = $filter('date')(new Date(date), 'yyyy-MM-dd');
          if (date === wasteCountDate) {
            wasteCount = row;
            break;
          }
        }
        deferred.resolve(wasteCount);
      });
      return deferred.promise;
    };

    var load={
      /*
       *
       */
      allStockCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.STOCK_COUNT)
          .then(function(stockCount){
            deferred.resolve(stockCount);
          });
        return deferred.promise;
      },
       /*
       *
       */
      allWasteCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.WASTE_COUNT)
          .then(function(wastageCount){
            deferred.resolve(wastageCount);
          });
        return deferred.promise;
      },
      /*
       * load a single row from waste count table
       * @param {uuid} .
       * @return {Promise} return promise object
       */

       /*
       *
       */
      locations: function(){
        var deferred = $q.defer();
        var fileUrl = 'scripts/fixtures/locations.json';
        $http.get(fileUrl).success(function (data){
          deferred.resolve(data);
        });
        return deferred.promise;
      },
       /*
       *
       */
      //TODO: use utility service function
      readableName: function(name) {
        return name.replace(/\-/g,' - ').replace(/([0-9])([a-zA-Z])/g,'$1 $2').replace(/([a-z][a-z])([A-Z])/g,'$1 $2');
      },
       /*
       *
       */
      currentProductObject: function(productObject, index){
        var productUuidList = Object.keys(productObject);
        return productObject[productUuidList[index]];
      },
       /*
       *
       */
      productReadableName: function(productObject, index){

        var productName = this.currentProductObject(productObject, index).name;
        return this.readableName(productName);
      },
       /*
       *
       */
      productTypeCode: function(productObject, index, productType){
        var currentProductUuid = this.currentProductObject(productObject, index).product;
        return productType[currentProductUuid];
      },
      /*
       *
       */
      timezone: function(){
        //FIXME: use utility service function
        //TODO: this needs to be a global function with better timezone calculation
        //TODO: ref https://bitbucket.org/pellepim/jstimezonedetect
        var tz = new Date().getTimezoneOffset()/60;
        return (tz < 0) ? parseInt('+'+Math.abs(tz)) : parseInt('-'+Math.abs(tz));
      }

    };
    return {
      programProducts: programProducts,
      monthList: months,
      productType: productType,
      facilityProducts: facilityProducts,
      discardedReasons: discardedReasons,
      save:addRecord,
      get:load,
      getStockCountByDate: getStockCountByDate,
      getWasteCountByDate: getWasteCountByDate,
      validate: validate
    };
  });
