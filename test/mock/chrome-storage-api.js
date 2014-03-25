'use strict'
describe('chromeStorageApi', function () {
  var mockWindow, chromeStorageApi;

  beforeEach(module('lmisChromeApp'));

  beforeEach(function () {
    mockWindow = {
      chrome: {
        storage: {
          local: sinon.stub({
            set: function () {
            },
            get: function () {
            },
            remove: function () {
            },
            clear: function () {
            }
          })
        }
      },
      addEventListener: function () {
      }
    };
    module(function ($provide) {
      $provide.value('$window', mockWindow);
    });
  });

  beforeEach(inject(function (_chromeStorageApi_) {
    chromeStorageApi = _chromeStorageApi_;
  }));

  it('should be able to set data to the storage', function () {
    chromeStorageApi.set({'key':'value'});
    expect(mockWindow.chrome.storage.local.set).toHaveBeenCalledWith({'key':'value'});

  });

  it('should be able to get an item from the storage', function () {
    chromeStorageApi.get('key');
    expect(mockWindow.chrome.storage.local.get).toHaveBeenCalledWith('key');
  });

  it('should be able to remove an item from the storage', function () {
    chromeStorageApi.remove('key');
    expect(mockWindow.chrome.storage.local.remove).toHaveBeenCalledWith('key');
  });

  it('should be able to remove all item from the storage', function () {
    chromeStorageApi.clear();
    expect(mockWindow.chrome.storage.local.clear).toHaveBeenCalled();
  });

});