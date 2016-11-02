(function () {
	'use strict';
 
	function Service($http, $q) {
	var service = {};

		// private functions

		function handleSuccess(res) {
			return res.data;
		}
 
		function handleError(res) {
			return $q.reject(res.data);
		}

		function GetCurrent() {
			return $http.get('/api/users/current').then(handleSuccess, handleError);
		}
 
		function GetAll() {
			return $http.get('/api/users/all').then(handleSuccess, handleError);
		}
		
		function GetById(_id) {
			return $http.get('/api/users/user/' + _id).then(handleSuccess, handleError);
		}
 
		function GetByUsername(username) {
			return $http.get('/api/users/' + username).then(handleSuccess, handleError);
		}
 
		function Create(user) {
			return $http.post('/api/users', user).then(handleSuccess, handleError);
		}
 
		function Update(user) {
			return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
		}
 
		function Delete(_id) {
			return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
		}
		
		function UpdateAdminStatus(users, mode) {
			return $http.post('/api/users/updateAdminStatus', { ids: users, mode: mode }).then(handleSuccess, handleError);
		}
 
		function UpdateActiveState(users, mode) {
			return $http.post('/api/users/updateActiveState', { ids: users, mode: mode }).then(handleSuccess, handleError);
		}
		
		service.GetCurrent = GetCurrent;
		service.GetAll = GetAll;
		service.GetById = GetById;
		service.GetByUsername = GetByUsername;
		service.Create = Create;
		service.Update = Update;
		service.Delete = Delete;
		service.UpdateAdminStatus = UpdateAdminStatus;
		service.UpdateActiveState = UpdateActiveState;
 
		return service;
	}

	angular
		.module('app')
		.factory('UserService', Service);

})();