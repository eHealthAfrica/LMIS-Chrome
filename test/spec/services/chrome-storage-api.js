'use strict';

describe('chromeStorageApi', function () {
  var chromeStorageApi, $window;

  beforeEach(module('lmisChromeApp', 'chromeStorageMock'));

  beforeEach(function(){
      $window._storageMock = {a:'b', c:'d'};
  });

  beforeEach(inject(function (_chromeStorageApi_,_$window_) {
    chromeStorageApi = _chromeStorageApi_;
    $window = _$window_;
  }));

  it('should be able to set data to the storage', function() {
      chromeStorageApi.set({e:'f'});
      expect($window._storageMock).toEqual({a:'b', c:'d', e:'f'});
    });

  it('should be able to get an item from the storage', function() {
    chromeStorageApi.get('a', false);
    expect($window.chrome.storage.local.get('a', false)).toEqual('b');
  });

  it('should be able to get entire collection from the storage', function() {
      chromeStorageApi.get(null, true);
      expect($window.chrome.storage.local.get(null, true)).toEqual({a:'b', c:'d'});
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