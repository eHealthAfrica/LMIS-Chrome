'use strict';

describe('Service: cacheService ', function() {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate service
  var cacheService, $cacheFactory;
  var cacheId = 'lmisChromeAppCache';
  var key = 'username';
  var value = 'testuser';

  beforeEach(inject(function(_cacheService_, _$cacheFactory_) {
    cacheService = _cacheService_;
    $cacheFactory = _$cacheFactory_;
  }));

  it('as a user, i expect cacheService to be defined ', function(){
    expect(cacheService).toBeDefined();
  });

  it('as a user, i expect cacheService to return a cache with id equals to "lmisChromeAppCache" ', function(){
    var cacheInfo = {id: cacheId, size: 0};
    expect(cacheService.getCache().info()).toEqual(cacheInfo);
  });

  it('as a user, i expect cacheService.getCache to return a cache ', function(){
    expect(angular.isFunction(cacheService.getCache)).toBeTruthy()

    var cache = cacheService.getCache();
    var testCache = $cacheFactory('testCache');

    expect(Object.keys(cache)).toEqual(Object.keys(testCache));
  });

  it('as a user, i want to be able to retrieve value from a cache', function(){
    cacheService.put(key, value);
    var cachedValue = cacheService.get(key);

    expect(value).toEqual(cachedValue);
  });

  it('as a user i want to be able to clear all cached values ', function(){
    var cache = cacheService.getCache();

    expect(cache.info().size).toEqual(0);
    cacheService.put(key, value);
    expect(cache.info().size).toEqual(1);

    //clear storage
    cacheService.clearCache();
    expect(cache.info().size).toEqual(0);
  })

  it('as a user i want to clear a value from cache by the key', function(){
    cacheService.put(key, value);

    expect(cacheService.get(key)).toBeDefined();
    cacheService.remove(key);
    expect(cacheService.get(key)).toBeUndefined();
  });

  it('as a user, i want to be able to destroy cache ', function(){
    var cache = cacheService.getCache();
    cacheService.destroyCache();
    var newCache = $cacheFactory(cacheId);
    expect(cache.info()).not.toEqual(newCache.info());
  });

});
