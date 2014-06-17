'use strict';

describe('chromeStorageApi', function () {
    var chromeStorageApi, $window, trackingService;

    beforeEach(module('lmisChromeApp', 'chromeStorageMock', 'i18nMocks'));

    beforeEach(inject(function (_trackingService_, _chromeStorageApi_,_$window_) {
        chromeStorageApi = _chromeStorageApi_;
        $window = _$window_;
        trackingService = _trackingService_;
    }));

    beforeEach(function(){
        chromeStorageApi.set({a:'b', c:'d'});
    });


    it('should be able to set data to the storage', function() {
        chromeStorageApi.set({e:'f'});
        expect($window._storageMock).toEqual({a:'b', c:'d', e:'f'});
    });

    it('should be able to get an item from the storage', function() {
        chromeStorageApi.get('a');
        expect($window.chrome.storage.local.get('a')).toEqual('b');
    });

    it('should be able to get entire collection from the storage', function() {
        var options = {collection:true};
        chromeStorageApi.get(null, options);
        expect($window.chrome.storage.local.get(null, options)).toEqual({a:'b', c:'d'});
    });

    it('should be able to remove an item from the storage', function() {
        chromeStorageApi.remove('c');
        expect($window._storageMock).toEqual({a:'b'});
    });

    it('should be able to remove all item from the storage', function() {
        expect($window._storageMock).toEqual({a:'b', c:'d'});
        chromeStorageApi.clear();
        expect($window._storageMock).toEqual({});
    });

});