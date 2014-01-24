'use strict';

angular.module('lmisChromeApp')
  .factory('utility', function ($http, storageService, $q) {
    // Service logic
    // ...
    function loadFixtures(){
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
            'user',
            'product_category'
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
                        //console.log(data);
                        //loadRealatedObject(db_name);

                    }).error(function(err){
                        console.log(err);
                    });
                }
                else{
                    console.log(db_name+" is loaded with "+test_data.length);
                    //loadRealatedObject(db_name);
                }

             },
                function(reason){
                   //console.log(reason);
                }
            );
        }
    }

    function loadRealatedObject(db_name){
        var deferred = $q.defer();
         //TODO: add key validation and identifier type (uuid | id)
        //create a new table name by prefixing the original with 're'
        var related_name = 're_'+db_name;
        //when called get data from storage and create an object using uuid as key
        storageService.get(db_name).then(function(data){
            if(data.length != 0 && data.length != undefined){
                //load table data into object
                var related_object = {};
                for(var k in data){
                    if(Object.prototype.toString.call(data[k]) === '[object Object]'){
                        //var keys = Object.keys(data[k]);
                        if(data[k].uuid != undefined){

                            related_object[data[k].uuid]=data[k];
                        }
                        else if(data[k].id != undefined){

                            related_object[data[k].id]=data[k];
                        }
                    }
                }
                //store new object in local storage
                storageService.add(related_name, related_object);
                deferred.resolve(related_object);
            }
        });
        return deferred.promise;
    }
    // Public API here
    return {
        loadFixtures:loadFixtures,
        loadTableObject: loadRealatedObject
    };
  });
