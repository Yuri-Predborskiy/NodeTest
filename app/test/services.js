// Angular service module for connecting to JSON APIs
angular.module('testServices', ['ngResource'])
	.factory('Test', function($resource) {
		return $resource('tests/:testId', {}, {
			// Use this method for getting a list of polls
			query: { method: 'GET', params: { testId: 'all' }, isArray: true }
		});
	});