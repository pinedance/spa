angular.module("finance")


.controller("mainCtrl", function($scope){

})

.controller("economyLeadingIndexCtrl", function($scope, $http, fApi, fDay, d3){

	function getApiPromises(){
		var apiQuery1 = fApi.ecos.new()
		apiQuery1.stat_code = "085Y026" // 15.1.4 경기종합지수(085Y026)
		apiQuery1.item_no = "I16A"	// > 선행종합지수(I16A)
		apiQuery1.end_no = 80
		apiQuery1.cycle_type = "MM"
		apiQuery1.start_date = fDay.yyyymmdd("", fDay.monthago( 60 ) ).slice(0,6)
		apiQuery1.end_date = fDay.yyyymmdd("", fDay.monthago( -1 ) ).slice(0,6)

		console.log( "called")

		return [
			$http.get( fApi.ecos.getQuery( apiQuery1 ), fApi.ecos.apiconf() )
		]

	}

	function callback_drawLineChar( _values ) {

		$scope.spin = false

		var values = [ _values[0].data ]

console.log( values)

		var it = values[0].StatisticSearch.row.map(function(e,i,arr){
			return e.DATA_VALUE
		})

		var it_date = values[0].StatisticSearch.row.map(function(e,i,arr){
			return e.TIME
		})

		console.log( it_date )

		$scope.seriesMonthly = ['경기종합지수(선행지수)']
		$scope.dataMonthly = [it]
		$scope.labelsMonthly = it_date

		$scope.$apply()

	}

	function callback_reject(err){
		$scope.spin = false
		$scope.$apply()
		if( confirm("Can not read data! Try again?") ){
			reBuild()
		} else {
			console.log(err) ; throw err
		}
	}

	function reBuild(){
		$scope.spin = true
		Promise.all( getApiPromises() ).then( callback_drawLineChar ).catch( callback_reject )
	}

	reBuild()

	$scope.onClick = function (points, evt) {
		console.log(points, evt );
  	};

})

.controller("apartmentPriceIndexCtrl", function($scope, $http, fApi, fDay, d3){

	$scope.locations = ["전국", "서울", "대전"]

	// $scope.linecolor = ["blue", "green", "red"]
	$scope.linecolor = [ '#803690', '#46BFBD', '#DCDCDC']
	$scope.longEnd = $scope.locations[1]

	$scope.updatelongEnd = function( end ){
		console.log(end)
		$scope.longEnd = end
		reBuild()
	}

	$scope.updatemonthlength = function(){
		reBuild()
	}

	function getApiPromises(){
		var apiQuery1 = fApi.ecos.new()
		var apiQuery2 = fApi.ecos.new()

		apiQuery1.stat_code = "085Y069" // 7.7.4 유형별 주택매매가격지수(085Y069)
		apiQuery2.stat_code = "085Y070"	// 7.7.5 유형별 주택전세가격지수(085Y070)

		apiQuery1.item_no = apiQuery2.item_no = "H69B" // 아파트(H69B)
		switch ( $scope.longEnd ) { //  전국(R70A) | 서울(R70F) | 대전(R70L)
			case "전국"	: apiQuery1.item_no1 = apiQuery2.item_no1 = "R70A" ; break;
			case "서울"	: apiQuery1.item_no1 = apiQuery2.item_no1 = "R70F" ; break;
			case "대전"	: apiQuery1.item_no1 = apiQuery2.item_no1 = "R70L" ; break;
			default	: apiQuery1.item_no2 = apiQuery2.item_no1 = "R70A" ; break;
		}
		apiQuery1.end_no = apiQuery2.end_no = 80
		apiQuery1.cycle_type = apiQuery2.cycle_type = "MM"
		apiQuery1.start_date = apiQuery2.start_date = fDay.yyyymmdd("", fDay.monthago( 60 ) ).slice(0,6)
		apiQuery1.end_date = apiQuery2.end_date = fDay.yyyymmdd("", fDay.monthago( -2 ) ).slice(0,6)

		console.log( "called")

		return [
			$http.get( fApi.ecos.getQuery( apiQuery1 ), fApi.ecos.apiconf() ),
			$http.get( fApi.ecos.getQuery( apiQuery2 ), fApi.ecos.apiconf() )
		]

	}

	function callback_drawLineChar( __values ) {

		$scope.spin = false

		var _values = [ __values[0].data, __values[1].data ]
		var size

		if( _values[0].StatisticSearch.list_total_count > _values[1].StatisticSearch.list_total_count ){
			size = _values[1].StatisticSearch.list_total_count
		} else {
			size = _values[0].StatisticSearch.list_total_count
		}

		var values = [ _values[0].StatisticSearch.row.slice(0, size), _values[1].StatisticSearch.row.slice(0,size) ]

		var it_long = values[0].map(function(e,i,arr){ return e.DATA_VALUE 	})

		var it_short = values[1].map(function(e,i,arr){ return e.DATA_VALUE })

		var it_date = values[0].map(function(e,i,arr){ return e.TIME })

		$scope.seriesMonthly = ['매매', '전세']
		$scope.dataMonthly = [it_long, it_short]
		$scope.labelsMonthly = it_date

		$scope.$apply()
	}

	function callback_reject(err){
		$scope.spin = false
		$scope.$apply()
		if( confirm("Can not read data! Try again?") ){
			reBuild()
		} else {
			console.log(err) ; throw err
		}
	}

	function reBuild(){
		$scope.spin = true
		Promise.all( getApiPromises() ).then( callback_drawLineChar ).catch( callback_reject )
	}

	reBuild()

	$scope.onClick = function (points, evt) {
		console.log(points, evt );
  	};


})

.controller("currencyExchangeRatesCtrl", function($scope, $http, fApi, fDay, d3){

	$scope.longEnd = 5
	$scope.monthlength = 3

	$scope.updatemonthlength = function(){
		reBuild()
	}

	function getApiPromises(){
		var apiQuery1 = fApi.ecos.new()
		apiQuery1.stat_code = "036Y001" // 주요국통화의 대원화 환율(036Y001)
		apiQuery1.item_no = "0000001"	// 원/미국달러(매매기준율)(0000001)
		apiQuery1.end_no = $scope.monthlength * 31
		apiQuery1.cycle_type = "DD"
		apiQuery1.start_date = fDay.yyyymmdd("", fDay.monthago( $scope.monthlength) ).slice(0,6)
		apiQuery1.end_date = fDay.yyyymmdd("", fDay.monthago( -1 ) ).slice(0,6)

		console.log( "called")

		return [
			$http.get( fApi.ecos.getQuery( apiQuery1 ), fApi.ecos.apiconf() )
		]

	}

	function callback_drawLineChar( _values ) {

		$scope.spin = false

		var values = [ _values[0].data ]

		var it = values[0].StatisticSearch.row.map(function(e,i,arr){
			return e.DATA_VALUE
		})

		var it_date = values[0].StatisticSearch.row.map(function(e,i,arr){
			return e.TIME
		})

		console.log( it_date )

		$scope.seriesMonthly = ['원/미국달러(매매기준율)']
		$scope.dataMonthly = [it]
		$scope.labelsMonthly = it_date

		$scope.$apply()

	}

	function callback_reject(err){
		$scope.spin = false
		$scope.$apply()
		if( confirm("Can not read data! Try again?") ){
			reBuild()
		} else {
			console.log(err) ; throw err
		}
	}

	function reBuild(){
		$scope.spin = true
		Promise.all( getApiPromises() ).then( callback_drawLineChar ).catch( callback_reject )
	}

	reBuild()

	$scope.onClick = function (points, evt) {
		console.log(points, evt );
  	};

})

.controller("interestSpreadCtrl", function ($scope, $http, fApi, fDay, d3) {

// Javascript 숫자에 천단위로 콤마(,) 찍기 thousands() 함수 추가 From prototype.js

	// $scope.linecolor = ["blue", "green", "red"]
	$scope.linecolor = [ '#803690', '#46BFBD', '#DCDCDC']
	$scope.longEnd = 5
	$scope.monthlength = 3

	$scope.updatelongEnd = function( end ){
		console.log(end)
		$scope.longEnd = end
		reBuild()
	}

	$scope.updatemonthlength = function(){
		reBuild()
	}

	function getApiPromises(){
		var apiQuery1 = fApi.ecos.new()
		var apiQuery2 = fApi.ecos.new()

		apiQuery1.stat_code = apiQuery2.stat_code = "060Y001" // 4.1.1 시장금리(일별)(060Y001)

		apiQuery1.item_no = ($scope.longEnd=="5")? "010200001" : "010200000"	// 국고채(5년)(010200001), 국고채(3년)(010200000)
		apiQuery2.item_no = "010101000" // 콜금리(익일물, 전체거래)(010101000)
		// apiQuery2.item_no = "010502000"	// CD(91일)(010502000)

		apiQuery1.end_no = apiQuery2.end_no = $scope.monthlength * 31
		apiQuery1.cycle_type = apiQuery2.cycle_type = "DD"
		apiQuery1.start_date = apiQuery2.start_date = fDay.yyyymmdd("", fDay.monthago( $scope.monthlength) ).slice(0,6)
		apiQuery1.end_date = apiQuery2.end_date = fDay.yyyymmdd("", fDay.monthago( -1 ) ).slice(0,6)

		console.log( "called")

		console.log( fApi.ecos.getQuery( apiQuery1 ) )
		console.log( fApi.ecos.getQuery( apiQuery2 ) )

		return [
			$http.get( fApi.ecos.getQuery( apiQuery1 ), fApi.ecos.apiconf() ),
			$http.get( fApi.ecos.getQuery( apiQuery2 ), fApi.ecos.apiconf() )
		]

	}

	function callback_drawLineChar( __values ) {

		$scope.spin = false

		var _values = [ __values[0].data, __values[1].data ]
		var size

		if( _values[0].StatisticSearch.list_total_count > _values[1].StatisticSearch.list_total_count ){
			size = _values[1].StatisticSearch.list_total_count
		} else {
			size = _values[0].StatisticSearch.list_total_count
		}

		var values = [ _values[0].StatisticSearch.row.slice(0, size), _values[1].StatisticSearch.row.slice(0,size) ]

		var it_long = values[0].map(function(e,i,arr){ return e.DATA_VALUE 	})

		var it_short = values[1].map(function(e,i,arr){ return e.DATA_VALUE })

		var it_date = values[0].map(function(e,i,arr){ return e.TIME })

		var it_diff = values[0].map(function(e,i,arr){
			return ( e.DATA_VALUE - values[1][i].DATA_VALUE ).toFixed(3)
		})

		console.log( it_long )
		console.log( it_short )
		console.log( it_diff )
		console.log( it_date )

		var longLegend = ($scope.longEnd==3)? "국채(3년)" : "국채(5년)"
		$scope.seriesMonthly = [longLegend, '콜금리', 'Diff']
		$scope.dataMonthly = [it_long, it_short, it_diff]
		$scope.labelsMonthly = it_date

		$scope.$apply()

	}

	function callback_reject(err){
		$scope.spin = false
		$scope.$apply()
		if( confirm("Can not read data! Try again?") ){
			reBuild()
		} else {
			console.log(err) ; throw err
		}
	}

	function reBuild(){
		$scope.spin = true
		Promise.all( getApiPromises() ).then( callback_drawLineChar ).catch( callback_reject )
	}

	reBuild()

	$scope.onClick = function (points, evt) {
		console.log(points, evt );
  	};



});
