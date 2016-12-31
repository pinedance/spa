angular.module('dthree', [])
.factory('d3', ['$window', function($window) {
  return $window.d3; // assumes underscore has already been loaded on the page
}])

angular.module("finance", ["chart.js", "dthree", 'ngRoute'])
