/*The flash message service is used to display success 
 * and error messages in the angular application. It 
 * uses the $rootScope to expose the flash message to 
 * the main index.html file (/app/index.html) where 
 * html is located for displaying the flash message.
*/

(function () {
	'use strict';
	
	function Service($rootScope) {
		var service = {};
		
		function initService() {
			// initialize method
			function clearFlashMessage() {
				var flash = $rootScope.flash;
				if (flash) {
					if (!flash.keepAfterLocationChange) {
						delete $rootScope.flash;
					} else {
						// only keep for a single location change
						flash.keepAfterLocationChange = false;
					}
				}
			}
			
			// execute after all initializations
			$rootScope.$on('$locationChangeStart', function() {
				clearFlashMessage();
			});
		}
			
		function Success(message, keepAfterLocationChange) {
			$rootScope.flash = {
					message: message,
					type: 'success',
					keepAfterLocationChange: keepAfterLocationChange
			};
		}
		
		function Error(message, keepAfterLocationChange) {
			$rootScope.flash = {
					message: message,
					type: 'danger',
					keepAfterLocationChange: keepAfterLocationChange
			};
		}
		
		service.Success = Success;
		service.Error = Error;
		
		initService();
		return service;
	}
	
	angular
		.module('app')
		.factory('FlashService', Service);
	
})();