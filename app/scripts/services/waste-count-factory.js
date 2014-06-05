'use strict';

angular.module('lmisChromeApp')
  .factory('wasteCountFactory', function ($filter, storageService, utility, $q, syncService, i18n) {

    var wasteReasons = [
      'VVM Stage 3',
      'Broken Vial',
      'Label Missing',
      'Unopened Expiry',
      'Opened Expiry',
      'Suspected Freezing',
      'Other'
    ];

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

    var productType = function(){
      var deferred = $q.defer();
      storageService.get(storageService.PRODUCT_TYPES).then(function(productTypes){

        deferred.resolve(productTypes);
      });
      return deferred.promise;
    };

    var isoDate = function(_date){
      var date = (angular.isDefined(_date)) ? new Date(_date) : new Date();
      return $filter('date')(date, 'yyyy-MM-dd');
    };

    var saveWasteCount = function(scope, state, growl){
      scope.wasteCount.facility = scope.facilityUuid;
      scope.wasteCount.countDate = new Date(scope.reportYear, parseInt(scope.reportMonth)-1, scope.currentDay, load.timezone());
      addRecord(scope.wasteCount)
      .then(function(uuid) {
        scope.wasteCount.uuid = uuid;
        if(scope.redirect) {
          syncService.syncItem(storageService.DISCARD_COUNT, scope.wasteCount);//sync in the background
          var msg = [
              'You have completed waste count for',
              scope.currentDay,
              scope.monthList[scope.reportMonth],
              scope.reportYear
            ].join(' ');
          growl.success(msg);
          scope.isSaving = false;
          state.go('home.index.home.mainActivity', {'stockResult': msg});
        }
      })
      .catch(function(reason){
        growl.error(reason, {persistent: true});
      });
    };
    var addRecord = function(object){
      var deferred = $q.defer();
      if(object.countDate instanceof Date){
        object.countDate = object.countDate.toJSON();
      }
      validate.waste.countExist().then(function(wasteCount){
        if(wasteCount !== null){
          object.uuid = wasteCount.uuid;
        }
        storageService.save(storageService.DISCARD_COUNT, object)
            .then(function(uuid){
              deferred.resolve(uuid);
            }, function(reason){
              deferred.reject(reason);
            })
            .catch(function(reason){
              deferred.reject(reason);
            });
      });
      return deferred.promise;
    };

    var validate = {
     /*
      * I'm going to assume any value entered that is not a number is invalid
      */
      invalid: function(entry){
        return !!((entry === '' || angular.isUndefined(entry) || isNaN(entry) || entry < 0));
      },
      waste: {
        countExist: function(date){
          return getWasteCountByDate(date);
        },
        /**
         * this function validate reason and save the current value if no error
         * @param scope
         * @param index
         */
        reason: function(scope, index){
          var currentReason = scope.wasteCount.reason[scope.productKey][index];
          var entryError = (validate.invalid(currentReason))?true:false;
          var errorMsg = [];

          if(entryError){
            errorMsg.push('invalid entry');
          }

          if(errorMsg.length > 0){
            scope.wasteErrors[scope.productKey][index] = true;
            scope.wasteErrorMsg[scope.productKey][index]= errorMsg.join('<br>');
          }else{
            delete scope.wasteErrors[scope.productKey][index];
            delete scope.wasteErrorMsg[scope.productKey][index];
          }
          //if any form field contain invalid data we need to indicate it indefinitely
          if(Object.keys(scope.wasteErrors[scope.productKey]).length > 0){
            scope.reasonError = true;
          }else{

            delete scope.wasteErrors[scope.productKey];
            delete scope.wasteErrorMsg[scope.productKey];
            scope.reasonError = false;
            scope.redirect = false;
            scope.wasteCount.lastPosition = scope.step;
            scope.wasteCount.discarded[scope.productKey] =  load.sumReasonObject(scope.wasteCount.reason[scope.productKey]);
            if(scope.wasteCount.reason[scope.productKey][index] === null){
              scope.wasteCount.reason[scope.productKey][index] = 0;
            }
            scope.save();
          }
        },
        changeState: function(scope, direction){
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.currentEntry = scope.wasteCount.discarded[scope.productKey];
          if(validate.invalid(scope.currentEntry) && direction !== 0){
            load.errorAlert(scope, 1);
          }else if (scope.reasonError){
            load.errorAlert(scope, 2);
          }else{
            load.errorAlert(scope, 0);
            if(direction !== 2){
              scope.step = direction === 0? scope.step-1 : scope.step + 1;
            }else{
              scope.preview = true;
              scope.wasteCount.isComplete = 1;
            }
          }
          scope.wasteCount.lastPosition = scope.step;
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.selectedFacilityProduct = load.productReadableName(scope.facilityProducts, scope.step);
          scope.productTypeCode = load.productTypeCode(scope.facilityProducts, scope.step, scope.productType);
          if(angular.isUndefined(scope.wasteCount.reason[scope.productKey])){
            scope.wasteCount.reason[scope.productKey] = {};
          }
          for(var i in scope.wasteReasons){
            if(angular.isUndefined(scope.wasteCount.reason[scope.productKey][i])){
              scope.wasteCount.reason[scope.productKey][i] = 0;
            }
          }
          if(angular.isUndefined(scope.wasteCount.discarded[scope.productKey])){
            scope.wasteCount.discarded[scope.productKey] = 0;
          }
        }
      }

    };

    var getWasteCountByDate = function (date) {
      date = date instanceof Date ? isoDate(date.toJSON()) : date;
      var deferred = $q.defer();
      storageService.all(storageService.DISCARD_COUNT).then(function (wasteCounts) {
        var wasteCount = null;
        for (var index in wasteCounts) {
          var row = wasteCounts[index];
          var wasteCountDate = isoDate(row.countDate);
          date = isoDate(date);
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
      /**
       *
       * @returns {promise}
       */
      allWasteCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.DISCARD_COUNT)
          .then(function(wasteCounts){
            wasteCounts = syncService.addSyncStatus(wasteCounts);
            deferred.resolve(wasteCounts);
          });
        return deferred.promise;
      },
      /**
       *
       * @param productObject
       * @param index
       * @returns {object}
       */
      currentProductObject: function(productObject, index){
        var productKey =  (Object.keys(productObject))[index];
        return productObject[productKey];
      },
      /**
       *
       * @param productObject
       * @param index
       * @returns {string}
       */
      productReadableName: function(productObject, index){
        var productName = this.currentProductObject(productObject, index).name;
        return utility.getReadableProfileName(productName);
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
        return utility.getTimeZone();
      },
      /**
       *
       * @param scope
       * @param error
       */
      errorAlert: function(scope, error){
        if(error === 1){
          scope.productError = true;
          scope.productErrorMsg = i18n('stockCountErrorMsg');;
        }
        else if (error === 2){
          scope.productError = true;
          scope.productErrorMsg = i18n('discardErrorMsg');
        }
        else{
          scope.productError = false;
          scope.productErrorMsg = '';
        }
      },
      /**
       *
       * @param array
       * @returns {{}}
       */
      productObject: function(array){
        return utility.castArrayToObject(array, 'uuid');
      },
      /**
       *
       * @param object
       * @returns {number}
       */
      sumReasonObject: function (object){
        var sum = 0;
        for(var i in object){
          if(object[i] !== null && !isNaN(parseInt(object[i]))){
            sum += parseInt(object[i]);
          }
        }
        return sum;
      },
      wasteCountByType: function(wasteCount, facilityProductProfiles){
        var arr = [];
        if(Object.prototype.toString.call(wasteCount) === '[object Object]'){
          for(var i in wasteCount.discarded){
            if(angular.isDefined(facilityProductProfiles[i])){
              var uom = facilityProductProfiles[i].presentation.uom.symbol;
              arr.push({
                header: true,
                value: wasteCount.discarded[i],
                key: i,
                uom: uom
              });
              if((Object.keys(wasteCount.reason[i])).length > 0){
                for(var j in wasteCount.reason[i]){
                  if(wasteCount.reason[i][j] !== 0 && wasteCount.reason[i][j] !== ''){
                    arr.push(
                      {
                        header: false,
                        value: wasteCount.reason[i][j],
                        key: j,
                        uom: uom
                      }
                    );
                  }
                }
              }
            }
          }
        }
        return arr;
      },
      productName: function(row, facilityProducts){
        var name = row.key;
        if(row.header){
          name = facilityProducts[row.key].name;
        }
        else{
          name = wasteReasons[row.key];
        }
        return name;
      }

    };
    var watchWasteCountEntries = function(scope){
      scope.$watchCollection('wasteCount.reason[productKey]', function(newValues, oldValues){
        if((Object.keys(newValues)).length > 0){
          for(var i in newValues){
            if(newValues[i] !== oldValues[i]){
              checkInput(scope, i);
            }
          }
        }
      });
    };

    var checkInput = function(scope, index){
      if(angular.isUndefined(scope.wasteErrors[scope.productKey])){
        scope.wasteErrors[scope.productKey] = {};
      }
      if(angular.isUndefined(scope.wasteErrorMsg[scope.productKey])){
        scope.wasteErrorMsg[scope.productKey] = {};
      }
      validate.waste.reason(scope, index);
      scope.wasteCountByType = load.wasteCountByType(scope.wasteCount, scope.facilityProducts);
    };

    return {
      monthList: months,
      productType: productType,
      wasteReasons: wasteReasons,
      add: addRecord,
      save:saveWasteCount,
      get:load,
      getWasteCountByDate: getWasteCountByDate,
      validate: validate,
      watchWasteCount: watchWasteCountEntries,
      DB_NAME: storageService.DISCARD_COUNT
    };
  });
