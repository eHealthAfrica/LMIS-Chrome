'use strict';

describe('Locations factory', function() {

  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var locationFactory;

  beforeEach(inject(function (_locationFactory_) {
    locationFactory = _locationFactory_;
  }));

  it('i expect locationFactory to be defined.', function(){
    expect(locationFactory).toBeDefined();
  });

  it('i expect locationFactory to have a NO_GEO_POS object.', function(){
    expect(locationFactory.NO_GEO_POS).toBeDefined();
  });

   it('i expect locationFactory.getCurrentGeoPosition() to return geoPosition.', function(){
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

     var miniGeoPosInfo = locationFactory.getMiniGeoPosition(currentPosition);

     expect(miniGeoPosInfo).toEqual(expectedResult);
   });

});
