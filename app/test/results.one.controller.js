(function () {
	'use strict';
 
	function Controller($scope, $location, TestService) {
		var vm = this;
		vm.test = null;
		var testId = $location.search().id;
		
		function getTestResults() {
			TestService.GetMyTestResult(testId).then(function(data) {
				vm.test = data;
/*
				console.log("received results from server:");
				console.log(data);
*/
				if(data.error === "noResults") {
					vm.test.noResults = true;
					vm.test.message = "Вы еще не проходили этот тест.";
					vm.test.testId = data.testId;
				}
				if(vm.test.questionsTotal > 0) {
					vm.test.score = vm.test.correctAnswers / vm.test.questionsTotal * 100;
				} else {
					vm.test.score = "Во время загрузки результатов произошла ошибка.";
				}
			});
		}
		
		function initController() {
			getTestResults();
		}
		
		initController();
	}

	angular
		.module('app')
		.controller('Test.OneResultController', ['$scope', '$location', 'TestService', Controller]);
})();