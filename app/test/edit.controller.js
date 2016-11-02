(function () {
	'use strict';
 
	function Controller($scope, $location, $window, TestService, UserService) {
		// initialize variables and methods
		var vm = this;
		var testId = $location.search().id;
		$scope.editExisting = true;
		
		
		function initTest() {
			vm.test = {};
			vm.test.name = "";
			vm.test.questions = [];
		}
		
		// choice object for use in questions
		var Choice = function() {
			this.text = "";
			this.correct = false;
		};
		
		// default question template, has no choices
		var DefaultQuestion = function() {
			this.text = "";
			this.choices = [];
			this.multipleChoices = false; // has more than 1 correct choice

			// method to add a choice
			this.addChoice = function() {
				this.choices.push(new Choice());
			};
		};

		function addQuestion() {
			var q = new DefaultQuestion();
			q.addChoice();
			q.addChoice();
			vm.test.questions.push(q);
		}
		
		function clearId() {
			testId = "new";
			vm.test._id = undefined;
			$scope.editExisting = false;
		}
		
		function clearTest() {
			clearId();
			initTest();
			addQuestion();
		}
		
		initTest();
		
		$scope.clear = function() {
			clearTest();
		};
		
		$scope.clearId = function() {
			clearId();
		};
		
		$scope.choiceToggle = function(choice) {
			choice.correct = !choice.correct;
		};
		
		function addChoice(question) {
			try {
				question.choices.push(new Choice());
			}
			catch (err) {
				console.log(err);
			}
		}

		// add a choice to question
		$scope.addChoice = function(question) {
			addChoice(question);
		};
		
		$scope.removeChoice = function(question, choice) {
			var index = question.choices.indexOf(choice);
			if (index > -1) {
				if(question.choices.length <= 2) {
					// question needs no less than 2 choices
					return;
				}
				question.choices.splice(index, 1);
			}
		};
		
		// add a new question to test
		$scope.addQuestion = function() {
			addQuestion();
		};
		
		// remove question from test
		$scope.removeQuestion = function(question) {
			if(vm.test.questions.length < 2) {
				// cannot remove the only question
				return;
			}
			var index = vm.test.questions.indexOf(question);
			if (index > -1) {
				vm.test.questions.splice(index, 1);
			}
		};

		// add IDs to questions and answers for easy reference
		function addIds(test) {
			var lq = test.questions.length;
			var lc;
			var qid = 0;
			var cid = 0;
			for (var i = 0; i < lq; i++) {
				test.questions[i].id = qid++;
				lc = test.questions[i].choices.length;
				for (var j = 0; j < lc; j ++) {
					test.questions[i].choices[j].id = cid++;
				}
			}
		}
		
		function showErrorMessage(reason, qin, cin) {
			console.log("Called reject");
			var err = "Error! ";
			var rej = "Cannot save test.";
			var noName = "Test has no name! ";
			var q = "Question " + (qin + 1) + " ";
			var c = "choice " + (cin + 1) + " ";
			var noText = "has no text! ";
			var noCorrect = "has no correct answer! ";
			var other = "An error has occurred. ";
			var text = "";
			
			switch(reason) {
			case "noTestName":
				text = err + noName + rej;
				break;
			case "noQuestionText":
				text = err + q + noText + rej;
				break;
			case "noChoiceText":
				text = err + q + c + noText + rej;
				break;
			case "noCorrectAnswers":
				text = err + q + noCorrect + rej;
				break;
			default:
				text = other + rej;
			}
			// TODO: replace alert with flash service message 
			$window.alert(text);
		}
		
		$scope.saveTest = function() {
			var qs = vm.test.questions;
			var qlen = qs.length;
			var cs, clen;
			
			vm.test.name = vm.test.name.trim();
			if(!vm.test.name) {
				// test has no name
				showErrorMessage("noTestName");
				return;
			}
			
			// verify questions
			for (var i = 0; i < qlen; i++) {
				qs[i].text = qs[i].text.trim();
				if (!qs[i].text) {
					showErrorMessage("noQuestionText", i);
					return;
				}
				cs = qs[i].choices;
				clen = cs.length;
				var correctCount = 0;
				// verify choices
				for (var j = 0; j < clen; j++) {
					cs[j].text = cs[j].text.trim();
					if(!cs[j].text) {
						showErrorMessage("noChoiceText", i, j);
						return;
					}
					if(cs[j].correct) {
						correctCount++;
					}
				}
				if (correctCount === 0) {
					showErrorMessage("noCorrectAnswers", i);
					return;
				}
				if (correctCount === 1) {
					qs[i].multipleChoices = false;
				} else {
					qs[i].multipleChoices = true;
				}
				correctCount = 0;
			}
			// if everything is OK - add IDs and save
			addIds(vm.test);
			
			// submit test to server
			TestService.SubmitTest(vm.test, testId).then(function(resp) {
				if(resp.err) {
					$window.alert("Error occurred while saving test! " + resp.err);
				} else {
					// redirect to list of tests
					$location.path('/tests/list');
				}
			});
		};
		
		function loadTestParameters(original) {
			vm.test = original;
			console.log("test data:");
			console.log(original);
			vm.oldName = vm.test.name;
			if(vm.test._author.firstName === null || vm.test._author.firstName === undefined) {
				vm.author = "Пользователь не найден";
			} else {
				vm.author = original._author.firstName + " " + 
					original._author.lastName + " " + 
					original._author.middleName;
			}
		}
		
		function newTest() {
			clearTest();
			vm.newTest = true;
			$scope.editExisting = false;
		}
		
		function getTest() {
			if (testId === 'new') {
				newTest();
			} else {
				// get test by ID
				$scope.editExisting = true;
				TestService.GetTestForEditing(testId).then(function(test) {
					loadTestParameters(test);
				});
			}
		}
		
		function initController() {
			getTest();
		}
		
		initController();
	}

	angular
		.module('app')
		.controller('Test.EditController', ['$scope', '$location', '$window', 'TestService', 'UserService', Controller]);
})();