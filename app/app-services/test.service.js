(function () {
	'use strict';
 
	function Service($http, $q) {
		var service = {};
		var testId = "";
 
		// private functions
		
		function handleSuccess(res) {
			return res.data;
		}
 
		function handleError(res) {
			return $q.reject(res.data);
		}
		
		function GetTests() {
			return $http.get('/api/tests/all').then(handleSuccess, handleError);
		}
 
		function GetTestById(testId) {
			var config = {
					'params': {
						'testId': testId
					}
			};
			return $http.get('/api/tests/test/', config).then(handleSuccess, handleError);
		}
		
		function GetTestForEditing(testId) {
			var config = {
					'params': {
						'testId': testId
					}
			};
			return $http.get('/api/tests/testEdit/', config).then(handleSuccess, handleError);
		}

		function SubmitTest(test, testId) {
			var testData = angular.toJson(test);
			return $http.post('/api/tests/edit/', { 'testId': testId, 'testData': testData }).then(handleSuccess, handleError);
		}
		
		function SubmitChoices(test, testId) {
			var testData = angular.toJson(test);
			return $http.post('/api/tests/results/submit/', { 'testId': testId, 'choices': testData }).then(handleSuccess, handleError);
		}
		
		function GetMyTestResult(testId) {
			var config = {
					'params': {
						'testId': testId
					}
			};
			return $http.get('/api/tests/results/my/', config).then(handleSuccess, handleError);
		}
		
		function GetAllTestResults(testId) {
			var config = {
					'params': {
						'testId': testId
					}
			};
			return $http.get('/api/tests/results/all/', config).then(handleSuccess, handleError);
		}
		
		function ArchiveResults(results) {
			return $http.post('/api/tests/results/setArchiveFlag/', { 'resultIds': angular.toJson(results), 'mode': true }).then(handleSuccess, handleError);
		}

		function UnarchiveResults(results) {
			return $http.post('/api/tests/results/setArchiveFlag/', { 'resultIds': angular.toJson(results), 'mode': false }).then(handleSuccess, handleError);
		}

		function DeleteResults(results) {
			return $http.post('/api/tests/results/delete/', { 'resultIds': angular.toJson(results) }).then(handleSuccess, handleError);
		}

		service.GetTests = GetTests;
		service.GetTestById = GetTestById;
		service.GetTestForEditing = GetTestForEditing;
		service.SubmitTest = SubmitTest;
		service.SubmitChoices = SubmitChoices;
		service.GetMyTestResult = GetMyTestResult;
		service.GetAllTestResults = GetAllTestResults;
		service.ArchiveResults = ArchiveResults;
		service.UnarchiveResults = UnarchiveResults;
		service.DeleteResults = DeleteResults;
 
		return service;
	}

	angular
		.module('app')
		.factory('TestService', Service);

})();