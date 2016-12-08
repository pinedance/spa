angular.module('dthree', [])
.factory('d3', ['$window', function($window) {
  return $window.d3; // assumes underscore has already been loaded on the page
}])


angular.module("finance", ["chart.js", "ngSanitize", "dthree"])

.constant("api", {
		rooturl: "http://myapibox.herokuapp.com/api/finance/",
		conf : {}
		}
)

.controller("interestSpreadCtrl", function ($scope, $http, api, d3) {

// Javascript 숫자에 천단위로 콤마(,) 찍기 thousands() 함수 추가 From prototype.js

	// $scope.linecolor = ["blue", "green", "red"]
	$scope.linecolor = [ '#803690', '#46BFBD', '#DCDCDC']
	$scope.longEnd = 5
	$scope.monthlength = 2

	$scope.updatelongEnd = function( end ){
		console.log(end)
		$scope.longEnd = end
		reBuild()
	}

	$scope.updatemonthlength = function(){
		reBuild()
	}

	var line = {}

	function fail(res){
		console.log( res.error )
	}

	line.success = function(res){

		var _data = res.data

		var it_long = _data.map(function(e){
			return e.long.interest
		})

		var it_short = _data.map(function(e){
			return e.short.interest
		})

		var it_diff = _data.map(function(e){
			return e.diff.toFixed(3)
		})

		var it_date = _data.map(function(e){
			return e.date
		})

		$scope.seriesMonthly = ['Long', 'Short', 'Diff'];
		$scope.dataMonthly = [it_long, it_short, it_diff]
		$scope.labelsMonthly = it_date

	}

	function urlLine( monthago ){
		return api.rooturl + "interest/spread/longshort" + "?long=" + $scope.longEnd + "&monthago=" + monthago
	}

	function reBuild(){
		$http.get(urlLine( $scope.monthlength ), api.conf).then( line.success, fail )
	}

	reBuild()

	$scope.onClick = function (points, evt) {
		// console.log(points, evt );
  	};



});
