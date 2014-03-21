'use strict';

describe('storageService', function () {
    var mockChromeStorageApi, deferred, rootScope, storageService, httpBackend, templateCache;

    beforeEach(module('lmisChromeApp'));

    beforeEach(function(){

        mockChromeStorageApi = jasmine.createSpyObj('chromeStorageApi', ['set', 'get', 'remove', 'clear']);
        module(function($provide){
            $provide.value('chromeStorageApi', mockChromeStorageApi);
        })
    });

    beforeEach(inject(function(_$rootScope_,_$q_, _storageService_, _$httpBackend_, _$templateCache_){
        rootScope = _$rootScope_;
        deferred = _$q_.defer();
        storageService = _storageService_;
        httpBackend = _$httpBackend_;
        templateCache = _$templateCache_;

        var templates = [
            'index',
            'nav',
            'sidebar',
            'control-panel',
            'main-activity'
        ];

        angular.forEach(templates, function(template) {
            templateCache.put('views/home/' + template + '.html', '');
        });

        httpBackend.whenGET('/locales/en.json').respond(200, {});
        httpBackend.whenGET('/locales/en_GB.json').respond(200, {});

    }))


    it('should be able to add new table to the chrome storage', function(){
        storageService.add('key', 'value');
        expect(mockChromeStorageApi.set).toHaveBeenCalled();
    });

    it('should be able to get data from the table in the chrome storage', function(){
        storageService.get('key');
        expect(mockChromeStorageApi.get).toHaveBeenCalled();
    });

    it('should be able to get all data from the chrome storage', function(){
        storageService.getAll();
        expect(mockChromeStorageApi.get).toHaveBeenCalled();
    });

    it('should be able to remove table from the chrome storage', function(){
        storageService.remove('key');
        expect(mockChromeStorageApi.remove).toHaveBeenCalled();
    });

    it('should be able to clear all data from the chrome storage', function(){
        storageService.clear();
        expect(mockChromeStorageApi.clear).toHaveBeenCalled();
    });

    it('should be able to generate uuid with 36 unique symbols length', function(){
        var uuid = storageService.uuid();
        expect(uuid.length).toBe(36);
    });

    it('should be able to convert a table array to object and return promise', function(){
        spyOn(storageService, 'loadTableObject').andReturn(deferred.promise);;
        var promise = storageService.loadTableObject('test');
        var resolvedValue;
        promise.then(function(value) { resolvedValue = value; });
        deferred.resolve('resolvedData');
        rootScope.$apply();
        expect(resolvedValue).toEqual('resolvedData');
    })

    it('should be able to return an array or collection of rows in the given table and return promise', function(){
        spyOn(storageService, 'all').andReturn(deferred.promise);
        var promise = storageService.all('test');
        var resolvedValue;
        promise.then(function(value) { resolvedValue = value; });
        deferred.resolve('resolvedData');
        rootScope.$apply();
        expect(resolvedValue).toEqual('resolvedData');
    })

    it('should be able to add new or update database table row and return promise', function(){
        spyOn(storageService, 'insert').andReturn(deferred.promise);
        var promise = storageService.insert('test', {'key':'value'});
        var resolvedValue;
        promise.then(function(value) { resolvedValue = value; });
        deferred.resolve('resolvedData');
        rootScope.$apply();
        expect(resolvedValue).toEqual('resolvedData');
    })

    it('should be able to get data from a table by key and return promise', function(){
        spyOn(storageService, 'find').andReturn(deferred.promise);
        var promise = storageService.find('test', 'key');
        var resolvedValue;
        promise.then(function(value) { resolvedValue = value; });
        deferred.resolve('resolvedData');
        rootScope.$apply();
        expect(resolvedValue).toEqual('resolvedData');
    });

    it('should be able to insert batch data into a table and return promise', function(){
        spyOn(storageService, 'insertBatch').andReturn(deferred.promise);
        var promise = storageService.insertBatch('test', ['key1', 'key2', 'key3']);
        var resolvedValue;
        promise.then(function(value) { resolvedValue = value; });
        deferred.resolve('resolvedData');
        rootScope.$apply();
        expect(resolvedValue).toEqual('resolvedData');
    });

});