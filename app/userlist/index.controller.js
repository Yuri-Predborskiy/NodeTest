(function () {
	'use strict';
 
	function Controller($scope, $state, UserService, $mdDialog) {
		var vm = this;
		vm.users = [];
 
		function getUsers() {
			// get a list of existing users
			UserService.GetAll().then(function (data) {
				if(data.error) {
					vm.error = true;
					if(data.errorDetails.errorCode === 401) {
						vm.message = "Только администраторы имеют доступ к данному разделу.";
					} else {
						vm.message = "Во время загрузки списка пользователей произошла ошибка. Попробуйте повторить попытку позднее.";
					}
					vm.users = [];
				} else {
					vm.users = data.users;
					vm.users.forEach(function(user) {
						user.selected = false;
						user.name = ((user.firstName) ? (user.firstName) : "") + 
								((user.lastName) ? (" " + user.lastName) : "") + 
								((user.middleName) ? (" " + user.middleName) : "");
					});
				}
			});
		}
		
		function initController() {
			getUsers();
		}
		
		$scope.selectAll = function () {
			if(vm.users.length > 0) {
				var newMode = true;
				if(vm.users[0].selected) {
					newMode = false;
				}
				vm.users.forEach(function(user) {
					user.selected = newMode;
				});
			}
		};
		
		initController();
		
		function getSelected() {
			var selected = [];
			vm.users.forEach(function(user) {
				if (user.selected) {
					selected.push(user._id);
				}
			});
			return selected;
		}
		
		$scope.activateSelected = function () {
			UserService.UpdateActiveState(getSelected(), true).then(function () {
				$state.reload();
			});
		};
		
		$scope.deactivateSelected = function () {
			UserService.UpdateActiveState(getSelected(), false).then(function () {
				$state.reload();
			});
		};
		
		$scope.addAdmin = function () {
			UserService.UpdateAdminStatus(getSelected(), true).then(function () {
				$state.reload();
			});
		};
		
		$scope.removeAdmin = function () {
			UserService.UpdateAdminStatus(getSelected(), false).then(function () {
				$state.reload();
			});
		};
		
		$scope.deleteSelected = function () {
			UserService.DeleteUsers(getSelected()).then(function() {
				$state.reload();
			});
		};
		
		
		$scope.customFullscreen = false;

		$scope.showPrompt = function(ev, user) {
			// Appending dialog to document.body to cover sidenav in docs app
			var confirm = $mdDialog.prompt()
				.title("Сброс пароля пользователя")
				.textContent('Введите новый пароль для пользователя ' + user.username)
				.placeholder('Пароль')
				.initialValue('')
				.targetEvent(ev)
				.ok('Сменить пароль!')
				.cancel('Отмена');
		
			$mdDialog.show(confirm).then(function(result) {
				if(!result || result.length < 8) {
					console.log("Rejected: password is too short");
				} else {
					console.log('Новый пароль пользователя ' + user._id + ': ' + result);
				}
			}, function() {
				console.log('Пароль не был изменен');
			});
		};
		
		function DialogController($scope, $mdDialog) {
			$scope.hide = function() {
				$mdDialog.hide();
			};
			
			$scope.cancel = function() {
				$mdDialog.cancel();
			};
			
			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};
		}
	}

	angular
		.module('app')
		.controller('Userlist.IndexController', ['$scope', '$state', 'UserService', '$mdDialog', Controller]);
})();