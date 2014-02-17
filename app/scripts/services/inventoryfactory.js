'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryFactory', function ($q, storageService, $location, $route, $rootScope) {
    var common_fn = {
        isUndefined:function (test_var){
 		    return Object.prototype.toString.call(test_var) == "[object Undefined]"?true:false;
 	    }
    }
    var stock_records={
        save_record_profile:function (record_profile_object) {
            storageService.insert('monthly_stock_record', record_profile_object).then(function (bool) {
                  $route.reload();
            });
          },
        /*
        * function to save daily stock records. same function used for new entry and update
        * insert function will add uuid if key exist or create key and uuid all together
         */
        save_record:function(record_object, url_params){
            storageService.insert('daily_stock_records', record_object).then(function (bool) {
                  var msg = (record_object.uuid) ? {type: "success", message: "record update was successful"} : {type: "success", message: "record entry was successful"}
                  $rootScope.setMessage(msg);
                  $location.search("facility", url_params.facility)
                      .search('report_month', url_params.report_month)
                      .search('report_year', url_params.report_year).path('/stock_records');
            });
        },
        /*
        * create and populate column based on count of program products for a given facility
         */
        status_column:function(stock_products){
            var table_html = '<td></td>';
            for(var i=0; i<stock_products.length; i++){
                table_html += "<td>Received</td><td>Used</td><td>Balance</td>";
            }
            return table_html;
        },
        //stock brought forward from prvious month
        brought_forward_columns:function (monthly_stock_record_object, stock_products){
            var table_html = '<td>BBF</td>';

            for(var i=0; i<stock_products.length; i++){
                var bbf = '';
                table_html += '<td>'+ bbf+'</td>'+
                              '<td></td>'+
                              '<td></td>';
            }
            return table_html;
        }
    }



    return {
      stock_records: stock_records
    };
  });
