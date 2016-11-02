(function () {
    'use strict';
 
    function Controller($scope, TestService) {
        var vm = this;
        vm.tests = null;
 
        function getAllTests() {
        	TestService.GetTests().then(function(tests) {
        		vm.tests = tests;
        	});
        }
        
        function initController() {
        	getAllTests();
        }
        
        initController();
    	
    	
    }

    angular
	    .module('app')
	    .controller('Test.IndexController', ['$scope', 'TestService', Controller]);
})();