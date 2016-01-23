var myapp = angular.module('Converter', []);

//////////////////////////////////////////////////////

myapp.value("values", {
    notices : {
        tsv2json: {
            input: "TSV data with header(1st line)",
            output: "JSON Result"
        },
        json2tsv: {
            input: "JSON",
            output: "TSV data with header(1st line)"
        },
    },
    menus : [
        { label: "TSV => JSON", order: "tsv2json" },
        { label: "JSON => TSV", order: "json2tsv" },
        { label: "TEST", order: "test" }
    ]
})

myapp.controller('mainCtrl', ['$scope', 'values', function ($scope, values) {

// init
    switchOrder( "tsv2json")
    
    $scope.switchOrder = switchOrder 
    $scope.menus = values.menus

// set function    
    function switchOrder( order ){
        $scope.order = order
        $scope.notice = values.notices[order]
    }
    
    function trim( str ){
        return str.trim()
    }
    
    // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    
    $scope.convert = function(){
        switch ( $scope.order ) {
            case 'tsv2json':
                var result = tsv2json($scope.input) 
                break;
            case 'json2tsv':
                var result = json2tsv($scope.input)
            default:
                // code
        }
        angular.element("#output").text( result )
    }
    
    var json2tsv = function( input ){
        var inJson = JSON.parse( input )
        var result = ""
        var header = []
        
        inJson.forEach(function(e){
            header = header.concat( Object.keys( e ) ).filter( onlyUnique )
        })
        
        result = result + header.join("\t") + "\n"
        
        var lineArr = inJson.map(function(e){
            var wordArr = []
            header.forEach(function(h){
                wordArr.push( e[h] )
            })
            return wordArr.join("\t")
        })
        
        result = result + lineArr.join("\n")
        
        return result
    }
    
    var tsv2json = function( input ){
        
        if(!input){ return "" }
        
        var tsvlines = input.split(/\r?\n/).filter(function( line ){ return line.search(/#/) !== 0 })
        console.log(tsvlines)
        var output = []
        var tsvHeader = tsvlines[0].split(/\t/).map( trim )
        var colLength = tsvHeader.length
        tsvlines.splice(0,1)
        var tsvBody = tsvlines
        console.log(tsvBody)
        tsvBody.forEach(function( line ){ 
            var words = line.split(/\t/).map( trim )
            var lineRst = {}
            for(var i=0; i<colLength; i++){
                lineRst[tsvHeader[i]] = words[i]
            }
            output.push( lineRst )
        })
        
        return JSON.stringify( output , null, '\t')
    }
}]);

