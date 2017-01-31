angular.module("finance")

.factory("fDay", function(){
	var _day = {}
	_day.yyyymmdd = function(_sep, thatTime ) {
		var _now = thatTime || new Date()
	    var sep = _sep? _sep : ""
	    var yyyy = _now.getFullYear().toString()
	    var mm = ( _now.getMonth()+1 ).toString(); // getMonth() is zero-based
	    var dd  = _now.getDate().toString();

	    return [ yyyy, (mm[1]?mm:"0"+mm[0]), (dd[1]?dd:"0"+dd[0]) ].join(sep) ; // padding
	};

	_day.yymmdd = function(_sep, thatTime ) {
		var _now = thatTime || new Date()
	    var sep = _sep? _sep : ""
	    var yy = _now.getFullYear().toString().substr(2, 2)
	    var mm = ( _now.getMonth()+1 ).toString(); // getMonth() is zero-based
	    var dd  = _now.getDate().toString();

	    return [ yy, (mm[1]?mm:"0"+mm[0]), (dd[1]?dd:"0"+dd[0]) ].join(sep) ; // padding
	};


	_day.yyyymmdd_timestamp = function( unix_timestamp, _sep ){
		var sep = _sep? _sep : ""
		var _date = new Date( unix_timestamp )
	    var yy = _date.getFullYear().toString()
	    var mm = ( _date.getMonth()+1 ).toString(); // getMonth() is zero-based
	    var dd  = _date.getDate().toString();

	    return [ yy, (mm[1]?mm:"0"+mm[0]), (dd[1]?dd:"0"+dd[0]) ].join(sep) ; // padding
	}

	_day.monthago = function( monthlength ){
		var monthAgo = new Date();
		monthAgo.setMonth( monthAgo.getMonth() - monthlength );
		return monthAgo
	}

	return _day
})

.factory("fApi", function(){
	var _api = {}

	_api.ecos = {
		// 한국은행 경제통계 시스템
		// http://ecos.bok.or.kr/jsp/openapi/OpenApiController.jsp
		new : function(){
			return {
				base: "http://myapibox.herokuapp.com/api/finance/ecos?endpoint=",
				start_no: "1",
				end_no: "24",
			}
		},
		getQuery : function( q ){
			var rst = q.base
				+ q.start_no + "/"
				+ q.end_no + "/"
				+ q.stat_code + "/"
				+ q.cycle_type + "/"
				+ q.start_date + "/"
				+ q.end_date + "/"
				+ q.item_no
			if(q.item_no1){ rst = rst + "/" + q.item_no1 }
			if(q.item_no2){ rst = rst + "/" + q.item_no2 }
			if(q.item_no3){ rst = rst + "/" + q.item_no3 }
			return rst
		},
		apiconf: function(){
			return {
				headers : {
					"Content-Type": "application/json;charset=utf-8"
	                // "Content-Type": "application/json"
				},
	            data: "" // 이게 없으면 Content-Type이 설정되지 않음 //
			}
		}
	}

	return _api
})
