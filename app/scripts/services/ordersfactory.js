'use strict';

angular.module('lmisChromeApp')
  .factory('ordersFactory', function (storageService, $q) {
    // Service logic
    // ...
    var salesOrder ={
        save:function(sales_object){

        },
        remove:function(object_uuid){

        }

    }
    var purchaseOrder = function(){

    }

    // Public API here
    return {
      sales: salesOrder,
      purchase: purchaseOrder
    };
  });
