(function(){
    
	var app = angular.module('gofangApp', ['firebase', 'ngTagsInput']);
	app.controller('FormulaCtrl', ['$scope', '$http', '$q', '$firebase', 'copyright', function($scope, $http, $q, $firebase, copyright) {
			
		////copyright
		$scope.copyrightYear = copyright.year(2015);

		//// firebase
		var ref = new Firebase("https://gofangapp.firebaseio.com/");
		var sync = $firebase(ref);
		var data = sync.$asObject();
	
		$scope.loadItems = function(query, mykey) {
			var deferred = $q.defer();
			var filtered = Object.keys( data[mykey] ).filter(function(s) { return s.indexOf(query) > -1; });
			deferred.resolve( filtered.map( function(item){ 
				var result = new Object;
				result[mykey] = item;
				return result;
			}) );
			return deferred.promise;
		};  // solution : http://stackoverflow.com/questions/23069562/autocomplete-using-ngtagsinput-cannot-read-property-then-of-undefined 
		
		$scope.find = function(){
			var tmp_in = $scope.inHerbs.map(function(item) { return item.herbs });
			var tmp_out = $scope.outHerbs.map(function(item) { return item.herbs });
			
			if ( (tmp_in.length + tmp_out.length)==0 ){
				$scope.results = [];
			} else {
				var handler = Object.keys(data.formulas);
			
				for (var i=0; i < tmp_in.length ; i++){ 
					if (data.herbs[tmp_in[i]]){
						handler = handler.intersection( data.herbs[tmp_in[i]].link );
					} else {
						continue;
					}
				}
				for (var j=0; j < tmp_out.length ; j++){
					if (data.herbs[tmp_out[j]]){
						handler = handler.diff( data.herbs[tmp_out[j]].link );
					} else {
						continue;
					}
				}

				$scope.results = handler;
			}
		};
		
		$scope.findHerbsymp = function(){
			var _output = $scope.inSymp.map(function(item) { return data.symptoms[item.symptoms] });
			var herbArr = _output.map(function(item){ return item.herbs })
			var _outHerbArr = herbArr[0]
			for (var j=0; j < herbArr.length ; j++){
				_outHerbArr = _outHerbArr.intersection(herbArr[j]);
			}
			$scope.symptoms = _output.map(function(item){ return item.org })
			$scope.herbssymptoms = _outHerbArr

		};

		$scope.addHerb = function(hb){
			var included = $scope.inHerbs.filter(function(herb){return herb.herbs == hb}) // 이미 있다면 넣지 않음 (ng-repeat 오류 회피)
			if (included.length > 0){ return }
			$scope.inHerbs.push( {herbs: hb} );
			$scope.find()
		};
		
		$scope.showDetail = function(formula){ 
			$scope.detail = data.formulas[formula];
			$scope.herbdetails = Object.keys(data.formulas[formula].ing);
			$scope.yack = "약징 내용";
		};
		
		$scope.showHerbDetail = function(h){
			$scope.yack = data.herbs[h].txYG;
		};
		
		$scope.resetForms = function(){
			delete $scope.inHerbs;
			delete $scope.outHerbs;
			delete $scope.results;
			
			delete $scope.detail;
			delete $scope.yack;
			delete $scope.herbdetails;
			
			delete $scope.inSymp;
			delete $scope.symptoms;
			delete $scope.herbssymptoms;
		};

	}]);
	
	app.service('copyright', function(){
		
		this.year = function(startYear){
			var thisYear = new Date().getFullYear();
			if (thisYear > startYear) { 
				return(startYear + '-' + thisYear);
			} else {
				return(thisYear);
			}
		};
		
	});
	
})();