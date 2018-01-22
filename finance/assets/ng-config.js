angular.module("finance")

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
    .when("/economy-leading-index", {
		templateUrl : "views/economyLeadingIndex.html",
		controller : "economyLeadingIndexCtrl"
    })
	.otherwise({
    	redirectTo : '/interest-spread'
  });
});
