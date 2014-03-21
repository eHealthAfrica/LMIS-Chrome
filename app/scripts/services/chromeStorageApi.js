'use strict'

angular.module('lmisChromeApp').factory('chromeStorageApi', function($window){
    if(typeof  $window.chrome.storage == 'undefined')
        return false;

    return{
        set:function(obj, callback){
            $window.chrome.storage.local.set(obj, callback);
            return true;
        },
        get:function(items, callback){
            $window.chrome.storage.local.get(items, callback);
            return true;
        },
        remove:function(items, callback){
            $window.chrome.storage.local.remove(items, callback);
            return true;
        },
        clear:function(callback){
            $window.chrome.storage.local.clear(callback);
            return true;
        }
    }
});