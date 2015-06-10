'use strict';

angular.module('lmisChromeApp', [
	'ui.bootstrap',
	'ui.router',
	'tv.breadcrumbs',
	'pouchdb',
	'config',
	'nvd3ChartDirectives',
	'angular-growl',
	'ngAnimate',
	'db',
	'LocalForageModule'
])
		.run(function (storageService, facilityFactory, locationService, $localForage, $rootScope, $state, $window, appConfigService, backgroundSyncService, fixtureLoaderService, growl, utility, pouchMigrationService, $log, i18n, analyticsSyncService) {

			// TODO: see item:680
			if (!utility.has($window, 'PouchDB')) {
				// Short-circuit as PouchDB has not been sourced. Likely running in test
				// environment.
				return;
			}

			function navigateToHome() {
				$state.go('home.index.home.mainActivity');
				backgroundSyncService.startBackgroundSync()
						.finally(function () {
							console.log('updateAppConfigAndStartBackgroundSync triggered on start up has been completed!');
						});

				analyticsSyncService.syncOfflineAnalytics()
						.finally(function () {
							console.log('offline reports send to ga server.');
						});
			}

			function loadApp() {
				storageService.get(storageService.APP_CONFIG)
						.then(function (data) {
							if (angular.isArray(data) && data.length > 0) {
								var appConfig = data[0];
								if (angular.isObject(appConfig)) {
									fixtureLoaderService.loadLocalDatabasesIntoMemory(fixtureLoaderService.REMOTE_FIXTURES)
											.then(function () {
												$rootScope.$emit('MEMORY_STORAGE_LOADED');
												navigateToHome();
											})
											.catch(function (reason) {
												console.error(reason);
												growl.error('loading storage into memory failed, contact support.', {ttl: -1});
											});
								} else {
									growl.error('App configuration is not valid, contact support.');
								}
							} else {
								$state.go('appConfigWelcome');
							}
						})
						.catch(function () {
							growl.error('Loading of App. Config. failed, please contact support.', {ttl: -1});
						});
			}

			loadApp();

		})
		.config(function ($compileProvider) {
			// to bypass Chrome app CSP for images.
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
		})
		.config(function (growlProvider) {
			growlProvider.globalTimeToLive({
				success: 5000,
				error: 5000,
				warning: 5000,
				info: 5000
			});
		});
