var underscore = angular.module('underscore', []);
	underscore.factory('_', function($window) {
		return $window._; // assumes underscore has already been loaded on the page
});  
// http://blog.mohammedlakkadshaw.com/AngularJS_Underscore_ultimate_web_development.html#.VWWhgkas9b8