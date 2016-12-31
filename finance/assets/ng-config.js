angular.module("finance")

.constant("myapibox", {
		rooturl: "http://myapibox.herokuapp.com/api/finance/",
		conf : {
			headers : {
				// "Content-Type": "application/json;charset=utf-8"
                "Content-Type": "application/json"
			},
            data: "" // 이게 없으면 Content-Type이 설정되지 않음 //
		}
})

.config( function( $routeProvider ) { $routeProvider
	.when("/", {
		templateUrl : "views/main.html",
		controller : "mainCtrl"
	})
	.when("/apartment-price-index", {
        templateUrl : "views/apartmentPriceIndex.html",
		controller : "apartmentPriceIndexCtrl"
    })
    .when("/interest-spread", {
        templateUrl : "views/interestSpread.html",
		controller : "interestSpreadCtrl"
    })
	.when("/currency-exchange-rates", {
        templateUrl : "views/currencyExchangeRates.html",
		controller : "currencyExchangeRatesCtrl"
    })
    // .when("/red", {
    //     templateUrl : "red.htm"
    // })
	.otherwise({
    	redirectTo : '/interest-spread'
  });
});
