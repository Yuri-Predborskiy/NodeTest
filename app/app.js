(function () {
	'use strict';
	function config($stateProvider, $urlRouterProvider) {
		// default route
		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'home/index.html',
				controller: 'Home.IndexController',
				controllerAs: 'vm',
				data: { activeTab: 'home' }
			})
			.state('account', {
				url: '/account',
				templateUrl: 'account/index.html',
				controller: 'Account.IndexController',
				controllerAs: 'vm',
				data: { activeTab: 'account' }
			})
			.state('userlist', {
				url: '/userlist/index.html',
				templateUrl: 'userlist/index.html',
				controller: 'Userlist.IndexController',
				controllerAs: 'vm',
				data: { activeTab: 'userlist' }
			})
			.state('tests', {
				url: '/tests/list',
				templateUrl: 'test/index.html',
				controller: 'Test.IndexController',
				controllerAs: 'vm',
				data: { activeTab: 'tests' }
			})
			.state('test', {
				url: '/tests/test/?{id}',
				templateUrl: 'test/item.html',
				controller: 'Test.ItemController',
				controllerAs: 'vm',
				data: { activeTab: 'tests' }
			})
			.state('myResult', {
				url: '/tests/results/my/?{id}',
				templateUrl: 'test/resultsOne.html',
				controller: 'Test.OneResultController',
				controllerAs: 'vm',
				data: { activeTab: 'tests' }
			})
			.state('allResults', {
				url: '/tests/results/all/?{id}',
				templateUrl: 'test/resultsAll.html',
				controller: 'Test.AllResultsController',
				controllerAs: 'vm',
				data: { activeTab: 'tests' }
			})
			.state('edit', {
				url: '/tests/edit/?{id}',
				templateUrl: 'test/edit.html',
				controller: 'Test.EditController',
				controllerAs: 'vm',
				data: { activeTab: 'tests' }
			});
	}

	function run($http, $rootScope, $window) {
		// add JWT token as default auth header
		$http.defaults.headers.common.Authorization = 'Bearer ' + $window.jwtToken;
 
		// update active tab on state change
		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
			$rootScope.activeTab = toState.data.activeTab;
		});
	}
 
	// manually bootstrap angular after the JWT token is retrieved from the server
	$(function () {
		// get JWT token from server
		$.get('/app/token', function (token) {
			window.jwtToken = token;
 
			angular.bootstrap(document, ['app']);
		});
	});
    
	angular
		.module('app', ['ui.router', 'ngMaterial'])
		.config(config)
		.run(run);

})();