var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

var app = angular.module('ahp', ['underscore', 'googlechart']);

app.controller('ahpCtrl', ["$scope", "_", function($scope, _) {

  var myCris, myAlts //myCriterias, myAlternatives
  var pairsCris, pairsAlts // pairs
  var createJugementSpace = function(x){
    return {'pair': x, 'moreImpFact': "", 'lessImpFact': "", 'intensity': 0, 'rationale': "", 'judgementMessage': "  "}
  }  // more inportant factor
  var randomConsistencyIndex = [0,0,0,0.58,0.9,1.12,1.24,1.32,1.41,1.45,1.49]
  $scope.intensitys = [1,3,5,7,9]
  $scope.myGoal = "점심에 뭘 먹을까?"//"Choose the best car for the family"
  $scope.myCris = "맛,값,거리"//"Cost, Safety, Style" // "Cost, Safety, Style, Capacity"
  $scope.myAlts = "짜장면,국밥,돈까스,백반"//"Accord Sedan, Pilot SUV, CR-V SUV, Odyssey Minivan" // "Accord Sedan, Accord Hybrid Sedan, Pilot SUV, CR-V SUV, Element SUV, Odyssey Minivan"

  $scope.creatWorkSheet = function(){
    console.log( $scope.myGoal )
    myCris = _.uniq( _.compact( $scope.myCris.split(/\s*,\s*/) ) )
    myAlts = _.uniq( _.compact( $scope.myAlts.split(/\s*,\s*/) ) )
    console.log(myCris)
    // criterias
    pairsCris = selectPair( myCris )  // create pairs for Pairwise comparing, Array
    $scope.jgmCris = _.map(pairsCris, createJugementSpace ) // create judgement space, Array

    // alternatives
    pairsAlts = selectPair( myAlts )  // create pairs for Pairwise comparing
    $scope.jgmAlts = _.map(myCris, function(c){
      return {'cri': c, 'alts': _.map(pairsAlts, createJugementSpace ) }
    })

    console.log($scope.jgmAlts)
    $scope.cris = myCris
    $scope.showCriWorkSheet = true
    $scope.showAltWorkSheet = true
    $scope.currentPage = 1
  }

  function selectPair(arr){
    if(arr.length < 3 ){ return [arr] }
    var first = _.first(arr)
    var rest = _.rest(arr)
    var newElem = _.map(rest, function(x){
      return [first].concat(x)
    })
    var rst = newElem.concat( selectPair( rest ) )
          console.log( rst )
    return rst
  }

  $scope.judgeFactor = function( factor, myMoreImpFact, myLessImpFact ){
    factor.moreImpFact = myMoreImpFact
    factor.lessImpFact = myLessImpFact
    createJudgementMessage( factor )
  } //( cri, cri.pair[1] )

  $scope.judgeIntens = function( factor, myIntensity ){
    factor.intensity = myIntensity
    createJudgementMessage( factor )
  }

  // $scope.judgeAlts = function( pix, ix, myMoreImpFact, myLessImpFact ){
  //   var factor = $scope.jgmAlts[pix].alts[ix]
  //   factor.moreImpFact = myMoreImpFact
  //   factor.lessImpFact = myLessImpFact
  //   createJudgementMessage( factor )
  // }
  //
  // $scope.judgeAltsIntens = function( pix, ix, myIntensity ){
  //   var factor = $scope.jgmAlts[pix].alts[ix]
  //   factor.intensity = myIntensity
  //   createJudgementMessage( factor )
  // }

  function createJudgementMessage( cri ){
    if( cri.moreImpFact === "" || cri.intensity === 0 ){ return }
    cri.judgementMessage = "'" + cri.moreImpFact + "' is more important criterias than '" + cri.lessImpFact + "' " + cri.intensity + " times"
  }

  $scope.setCurrentPage = function(direction) {
    if(direction==="prev"){
      $scope.currentPage = ($scope.currentPage > 1)? $scope.currentPage - 1 : myCris.length
    } else if(direction==="next"){
      $scope.currentPage = ($scope.currentPage < myCris.length)? $scope.currentPage + 1 : 1
    } else {
      $scope.currentPage = direction
    }
    console.log ('currentPage'); console.log( $scope.currentPage)
  }

  // n x m 행렬 만들고, 1 채워 넣기
  // function createMatix(xLength, yLength, defaultValue){
  //   (innerArr = []).length = yLength; innerArr.fill( defaultValue );
  //   (outterArr = []).length = xLength; outterArr.fill( _.clone(innerArr) );
  //   return outterArr
  // } // 이상동작 // https://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array

  function createMatix(xLength, yLength, defaultValue){
    var outterArr = new Array( xLength );
    for (var i=0; i<xLength; i++) {
      var innerArr = new Array(yLength);
      for (var j=0; j<yLength; j++) { innerArr[j] = defaultValue }
      outterArr[i] = innerArr
    }
    return outterArr
  }

  function productArrays(arr1, arr2){
    var sum = 0;
    for(var i=0; i<arr1.length; i++) { sum += arr1[i] * arr2[i];  }
    return sum
  }

  function multiplyMatrix( matrix1, matrix2 ){
    var zipMatrix2 = _.unzip(matrix2)
    var x = matrix1.length
    var y = zipMatrix2.length
    var rst = createMatix(x,y,0)
    for(var i=0;i<x;i++){
      for(var j=0;j<y;j++){
        rst[i][j] = productArrays( matrix1[i], zipMatrix2[j] )
      }
    }
    return rst
  }

  function rowSum(matrix){
    return _.map(matrix, function(innerArr, ix, outterArr){
      return _.reduce(innerArr, function(sum, num){ return sum + num; }, 0);
    })
  }

  function colSum(matrix){
    var tMx = _.unzip(matrix)
    return rowSum(tMx)
  }

  function lowdown(arr){  // 합계가 1이 되게 비율을 낮춤
    var sum = _.reduce(arr, function(sum, num){ return sum + num; }, 0);
    return _.map(arr, function(e,i,arr){ return e / sum})
  }

  function getJudgementMx(factor, judgementData){
    var tmpMx = createMatix(factor.length, factor.length, 1)

    _.each(judgementData, function(e, i, arr) {
      var outterIx = factor.indexOf( e.pair[0] )
      var innerIx = factor.indexOf( e.pair[1] )
      if( e.pair.indexOf( e.moreImpFact ) === 0){
        tmpMx[outterIx][innerIx] = e.intensity
        tmpMx[innerIx][outterIx] = 1 / e.intensity
      } else {
        tmpMx[outterIx][innerIx] = 1 / e.intensity
        tmpMx[innerIx][outterIx] = e.intensity
      }
    })
    return tmpMx
  }

  function calculatePV(factor, judgementData){ // priority vector
    var tmpMx = getJudgementMx(factor, judgementData)
    var productedMx = multiplyMatrix(tmpMx, tmpMx)
    var rst = lowdown( rowSum(productedMx) )
    return _.zip(factor, rst)
  }

  function calculateLambdaMax(factor, judgementData){
    var tmpMx = getJudgementMx(factor, judgementData)
    var productedMx = multiplyMatrix(tmpMx, tmpMx)
    var rst = lowdown( rowSum(productedMx) )
    var colsumArr = colSum(productedMx)
    console.log(productedMx);console.log(rst);console.log(colsumArr)
    return productArrays(rst, colsumArr)
  }

  function calculateIdn(factor, judgementData){  // Consistency Index
    var n = factor.length
    var lambdaMax = calculateLambdaMax(factor, judgementData)
    var ci = ( lambdaMax - n ) / (n - 1)
    var cr = ci / randomConsistencyIndex[n]
    return { "lambdaMax": lambdaMax, "ci": ci, "cr": cr }
  }

  $scope.reportCris = function(){
      // calculate criterias
      var globalCris = calculatePV(myCris, $scope.jgmCris)
      var globalCrisIdx = calculateIdn(myCris, $scope.jgmCris)
      console.log( globalCris); console.log( globalCrisIdx)

      // report message
      var tmpmsg = ( globalCrisIdx.cr <= 10)? "일관된 기준을 가지셨군요!!!" : "마음을 정리하고 다시 해보시는게 좋겠어요"
      tmpmsg = tmpmsg + " (CR: " + globalCrisIdx.cr.toFixed(2) + " %)"
      $scope.crisMsg = globalCrisIdx.message = createMsg(globalCrisIdx.cr)

      // report pie chart
      // var pieData = _.zip(myCris, globalCris.map(function(e,i,arr){return (e * 100).toFixed(2) } ) )
      $scope.crisPieChart = createPieChart(['Component', '중요도'], globalCris);
      $scope.globalCris = globalCris
  }

  $scope.reportAlts = function(){
      // alternatives
      var localAlts = []
      for(var i=0;i<$scope.jgmAlts.length;i++){
        localAlts[i] = {
          pv: calculatePV(myAlts, $scope.jgmAlts[i].alts),
          idx: calculateIdn(myAlts, $scope.jgmAlts[i].alts)
        }
        localAlts[i].msg = createMsg( localAlts[i].idx.cr),
        localAlts[i].pieChart = createPieChart(['Component', '중요도'], localAlts[i].pv )

      }
      // console.log (localAlts)

      var tmplocalAlts = _.map( localAlts, function(e){ return _.unzip( e.pv)[1] })
      var tmpglobalAlts = _.unzip(tmplocalAlts )
      var tmpglobalCris = _.unzip($scope.globalCris)[1]
      var globalAlts = _.map( tmpglobalAlts, function(e){
          return productArrays( tmpglobalCris, e)
      })
      var globalAlts = _.zip(myAlts, globalAlts)
      console.log( tmplocalAlts )
      console.log( tmpglobalAlts )
      console.log( tmpglobalCris )
      console.log( globalAlts )

      $scope.localAlts = localAlts
      $scope.globalAltsPieChart = createPieChart(['Component', '중요도'], globalAlts )
  }

  function createMsg(cr){
    var tmpmsg = ( cr <= 10)? "일관된 기준을 가지셨군요!!!" : "마음을 정리하고 다시 해보시는게 좋겠어요"
    tmpmsg += " (CR: " + cr.toFixed(2) + " %)"
    return tmpmsg
  }

  function createPieChart(label, data){ // http://plnkr.co/edit/E4iPtQ?p=preview
      var chart1 = {};
      chart1.type = "PieChart";
      chart1.data = [label].concat(data);

      chart1.options = {
          displayExactValues: true,
          width: 400,
          height: 200,
          is3D: false,
          chartArea: {left:10,top:10,bottom:0,height:"100%"}
      };

      chart1.formatters = {
        number : [{
          columnNum: 1,
          pattern: "#,##0.00 %"
        }]
      };
      console.log(chart1)
      return chart1;
  }

}]);
