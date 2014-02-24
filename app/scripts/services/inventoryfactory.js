'use strict';

angular.module('lmisChromeApp')
  .factory('inventoryFactory', function ($q, storageService, $location, $rootScope) {

    var stock_records={
        save_record_profile:function (record_profile_object) {

          },
        /*
        * function to save daily stock records. same function used for new entry and update
        * insert function will add uuid if key exist or create key and uuid all together
         */
        save_record:function(record_object, url_params){

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
                var bbf = angular.isDefined(monthly_stock_record_object.balance_brought_forward)?monthly_stock_record_object.balance_brought_forward[i]:'';
                table_html += '<td>'+ bbf+'</td>'+
                              '<td></td>'+
                              '<td></td>';
            }
            return table_html;
        },
        program_products: [
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
          ],
        save_stock_count:function(stock_object, date_time){
            storageService
        }


    }



    return {
      stock_records: stock_records
    };
  });
