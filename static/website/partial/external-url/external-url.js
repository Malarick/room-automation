angular.module('CWI').controller('ExternalUrlCtrl', function(
    $scope,
    $stateParams,
    $sce,
    mainService
){
    // Initialization
    mainService.setShowBackground(false);
    $scope.url = $sce.trustAsResourceUrl($stateParams.url);
    $scope.iFrameStyle = {
        width: "inherit",
        height: "inherit",
        border: "none",
        background: "white"
    };
    
    $scope.playSoundClick = function() {
        mainService.playSoundClick();
    };
});