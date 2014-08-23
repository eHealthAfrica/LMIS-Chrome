'use strict';

describe('Geo-Locations factory', function() {

  beforeEach(module('lmisChromeApp', 'i18nMocks'));

  var geolocationFactory;

  beforeEach(inject(function (_geolocationFactory_) {
    geolocationFactory = _geolocationFactory_;
  }));

  it('i expect geolocationFactory to be defined.', function(){
    expect(geolocationFactory).toBeDefined();
  });

  it('i expect geolocationFactory to have a NO_GEO_POS object.', function(){
    expect(geolocationFactory.NO_GEO_POS).toBeDefined();
  });

   it('i expect geolocationFactory.getCurrentGeoPosition() to return geoPosition.', function(){
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

     var miniGeoPosInfo = geolocationFactory.getMiniGeoPosition(currentPosition);

     expect(miniGeoPosInfo).toEqual(expectedResult);
   });

});
