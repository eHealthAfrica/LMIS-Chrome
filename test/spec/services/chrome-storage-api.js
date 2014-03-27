'use strict';

describe('chromeStorageApi', function () {
  var $window, chromeStorageApi;

  beforeEach(module('lmisChromeApp', 'chromeStorageAPIMocks'));

  beforeEach(inject(function (_chromeStorageApi_, _$window_) {
    $window = _$window_;
    chromeStorageApi = _chromeStorageApi_;
  }));


  it('should be able to set data to the storage', function () {
    spyOn($window.chrome.storage.local,'set');
    chromeStorageApi.set({'key':'value'});
    expect($window.chrome.storage.local.set).toHaveBeenCalled();
  });

  it('should be able to get an item from the storage', function () {
    spyOn($window.chrome.storage.local,'get');
    chromeStorageApi.get('key');
    expect($window.chrome.storage.local.get).toHaveBeenCalled();
  });

  it('should be able to remove an item from the storage', function () {
    spyOn($window.chrome.storage.local,'remove');
    chromeStorageApi.remove('key');
    expect($window.chrome.storage.local.remove).toHaveBeenCalled();
  });

  it('should be able to remove all item from the storage', function () {
    spyOn($window.chrome.storage.local,'clear');
    chromeStorageApi.clear();
    expect($window.chrome.storage.local.clear).toHaveBeenCalled();
  });

});
