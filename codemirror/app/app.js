var app = angular.module('editors', ['ui.codemirror']);

app.controller("editorsCtrl", ["$scope", "$http", function($scope, $http){

    $scope.editorOpts = {
        theme: "3024-night",     // require theme pastel-on-dark.css
        placeholder:"input here",    // require addon placeholder.js
        styleActiveLine: true,       // require addon active-line.js
        autoCloseBrackets: true,     // require addon closebrackets.js
        showTrailingSpace: true,     // require addon showTrailingSpace.js, css .cm-trailingspace
        mode: "simplemode",          // require mode simplemode.js
        lineWrapping : true, 
        lineNumbers: true,
//      readOnly: 'nocursor',
        tabSize: 4,
        indentUnit: 4,
        value: ""
    };  
    
    $scope.editorOnload = function(_editor){
            console.log("codemirror loaded")
            console.log("current mode: " + _editor.getMode().name);
            // Editor part
            _editor.setSize("100%", "720px") //(width: "100%", height: "100%" )
            
            $scope.doc = _editor.getDoc();

            // Options
//          _editor.setOption('mode', "javascript"); 
            _editor.focus();
            $scope.doc.markClean()
            
            // Events
            _editor.on("beforeChange", function(){
                console.log("stay"); 
            });
        
            _editor.on("change", function(){
//                $scope.$apply(function(){
//                    $scope.docValue = $scope.doc.getValue();
//                })
            });
    }
    
    $http.get("sampletext.txt").success(function(data, status, headers, config){
            $scope.doc.setValue(data);
    });
    
}]);