'use strict';

angular.module('lmisChromeApp')
        .service('analyticsSyncService', function($q, storageService, trackingFactory) {
            var tracker = trackingFactory.tracker;

            //syncs analytics table
            this.syncAnalyticsTable = function(table, code) {
                var uuids = [];
                storageService.all(table)
                        .then(function(tableData) {
                            tableData.forEach(function(data) {
                                if (code === 0)
                                    tracker.sendEvent('Offline Clicks', data.action, data.label);//clicks
                                if (code === 1)
                                    tracker.sendAppView(data.page);//pages
                                if (code === 2)
                                    tracker.sendException(data.opt_description, data.opt_fatal);//exceptions

                                uuids.push(data.uuid);
                            });
                        })
                        .then(function() {
                            if (uuids.length > 0) {
                                storageService.removeRecords(table, uuids);
                            }
                        })
                        .finally(function() {
                            console.log('pending table list cleared');
                        });

            };

            //syncs analytics lost records
            this.syncLostRecords = function(table, string) {
                storageService.all(table)
                        .then(function(data) {

                            if (data.length > 0) {
                                var obj = data[0];
                                var records = obj.records;
                                tracker.sendEvent("lost data", string, "", records);
                                
                                return obj;
                            }

                        })
                        .then(function(obj) {
                            if (obj)
                                storageService.removeRecord(table, obj.uuid);
                        })
                        .finally(function() {
                            console.log('pending lost analytics list cleared');
                        });

            };

        });
