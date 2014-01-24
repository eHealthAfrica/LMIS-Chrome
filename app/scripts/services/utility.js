'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function ($http, storageService) {
    // Service logic
    // ...
    function loadFixture(){
        var database=[
            'products',
            'address',
            'uom',
            'uom_category',
            'facility',
            'programs',
            'facility_type',
            'employee_category',
            'company',
            'company_category',
            'currency',
            'employee',
            'rate',
            'storage_location_type',
            'storage_locations',
            'user'
        ]
        for(var i in database){
            loadData(database[i]);
        }
        function loadData(db_name){
            var test_data = [];

             storageService.get(db_name).then(function(data){
                test_data = data;
                if(test_data.length == 0 || test_data.length == undefined){

                   var file_url = 'scripts/fixtures/'+db_name+'.json';
                    $http.get(file_url).success(function(data){
                        storageService.add(db_name, data);
                        console.log(data);

                    }).error(function(err){
                        console.log(err);
                    });
                }
                else{
                    console.log(db_name+" is loaded with "+test_data.length);
                }

             },
                function(reason){
                   //console.log(reason);
                }
            );
        }
    }

    function loadRealatedObject(db_name){


        var related_name = 're_'+db_name;
        storageService.get(related_name).then(function(related_data){

            if(related_data){
                return related_data;
            }
            else{
                storageService.get(db_name).then(function(data){
                    if(data.length != 0 && data.length != undefined){
                        var related_object = {};
                        for(var k in data){
                            //TODO: add key validation
                            related_object[data[k].uuid]=data[k];
                        }
                        storageService.add(related_name, related_object);
                    }
                });
            }



        });

    }
    // Public API here
    return {
        loadFixture:loadFixture,
        loadTableObject: loadRealatedObject
    };
  });
