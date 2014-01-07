'use strict';

angular.module('lmisChromeApp')
    .factory('FacilityService', function () {

        var meaningOfLife = 42;

        // Public API here
        return {
            someMethod: function () {
                return meaningOfLife;
            }
        };
    });


/* TODO: generate this in FacilityFactory or create a part of initial data creation in either ChromeStorageProvider or chrome.app.runtime.onLaunched
'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
 */