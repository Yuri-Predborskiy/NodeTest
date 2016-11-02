(function () {
    'use strict';
 
    function Controller($scope, UserService, TestService) {
        var vm = this;
        vm.user = null;
        vm.tests = null;
 
        function getAllTests() {
        	TestService.GetTests().then(function(tests) {
        		vm.tests = tests;
        	});
        }
        
        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            getAllTests();
        }
        
        initController();
    }

    angular
	    .module('app')
	    .controller('Home.IndexController', ['$scope', 'UserService', 'TestService', Controller]);
})();