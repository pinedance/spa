// https://github.com/cejast/ng-youtube

var youtube = angular.module('youtube-embed', []);

youtube.directive('youtube', ['$window', function($window){

	return {
		restrict: 'E',
		template: '<div id="ytPlayer"></div>',
		link: function(scope, element, attrs){
            var _player = {name: "ytPlayer"}
            _player.opt = function(attrs){
                return {
                    height: attrs.height,
                    width: attrs.width,
                    videoId: attrs.id,
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError
                    }
                }
            }
            
            scope.ytPlayerData = scope.ytPlayerData || {}
            
            function onPlayerReady(event) {
                scope.$emit('onPlayerReady', {
                    target: event.target
                });
            }

            function onPlayerStateChange(event) {
                scope.$emit('onPlayerStateChange', {
                    playerState: event.target.getPlayerState()
                });
            }
            
            function onPlayerError(event){
                scope.$emit('onPlayerError', true);
            }
            
            $window.onYouTubePlayerAPIReady = function(){
                
                // 부모js에서 data를 준비한 후 'loadYT' event를 주변 로드된다. 
                scope.$on('loadYT', function(event, data){ if(data){
                    scope.ytPlayer = new YT.Player(_player.name, _player.opt(attrs));

                    scope.$watch(function(){return attrs.id;}, function(newId){
                        console.log("id changed : " + newId);
                        scope.ytPlayer = scope.createPlayer(attrs);
                    });

                    scope.createPlayer = function(attrs){
                        if(scope.ytPlayer) scope.ytPlayer.destroy();
                        return new YT.Player(_player.name, _player.opt(attrs));
                    }
                }})

            } // onYouTubePlayerAPIReady
            
            // scope : scope.ytPlayerData, scope.ytPlayer
		}
	};
}]);