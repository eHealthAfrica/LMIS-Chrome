'use strict';

describe('storageService', function () {

  var deferred, storageService, chromeStorageApi, rootScope, httpBackend, templateCache, resolvedValue;

  beforeEach(module('lmisChromeApp'));

  beforeEach(inject(function (_storageService_, _$q_, _$rootScope_, _chromeStorageApi_, _$httpBackend_, _$templateCache_){
    storageService = _storageService_;
    deferred = _$q_.defer();
    rootScope = _$rootScope_;
    chromeStorageApi = _chromeStorageApi_;

    httpBackend = _$httpBackend_;
    templateCache = _$templateCache_;

    var templates = [
      'index',
      'nav',
      'sidebar',
      'control-panel',
      'main-activity'
    ];

    angular.forEach(templates, function (template) {
      templateCache.put('views/home/' + template + '.html', '');
    });

    httpBackend.whenGET('/locales/en.json').respond(200, {});
    httpBackend.whenGET('/locales/en_GB.json').respond(200, {});


  }));

  it('should be able to add new table to the chrome storage', function(){
    spyOn(chromeStorageApi, 'set').andReturn(deferred.promise);
    storageService.add('key', 'value');
    expect(chromeStorageApi.set).toHaveBeenCalled();
  });

  it('should be able to resolve promise when adding new table', function(){
    deferred.resolve('resolved');
    spyOn(chromeStorageApi, 'set').andReturn(deferred.promise);
    storageService.add('key', 'value').then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolved');
  });

  it('should be able to get data from the table in the chrome storage', function(){
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.get('key');
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });


  it('should be able to resolve promise when getting data from the table', function(){
    deferred.resolve('resolvedData');
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.get('key').then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolvedData');
  });

  it('should be able to get all data from the chrome storage', function(){
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.getAll(null);
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });

  it('should be able to resolve promise when getting all data from the chrome storage', function(){
    deferred.resolve('resolvedData');
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.getAll(null).then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolvedData');
  });

  it('should be able to remove table from the chrome storage', function(){
    spyOn(chromeStorageApi, 'remove').andReturn(deferred.promise);
    storageService.remove();
    expect(chromeStorageApi.remove).toHaveBeenCalled();
  });


  it('should be able to resolve promise when removing table from the chrome storage', function(){
    deferred.resolve('resolved');
    spyOn(chromeStorageApi, 'remove').andReturn(deferred.promise);
    storageService.remove().then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolved');
  });

  it('should be able to clear all data from the chrome storage', function(){
    spyOn(chromeStorageApi, 'clear').andReturn(deferred.promise);
    storageService.clear();
    expect(chromeStorageApi.clear).toHaveBeenCalled();
  });

  it('should be able to resolve promise when clearing all data from the chrome storage', function(){
    deferred.resolve('resolved');
    spyOn(chromeStorageApi, 'remove').andReturn(deferred.promise);
    storageService.clear().then(function(value){
      resolvedValue = value;
    });
    rootScope.$apply();
    expect(resolvedValue).toEqual('resolved');
  });

  it('should be able to generate uuid with 36 unique symbols length', function () {
    var uuid = storageService.uuid();
    expect(uuid.length).toBe(36);
  });

  it('should be able to convert a table array to object and return promise', function () {
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.loadTableObject('test');
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });

  it('should be able to return an array or collection of rows in the given table and return promise', function () {
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.all('test');
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });

  it('should be able to add new or update database table row and return promise', function () {
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.insert('test', {'key': 'value'});
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });

  it('should be able to get data from a table by key and return promise', function () {
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.find('test', 'key');
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });


  it('should be able to insert batch data into a table and return promise', function () {
    spyOn(chromeStorageApi, 'get').andReturn(deferred.promise);
    storageService.insertBatch('test', ['key1', 'key2', 'key3']);
    expect(chromeStorageApi.get).toHaveBeenCalled();
  });


});