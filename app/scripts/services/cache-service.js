'use strict'

angular.module('lmisChromeApp').service('cacheService', function ($q, $cacheFactory) {

  var _cacheId = 'lmisChromeAppCache';
  var _cache = $cacheFactory(_cacheId);

  this.PRODUCT_TYPE_INFO = 'productTypesInfo';

  this.getCache =  function(){
    return _cache;
  };

  this.get = function(key){
    return _cache.get(key);
  };

  this.put = function(key, value){
    return _cache.put(key, value);
  };

  this.remove = function(key){
    return _cache.remove(key);
  };

  this.clearCache = function(){
    return _cache.removeAll();
  };

  this.destroyCache = function(){
    return _cache.destroy();
  };

});
