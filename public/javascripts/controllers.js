// Controller for the poll list
function PollListCtrl($scope, Poll) {
	$scope.polls = Poll.query();
}

// Controller for an individual poll
function PollItemCtrl($scope, $routeParams, socket, Poll) {	
	$scope.poll = Poll.get({pollId: $routeParams.pollId});
	
	userChoices = [];
	
	$scope.selectChoice = function(event, index, question, choice) {
		markAnswer(event, index);
		var found = false;
		for(var i=0; i < userChoices.length; i++) {
			if(userChoices[i].questionId == question.id) {
				userChoices[i].answerId = choice.id;
				found = true;
				break;
			}
		}
		if(!found) {
			userChoices.push({
				questionId: question.id,
				answerId: choice.id
			});
		}
	}
	
	markAnswer = function(event, index) {
		$(event.currentTarget).siblings().removeClass("selected");
		$(event.currentTarget).addClass("selected");
	}
	
	/*
	$(".choice-selector label").on("click", function(event) {
		$(event.target).siblings().removeClass("selected");
		$(event.target).addClass("selected");
	});
	*/
	
	socket.on('myvote', function(data) {
		console.dir(data);
		if(data._id === $routeParams.pollId) {
			$scope.poll = data;
		}
	});
	
	socket.on('vote', function(data) {
		console.dir(data);
		if(data._id === $routeParams.pollId) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}		
	});
	
	$scope.vote = function() {
		var poll = $scope.poll;
		var pollId = poll._id;
		var choiceId = poll.userVote;
		
		if(choiceId) {
			var voteObj = { poll_id: pollId, choice: choiceId };
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};
	
	$scope.TMM = function() {
		console.log(userChoices);
		// alert with selected options
	}
}


// Controller for creating a new poll
function PollNewCtrl($scope, $location, Poll) {
	// Define an empty poll model object
	// a simple counter to get IDs for questions and answers
	var counter = function() {
		var cnt = (cnt == undefined) ? 0 : cnt;
		this.getNext = function() {
			return cnt++;
		}
	};

	// simple choice class - has ID and text field
	var Choice = function(id) {
		this.id = id;
		this.text = "";
	};

	// counter for questions
	var questionCounter = new counter();

	// default question class/object template
	var DefaultQuestion = function() {
		var choiceCounter = new counter();
		this.id = questionCounter.getNext();
		this.text = "";
		this.choices = [];
		this.correctChoice = -1;

		// method creates a new choice with unique ID within this question
		this.addChoice = function() {
			this.choices.push(new Choice(choiceCounter.getNext()));
		};
		
		// add two choices
		this.addChoice();
		this.addChoice();
	};

	$scope.poll = {
			name: "",
			questions: [new DefaultQuestion()],
			isTest: true
	};
	
	
	// Method to add an additional choice option
	$scope.addChoice = function(item) {
		item.addChoice();
	};
	
	// Method to set correct choice
	$scope.setCorrect = function(item, index) {
		item.correctChoice = index;
	}

	// Method to remove a choice from the array of choices
	$scope.removeChoice = function(item, index) {
		item.choices.splice(index, 1);
		if(item.correctChoice == index) {
			item.correctChoice = -1;
		}
	}
	
	// Method to add an additional question
	$scope.addQuestion = function() {
		$scope.poll.questions.push(new DefaultQuestion());
	};

	$scope.removeQuestion = function(index) {
		$scope.poll.questions.splice(index, 1);
	}
	
	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		var poll = $scope.poll;
		
		var cannotSaveText = "Cannot save " + ((poll.isTest) ? "test" : "poll") + ".";
		var choiceCount = 0;
		
		// validate questions
		for(var i = 0; i < poll.questions.length; i++) {
			var q = poll.questions[i];
			console.log("Question " + (i+1));
			console.log(q);
			// question has text?
			if(q.text.length == 0) {
				alert("Error! Question " + i + " has no text. " + cannotSaveText);
				return;
			}
			
			// at least 2 options?
			choiceCount = 0;
			for(var j = 0; j < q.choices.length; j++) {
				var choice = q.choices[j];
				if(choice.text.length > 0) {
					choiceCount++;
				}
			}
			if(choiceCount<2) {
				alert("Error! Question " + i + " needs at least 2 choices. " + cannotSaveText);
				return;
			}
			
			// correct answer selected? test only
			if(poll.isTest) {
				if(q.correctChoice == -1) {
					alert("Error! Question " + i + " has no correct answer. " + cannotSaveText);
					return;
				}
			} else {
				// this is not test - remove correct choice
				q.correctChoice = -1;
			}
		}
		
		// no errors detected - save
		var newPoll = new Poll(poll);
		
		// Call API to save poll to the database
		newPoll.$save(function(p, resp) {
			if(!p.error) {
				// If there is no error, redirect to the main view
				$location.path('polls');
			} else {
				alert('Could not create poll, ' + p.error);
			}
		});
	};
}