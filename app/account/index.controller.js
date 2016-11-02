(function () {
	'use strict';
	
	function Controller($window, UserService, FlashService) {
		var vm = this;
		vm.user = null;
	
		function initController() {
			// get current user
			UserService.GetCurrent().then(function (user) {
				vm.user = user;
			});
		}
		
		function saveUser() {
			UserService.Update(vm.user)
				.then(function () {
					FlashService.Success('Данные обновлены');
				})
				.catch(function (error) {
					FlashService.Error(error);
				});
		}
		
		function deleteUser() {
			UserService.Delete(vm.user._id)
				.then(function () {
					// log user out
					$window.location = '/login';
				})
				.catch(function (error) {
					FlashService.Error(error);
				});
		}
		
		vm.saveUser = saveUser;
		vm.deleteUser = deleteUser;
		
		initController();
	}
	
	angular
		.module('app')
		.controller('Account.IndexController', Controller);

})();