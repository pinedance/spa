angular.module('dthree', [])
.factory('d3', ['$window', function($window) {
  return $window.d3; // assumes underscore has already been loaded on the page
}])


angular.module("DBStatus", ["chart.js", "ngSanitize", "dthree"])

.constant("api", {
		rooturl: "https://mediclassics.kr/api/statistics/",
		conf : {
			headers : {
				'Authorization': "b0a200dc25e74531b8cae037427d1578",
				'Content-Type': "application/json;charset=utf-8"
			}
		}
	}
)

.controller("ChartCtrl", function ($scope, $http, api, d3) {

// Javascript 숫자에 천단위로 콤마(,) 찍기 thousands() 함수 추가 From prototype.js

	console.log(new Date())

	function get_date(point, enddate){
		var today = new Date()
		var mm = today.getMonth();  
		var yyyy = today.getFullYear();
		var dd = today.getDate();
		
		if(point==="start"){
			// 1년 전 오늘 
			today.setYear( yyyy - 1 ) 
			yyyy = today.getFullYear();  // mm은 그대로
			dd = 1;   // 1일 부터
		} else {
			if(enddate==="lastMonth"){ 
				// 전 달의 마지막 날
				today.setDate( 0 ); 
			} 
			yyyy = today.getFullYear();
			mm = today.getMonth(); 
			dd = today.getDate()
		}
		
		mm = mm + 1  // 1월이 0, 2월이 1 ... 
		if(dd<10) {dd='0'+dd} ; if(mm<10) {mm='0'+mm} 
		var _date = yyyy + "" + mm + "" +dd
		console.log( point + " : " + _date )
		return _date
	}
	
	var line = {}

	function fail(res){
		console.log( res.error )
	}
	
	line.success = function(res){
		
		var _visitors = res.data.DATA

		var not_zero_ix = _visitors
			.reduce(function(r, e) {
				var a = e.visitor_count
				r.push((r.length && r[r.length - 1] || 0) + a); return r;
			}, [])
			.map(function(e,i,arr){ return (e===0)? 0 : 1})
			.indexOf(1)
		
		var not_zero_days = _visitors.length - not_zero_ix
		
		var levels = []; var datas = []
		
		var visitors = _visitors.slice(not_zero_ix).map(function(e, i, arr){
			var _date = e.date.split("-")
			var _level = _date[0] + "-" + _date[1]
			if ( levels.indexOf( _level ) < 0 ){ levels.push( _level ) }
			return { level: _level, day: _date[1]+'-'+_date[2], value: e.visitor_count }
		})

		visitors.forEach(function(e, i, arr){
			var ix = levels.indexOf( e.level )
			datas[ix] = datas[ix] || 0
			datas[ix] = datas[ix] + e.value
		})
		
		// console.log(visitors);console.log(levels); console.log(datas)
		
		$scope.seriesMonthly = ['Visitors'];
		$scope.labelsMonthly = levels
		$scope.dataMonthly = [datas]
		$scope.yearly = {
			total: res.data.TOTAL.thousands(),
			meanbymonth: parseInt( res.data.TOTAL / datas.length ).thousands(),
			meanbyday: parseInt( res.data.TOTAL / not_zero_days ).thousands(),
		}
		
		var dailyVis = (visitors.length > 30)? visitors.slice(visitors.length - 30) : visitors
		var dataDaily = dailyVis.map(function(e,i,arr){ return e.value })
		
		$scope.seriesDaily = ['Visitors'];
		$scope.labelsDaily = dailyVis.map(function(e,i,arr){ return e.day })
		$scope.dataDaily = [ dataDaily ]
		var dailytotal = dataDaily.reduce(function(pre, crr, ix, arr) {
  			return pre + crr;
		})

		$scope.monthly = {
			total: dailytotal.thousands(),
			meanbyday: parseInt(dailytotal / dataDaily.length ).thousands()
		}

	}

	var doughnut = {}

	doughnut.success = function(res){
		var _data = res.data.DATA.sort(function(a, b){return b.count-a.count });
		
		$scope.count = {
			books: _data.length,
			chrs: res.data.TOTAL.thousands()
		}
		
		$scope.labelsChrCount = _data.map(function(e,i,arr){
			return e.book_nm_kor
		})
		
		$scope.dataChrCount = _data.map(function(e,i,arr){
			return e.count
		})
		
		return _data
	}
	
	function urlLine(){
		return api.rooturl + "visitor-count" + "?start-date=" + get_date("start", $scope.enddate) + "&end-date=" + get_date("end", $scope.enddate)  // 1년 전부터 지난달 말일까지
	}
	
	function urlDoughnut(){
		return api.rooturl + "character-count"
	}

	var draw = {}
	
	draw.books = function(res){
		
		doughnut.success(res);
		wordcloud.successs(res);
		
	}
	
	// ds-wordcloud
	
	var wordcloud = {}
	
	wordcloud.size = [960,600]
	wordcloud.fontFamily = "Jeju Hallasan"
	wordcloud.fill = d3.scale.category20();
	
	wordcloud.draw = function(words) {
	  d3.select("#word-cloud").append("svg")
	    .attr("width", wordcloud.size[0]).attr("height",	wordcloud.size[1])
	    .style("margin-left", "auto").style("margin-right", "auto").style("display", "block")
	    .append("g").attr("transform", "translate(" + wordcloud.size[0] / 2 + "," + wordcloud.size[1] / 2 + ")")
	    // .attr("transform", "translate(600,400)")
	    .selectAll("text")
	    .data(words)
	    .enter().append("text")
	    .style("font-size", function(d) { return d.size + "px"; })
	    .style("font-family", wordcloud.fontFamily)
	    .style("fill", function(d, i) { return wordcloud.fill(i); })
	    .attr("text-anchor", "middle")
	    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
	    .text(function(d) { return d.text; });
	}
	
	wordcloud.successs = function( data ){
		var mywords = data.map(function(e) {
		    return {
		      text: e.book_nm_kor,
		      size: e.count
		    };
		})
		
		console.log(mywords)
		
		d3.layout.cloud().size( wordcloud.size )
		  .words( mywords )
		  .padding(5)
		  .text( function(d) { return d.text; } )
		  //.rotate(function() { return (~~(Math.random() * 6) - 3) * 30; })
		  .rotate(function() { return ~~(Math.random() * 2) * 90; })
		  //.fontSize(function(d) { return Math.log(d.size) * 5; }) // 10-60
		  .fontSize(function(d) { return Math.sqrt( Math.sqrt(d.size) ) * 2.2 })
		  .font( wordcloud.fontFamily )
		  .spiral("archimedean")
		  .on("end", wordcloud.draw)
		  .start();
	}

	$http.get(urlLine(), api.conf).then( line.success, fail )
	$http.get(urlDoughnut(), api.conf).then( doughnut.success, fail ).then(	wordcloud.successs, fail )
	// $http.get(urlDoughnut(), api.conf).then( draw.books, fail )

	$scope.reBuild = function(){
		$http.get(urlLine(), api.conf).then( line.success, fail )
	}

	$scope.dnChart = function(chartId){
		var image = document.getElementById(chartId).toDataURL();
		var a = angular.element("<a>");
	    a.attr('href', image ).attr("download", chartId).appendTo("body");
	    a[0].click();
	    a.remove();
	    console.log("Downloaded")
	}
	
	$scope.onClick = function (points, evt) {
		// console.log(points, evt );
  	};



	// var mywords = [".NET", "Silverlight", "jQuery", "CSS3", "HTML5", "JavaScript", "SQL", "C#"]
  	
});
