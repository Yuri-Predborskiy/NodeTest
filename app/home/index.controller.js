(function () {
    'use strict';
 
    function Controller(UserService) {
        var vm = this;
        vm.user = null;
 
        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
        
        function getUsers() {
        	// get a list of existing users
        	UserService.GetAll().then(function (users) {
        		vm.users = users;
        	});
        }
        
        initController();
        getUsers();
    }

    angular
	    .module('app')
	    .controller('Home.IndexController', Controller);
})();