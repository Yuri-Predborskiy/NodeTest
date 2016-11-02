(function () {
	'use strict';
 
	function Controller($scope, $state, $location, $window, TestService) {
		var vm = this;
		vm.test = null;
		var testId = $location.search().id;
		
		function getTest() {
			TestService.GetTestById(testId).then(function(test) {
				if(test.error && test.errorCode === 307) {
					$state.go('myResult', { id: testId }, { location: "replace" });
				} else if(!test.error) {
					vm.test = test;
					vm.loading = false;
				}
			});
		}
		
		function initController() {
			getTest();
		}
		
		function deselectChoices(question) {
			for (var i = 0; i < question.choices.length; i++) {
				question.choices[i].selected = false;
			}
		}
		
		$scope.choiceSelectToggle = function(question, choice) {
			if(question.multipleChoices) {
				choice.selected = !choice.selected;
			} else {
				deselectChoices(question);
				choice.selected = true;
			}
		};
		
		function rejectSave(reason, questionId) {
			switch(reason) {
			case "noSelection":
				$window.alert("You need to answer all questions to submit test.");
				break;
			default:
				break;
			}
		}
		
		$scope.saveUserChoices = function () {
			// check if every question has at least one selected choice
			var sel = 0;
			var qs = vm.test.questions;
			for (var i = 0; i < qs.length; i++) {
				var cs = qs[i].choices;
				for (var j = 0; j < cs.length; j++) {
					if(cs[j].selected) {
						sel++;
					}
				}
				if(sel === 0) {
					rejectSave("noSelection", qs[i]);
					return;
				}
				sel = 0;
			}
			// if yes, send result to server
			// if no, reject and stay on the same page
			TestService.SubmitChoices(vm.test, testId).then(function (resp) {
				if(resp.err) {
					$window.alert("An error occurred while processing results! " + resp.err);
				} else {
					if(resp.result === "success") {
						// redirect to result
						$state.go('myResult', { id: testId });
					}
				}
			});
		};
		
		initController();
	}

	angular
		.module('app')
		.controller('Test.ItemController', ['$scope', '$state', '$location', '$window', 'TestService', Controller]);
})();