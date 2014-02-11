'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryFactory', function ($q, storageService, $location, $route) {

    var stock_records={
        save_record_profile:function (record_profile_object) {
            storageService.insert('monthly_stock_record', record_profile_object).then(function (bool) {
                  $route.reload();
            });
          },
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
            table_html += '<td>'+ monthly_stock_record_object.balance_brought_forward[i]+'</td>'+
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
