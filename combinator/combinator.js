var myapp = angular.module('myapp', []);

//////////////////////////////////////////////////////

myapp.controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
    
    $scope.info = {};
    var data = {};

    (function loadDupCode(){
        $http.get('http://mytoolbox.herokuapp.com/showdict/duplicatedCode').
              success(function(dt, status, headers, config) {
                console.log("load Success!");
                data.dupCode = eval(dt);
              }).
              error(function(dt, status, headers, config) {
                console.log("load fail!");
              });
    })();
    
    (function loadPronounceSet(){
        $http.get('https://rawgit.com/pinedance/pinedance.github.io/master/spa/publicAsset/data/chrCode/chrLibPronounceSet.json').
              success(function(dt, status, headers, config) {
                console.log("load Success!");
                var tmp = JSON.parse( JSON.stringify(dt).replaceChr(data.dupCode) ); // 이중코드 병합 require exString, underscore.js
                data.pronounceSet = _.each(tmp, function(val, key){ tmp[key] = eval(val); })
              }).
              error(function(dt, status, headers, config) {
                console.log("load fail!");
              });
    }());
    
    function replaceChr(chrSets, myText){
        _.each( chrSets, function(elem){
            myText = myText.gsub( elem[0], elem[1] )     
        })    
        return myText;
    } // ref : replacer
    
    function allPossibleCases(arr) {
        if (arr.length == 1) { return arr[0]; }
        var result = [];
        var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
        for (var i = 0; i < allCasesOfRest.length; i++) {
          for (var j = 0; j < arr[0].length; j++) {
            result.push(arr[0][j] + allCasesOfRest[i]);
          }
        }
        return result;
    } // http://stackoverflow.com/questions/4331092/finding-all-combinations-of-javascript-array-values
    
    $scope.combinate = function(){
        
        data.clearWords = $scope.rawWords.replaceChr(data.dupCode);  // 이중코드 병합 require exString, underscore.js
        data.myWords = _.compact( data.clearWords.split(/\s+/) );
        
        data.ourWords = _.map(data.myWords, function(word){ 
            var eachChrs = word.split("");
            return _.map(eachChrs, function(chr){
                return data.pronounceSet[chr] || [chr];
            })
        });
        
        data.combinated = _.map(data.ourWords, function(word){
            return allPossibleCases(word);        
        })
        
        data.result = _.map( _.zip(data.myWords, data.combinated), function(item){
            return item.join("\t");
        })
        
        $scope.combinatedWords = data.result.join("\n");
    }

    $scope.init = function(){
        delete $scope.rawWords;
        delete $scope.combinatedWords;
        delete data;
    }
                        
}]);

