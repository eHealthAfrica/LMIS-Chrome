'use strict';

angular.module('lmisChromeApp')
  .factory('discardCountFactory', function ($filter, storageService, utility, $q, syncService) {

    var discardedReasons = [
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

    var saveDiscarded = function(scope, state, growl){
      scope.discardCount.facility = scope.facilityUuid;
      scope.discardCount.countDate = new Date(scope.reportYear, parseInt(scope.reportMonth)-1, scope.currentDay, load.timezone());
      addRecord(scope.discardCount)
      .then(function(uuid) {
        scope.discardCount.uuid = uuid;
        if(scope.redirect) {
          syncService.syncItem(storageService.DISCARD_COUNT, scope.discardCount);//sync in the background
          var msg = [
              'You have completed discard count for',
              scope.currentDay,
              scope.monthList[scope.reportMonth],
              scope.reportYear
            ].join(' ');
          growl.success(msg);
          scope.isSaving = false;
          state.go('home.index.home.mainActivity', {
            'facility': scope.facilityUuid,
            'reportMonth': scope.reportMonth,
            'reportYear': scope.reportYear,
            'stockResult': msg
          });
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
        validate.discard.countExist().then(function(discardCount){
          if(discardCount !== null){
            object.uuid = discardCount.uuid;
          }
          storageService.save(storageService.DISCARD_COUNT, object)
              .then(function(uuid){
                deferred.resolve(uuid);
              })
          ;

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
      discard: {
        countExist: function(date){
          return getDiscardCountByDate(date);
        },
        /**
         * this function validate reason and save the current value if no error
         * @param scope
         * @param index
         */
        reason: function(scope, index){
          var currentReason = scope.discardCount.reason[scope.productKey][index];
          var entryError = (validate.invalid(currentReason))?true:false;
          var errorMsg = [];

          if(entryError){
            errorMsg.push('invalid entry');
          }

          if(errorMsg.length > 0){
            scope.discardErrors[scope.productKey][index] = true;
            scope.discardErrorMsg[scope.productKey][index]= errorMsg.join('<br>');
          }else{
            delete scope.discardErrors[scope.productKey][index];
            delete scope.discardErrorMsg[scope.productKey][index];
          }
          //if any form field contain invalid data we need to indicate it indefinitely
          if(Object.keys(scope.discardErrors[scope.productKey]).length > 0){
            scope.reasonError = true;
          }else{

            delete scope.discardErrors[scope.productKey];
            delete scope.discardErrorMsg[scope.productKey];
            scope.reasonError = false;
            scope.redirect = false;
            scope.discardCount.lastPosition = scope.step;
            scope.discardCount.discarded[scope.productKey] =  load.sumReasonObject(scope.discardCount.reason[scope.productKey]);
            if(scope.discardCount.reason[scope.productKey][index] === null){
              scope.discardCount.reason[scope.productKey][index] = 0;
            }
            scope.save();
          }
        },
        changeState: function(scope, direction){
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.currentEntry = scope.discardCount.discarded[scope.productKey];
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
              scope.discardCount.isComplete = 1;
            }
          }
          scope.discardCount.lastPosition = scope.step;
          scope.productKey = scope.facilityProductsKeys[scope.step];
          scope.selectedFacilityProduct = load.productReadableName(scope.facilityProducts, scope.step);
          scope.productTypeCode = load.productTypeCode(scope.facilityProducts, scope.step, scope.productType);
          if(angular.isUndefined(scope.discardCount.reason[scope.productKey])){
            scope.discardCount.reason[scope.productKey] = {};
          }
          for(var i in scope.discardedReasons){
            if(angular.isUndefined(scope.discardCount.reason[scope.productKey][i])){
              scope.discardCount.reason[scope.productKey][i] = 0;
            }
          }
          if(angular.isUndefined(scope.discardCount.discarded[scope.productKey])){
            scope.discardCount.discarded[scope.productKey] = 0;
          }
        }
      }

    };

    var getDiscardCountByDate = function (date) {
      var deferred = $q.defer();
      storageService.all(storageService.DISCARD_COUNT).then(function (discardCounts) {
        var discardCount = null;
        for (var index in discardCounts) {
          var row = discardCounts[index];
          var discardCountDate = isoDate(row.countDate);
          date = isoDate(date);
          if (date === discardCountDate) {
            discardCount = row;
            break;
          }
        }
        deferred.resolve(discardCount);
      });
      return deferred.promise;
    };

    var load={
      /**
       *
       * @returns {promise}
       */
      allDiscardCount: function(){
        var deferred = $q.defer();
        storageService.all(storageService.DISCARD_COUNT)
          .then(function(discardCounts){
            discardCounts = syncService.addSyncStatus(discardCounts);
            deferred.resolve(discardCounts);
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
          scope.productErrorMsg = 'count value is invalid, at least enter Zero "0" to proceed';
        }
        else if (error === 2){
          scope.productError = true;
          scope.productErrorMsg = 'please fix errors in reason selection';
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

      productProfile: function(){
        return storageService.get(storageService.PRODUCT_PROFILE);
      },
      discardCountByType: function(discardCount, facilityProductProfiles){
        var arr = [];
        if(Object.prototype.toString.call(discardCount) === '[object Object]'){
          for(var i in discardCount.discarded){
            var uom = facilityProductProfiles[i].presentation.uom.symbol;
            arr.push({
              header: true,
              value: discardCount.discarded[i],
              key: i,
              uom: uom
            });
            if((Object.keys(discardCount.reason[i])).length > 0){
              for(var j in discardCount.reason[i]){
                if(discardCount.reason[i][j] !== 0){
                  arr.push(
                    {
                      header: false,
                      value: discardCount.reason[i][j],
                      key: j,
                      uom: uom
                    }
                  );
                }
              }
            }
          }
        }
        return arr;
      },
      /**
       *
       * @param scope
       */
      discardCountByIntervals: function(scope){

        var dates = [];
        var interval = 1000 * 60 * 60 * 24 * parseInt(scope.countInterval);

        var reminderDate = utility.getWeekRangeByDate(new Date(), scope.reminderDay);
        var current = reminderDate.reminderDate;

        while(dates.length < scope.maxList){
          if(isoDate(current.toJSON()) <= isoDate()){
            dates.push(isoDate(current.toJSON()));
          }
          current = new Date(current.getTime() - interval);
          if(isoDate(current.toJSON()) < isoDate(scope.dateActivated)){
            break;
          }
        }
        return dates;
      },
      discardCountListByDate: function(stockCountList){
        var obj = {};
        for(var i=0; i < stockCountList.length; i++){
          var date = isoDate(stockCountList[i].countDate);
          obj[date] = stockCountList[i];
        }
        return obj;
      },
      missingEntry: function(date, scope){
        var reminderDate = utility.getWeekRangeByDate(new Date(date), scope.reminderDay);
        var lastDay = reminderDate.last;
        if(angular.isUndefined(scope.discardCountByDate[date])){
          if(isoDate(date) === isoDate()){
            return false;
          }
          else if (isoDate(lastDay.toJSON()) >= isoDate()){
            return false;
          }
          else{
            return true;
          }
        }
        else{
          if(scope.discardCountByDate[date].isComplete ||isoDate(date) === isoDate()){
            return false;
          }
          return true;
        }
      },
      mergedDiscardCount: function(fromDB, fromFacilitySelected){
        var db = Object.keys(fromDB);
        var dbArr = Object.keys(fromDB);
        for(var i in fromFacilitySelected){
          if(fromFacilitySelected[i] in fromDB){
            var index = db.indexOf(fromFacilitySelected[i]);
            dbArr.pop(index);
          }
        }
        return fromFacilitySelected.concat(dbArr);
      },
      productName: function(row, facilityProducts){
        var name = row.key;
        if(row.header){
          name = facilityProducts[row.key].name;
        }
        else{
          name = discardedReasons[row.key];
        }
        return name;
      }

    };
    var watchDiscardedEntries = function(scope){
      scope.$watchCollection('discardCount.reason[productKey]', function(newValues, oldValues){
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
      if(angular.isUndefined(scope.discardErrors[scope.productKey])){
        scope.discardErrors[scope.productKey] = {};
      }
      if(angular.isUndefined(scope.discardErrorMsg[scope.productKey])){
        scope.discardErrorMsg[scope.productKey] = {};
      }
      validate.discard.reason(scope, index);
      scope.discardCountByType = load.discardCountByType(scope.discardCount, scope.facilityProducts);
    };

    return {
      monthList: months,
      productType: productType,
      discardedReasons: discardedReasons,
      save:saveDiscarded,
      get:load,
      getDiscardCountByDate: getDiscardCountByDate,
      validate: validate,
      watchDiscarded: watchDiscardedEntries
    };
  });
