'use strict';

angular.module('chromeStorageMock', []).factory('$window', function(){
    var storageMock;
    storageMock = {};
    return {
        _storageMock:storageMock,
        chrome: {
            storage: {
                local: {
                    set: function(data) {
                        angular.extend(storageMock, data);
                    },
                    get: function(key, mode) {
                        return mode ? storageMock : storageMock[key];
                    },
                    remove: function(key) {
                        delete storageMock[key];
                    },
                    clear: function() {
                        angular.forEach(storageMock,function(val,key){
                            delete storageMock[key];
                        });
                    }
                }
            }
        }
    };
});
