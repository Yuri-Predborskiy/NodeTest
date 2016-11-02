(function () {
	'use strict';
 
	function Controller($scope, $state, $location, $window, TestService) {
		var vm = this;
		vm.resuts = {};
		var testId = $location.search().id;
		var selectedResults = [];
		
		vm.sortType = "answerDate";
		vm.sortReverse = false;
		
		function saveNames() {
			for (var i = 0; i < vm.results.length; i++) {
				var res = vm.results[i].details._user;
				if(res === undefined || res === null) {
					vm.results[i].userName = "Пользователь удален";
					continue;
				}
				vm.results[i].userName = ((res.firstName) ? (res.firstName) : "") + 
					((res.lastName) ? (" " + res.lastName) : "") + 
					((res.middleName) ? (" " + res.middleName) : "");

			}
		}
		
		function getTestResults() {
			TestService.GetAllTestResults(testId).then(function(data) {
				if (data.error === "noResults") {
					console.log("error! " + data.error);
					vm.results = [{}];
					vm.testDetails = data.testDetails;
					vm.error = true;
					vm.errorMessage = "Текущий тест не имеет результатов. Пройти тест можно по ссылке:";
					vm.testLink = $location.absUrl().replace("results/all", "test");
					return;
				} else {
					vm.results = data.testResults;
					vm.testId = data.testId;
					vm.testDetails = data.testDetails;
					saveNames();
				}
			});
		}
		
		function initController() {
			getTestResults();
		}
		
		initController();
		
		function selectResult(id, forceOn) {
			var index = $.inArray(id, selectedResults);
			if(forceOn === undefined) {
				if(index === -1) {
					selectedResults.push(id);
				} else {
					selectedResults.splice(index, 1);
				}
			} else {
				if(forceOn) {
					if(index === -1) {
						selectedResults.push(id);
					}
				} else {
					selectedResults = [];
				}
			}
		}
		$scope.selectResult = selectResult;
		
		$scope.selectAllResults = function () {
			var mode = false;
			if($.inArray(vm.results[0].details._id, selectedResults) === -1) {
				mode = true;
			}
			
			for(var i = 0; i < vm.results.length; i++) {
				selectResult(vm.results[i].details._id, mode);
			}
		};
		
		$scope.resultSelected = function (id) {
			if($.inArray(id, selectedResults) >= 0) {
				return(true);
			}
			return(false);
		};
		
		$scope.archiveSelected = function () {
			if(selectedResults.length > 0) {
				TestService.ArchiveResults(selectedResults).then(function(data) {
					if(data.errorCode === 401) {
						$window.alert("Ошибка! У Вас нет доступа к редактированию результатов тестирования!");
					} else {
						$state.reload();
					}
				});
			} else {
				$window.alert("Не выбраны результаты!");
			}
		};
		
		$scope.unarchiveSelected = function () {
			if(selectedResults.length > 0) {
				TestService.UnarchiveResults(selectedResults).then(function(data) {
					if(data.errorCode === 401) {
						$window.alert("Ошибка! У Вас нет доступа к редактированию результатов тестирования!");
					} else {
						$state.reload();
					}
				});
			} else {
				$window.alert("Не выбраны результаты!");
			}
		};
		
		$scope.deleteSelected = function () {
			if(selectedResults.length > 0) {
				TestService.DeleteResults(selectedResults).then(function(data) {
					if(data.errorCode === 401) {
						$window.alert("Ошибка! У Вас нет доступа к редактированию результатов тестирования!");
					} else {
						$state.reload();
					}
				});
			} else {
				$window.alert("Не выбраны результаты!");
			}
		};
	}
	
	angular
		.module('app')
		.controller('Test.AllResultsController', ['$scope', '$state', '$location', '$window', 'TestService', Controller]);
})();