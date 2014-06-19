'use strict';

describe('Locations factory', function() {

  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var locationsFactory;

  beforeEach(inject(function (_locationsFactory_) {
    locationsFactory = _locationsFactory_;
  }));

  it('i expect locationsFactory to be defined.', function(){
    expect(locationsFactory).toBeDefined();
  });

  it('i expect locationsFactory to have a NO_GEO_POS object.', function(){
    expect(locationsFactory.NO_GEO_POS).toBeDefined();
  });

   it('i expect locationsFactory.getCurrentGeoPosition() to return geoPosition.', function(){
     var currentPosition = {
      coords: {
        accuracy: 22,
        longitude: 15.091212,
        latitude: 32.167281,
        speed: null,
        altitude: null,
        heading: null,
        altitudeAccuracy: null,
        timestamp: new Date().getTime()
      }
     };

     var expectedResult = {
       accuracy: currentPosition.coords.accuracy,
       latitude: currentPosition.coords.latitude,
       longitude: currentPosition.coords.longitude
     };

     var miniGeoPosInfo = locationsFactory.getMiniGeoPosition(currentPosition);

     expect(miniGeoPosInfo).toEqual(expectedResult);
   });

});
