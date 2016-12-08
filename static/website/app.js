angular.module('CWI', [
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'btford.socket-io',
    'angular-growl',
    'toggle-switch',
    'ui.bootstrap-slider',
    'angularRipple',
    'chart.js',
    'ui.select',
    'ngSanitize',
    'ngCookies'
])
    .constant('SERVER_HOST', 'http://119.73.206.46:4188')    // JTS
    // .constant('SERVER_HOST', 'http://192.168.88.110:9999')           // JTS
    .constant('SERVER_HOST_2', 'http://119.73.206.45:3001')     // EMOS
    // .constant('SERVER_HOST_2', 'http://localhost:9999')      // EMOS
    .constant('SOUND_CLICK', 'resources/sounds/click.mp3')
    .constant('DEFAULT_STATE', 'login-user')
    .constant('ADMIN_STATE', 'administrator')
    .constant('WALL_STATE', 'wall-switch')
    .constant('WALL_STATE_2', 'wall-switch-by-device')
    .constant('CONNECTION_STATE_EVENT', 'connectionStateReport')
    .constant('CIRCUIT_NOTIFIER_EVENT', 'circuitNotifierReport')
    .constant('FLAG_STATUS_EVENT', 'flagStatusReport')
    .constant('FLAG_EVENT_REPORT_EVENT', 'flagEventReport')
    .constant('COUNTER_EVENT', 'counterReport')
    .constant('SENSOR_EVENT', 'sensorReport');

angular.module('CWI').config(function($stateProvider, $urlRouterProvider, DEFAULT_STATE, ADMIN_STATE) {
	var checkStatus = function($q, mainService, authenticationService){
		var deferred = $q.defer();
		
		authenticationService.getAuthenticationState().then(function(response) {
            deferred.resolve();
            if(typeof response.data.userStatus === "undefined" 
                || !response.data.userStatus.isLoggedIn 
                && !response.data.userStatus.isWallSwitch 
                && !response.data.userStatus.isWallSwitchByDevice) {
                mainService.navigate(DEFAULT_STATE);
            }
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });
        
	};
	
    var checkStatusForLogin = function ($q, mainService, authenticationService) {
        var deferred = $q.defer();
		
        authenticationService.getAuthenticationState().then(function(response){
			deferred.resolve();
			if(typeof response.data.userStatus !== "undefined" 
                && (response.data.userStatus.isLoggedIn && response.data.userStatus.isAdmin)){
				mainService.navigate(ADMIN_STATE);
			}
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });     
        
    };
	
    var checkStatusForAdministrator = function ($q, mainService, authenticationService) {
        var deferred = $q.defer();
        authenticationService.getAuthenticationState().then(function(response) {
            if(typeof response.data.userStatus === "undefined" 
                || (!response.data.userStatus.isLoggedIn && !response.data.userStatus.isAdmin)) {
                deferred.reject();
                mainService.navigate(DEFAULT_STATE);
            }
            deferred.resolve();
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });
    };

    var checkStatusForWallSwitch = function ($q, mainService, authenticationService) {
        var deferred = $q.defer();
        var userStatus = {
            isLoggedIn: false,
            isAdmin: false,
            isWallSwitch: true,     
            isWallSwitchByDevice: false
        };

        authenticationService.setAuthenticationState(userStatus, null).then(function(response) {
            deferred.resolve();
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });
        
    };

    var checkStatusForWallSwitch2 = function ($q, mainService, authenticationService) {
        var deferred = $q.defer();
        var userStatus = {
            isLoggedIn: false,
            isAdmin: false,
            isWallSwitch: false,
            isWallSwitchByDevice: true
        };

        authenticationService.setAuthenticationState(userStatus, null).then(function(response) {
            deferred.resolve();
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });
        
    };	

    var checkStatusForLocationPassword = function ($q, mainService, authenticationService) {
        var deferred = $q.defer();
        
        authenticationService.getAuthenticationState().then(function(response) {
            if(typeof response.data.userStatus === "undefined" 
                || (!response.data.userStatus.isWallSwitch && !response.data.userStatus.isWallSwitchByDevice)) {                
                deferred.reject();
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }, function(error) {
            deferred.reject();
            return deferred.promise;
        });
        
    };

    $stateProvider.state('wall-switch', {
        url: '/wall-switch/:locationId',
        templateUrl: 'partial/wall-switch/wall-switch.html',
        controller: 'WallSwitchCtrl',
        resolve: {
            init: checkStatusForWallSwitch
        }
    });    
    $stateProvider.state('wall-switch-by-device', {
        url: '/wall-switch-by-device/:deviceId',
        templateUrl: 'partial/wall-switch/wall-switch.html',
        controller: 'WallSwitchByDeviceCtrl',
        resolve: {
            init: checkStatusForWallSwitch2
        }
    });
    $stateProvider.state('location-password', {
        url: '/location-password',
        params: {locationIdJts: null, locationIdEmos: null},
        templateUrl: 'partial/location-password/location-password.html',
        resolve: {
            init: checkStatusForLocationPassword
        }
    });
    $stateProvider.state('login-user', {
        url: '/login-user',
        templateUrl: 'partial/login-user/login-user.html'
    });
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'partial/login/login.html',
        resolve: {
            init: checkStatusForLogin
        }
    });
    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'partial/home/home.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('light', {
        url: '/light',
        templateUrl: 'partial/light/light.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('entrance-light', {
        url: '/entrance-light',
        templateUrl: 'partial/entrance-light/entrance-light.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('air-conditioner', {
        url: '/air-conditioner',
        templateUrl: 'partial/air-conditioner/air-conditioner.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('fan', {
        url: '/fan',
        templateUrl: 'partial/fan/fan.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('television', {
        url: '/television',
        templateUrl: 'partial/television/television.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('curtain', {
        url: '/curtain',
        templateUrl: 'partial/curtain/curtain.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('projector', {
        url: '/projector',
        templateUrl: 'partial/projector/projector.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('in-room-service', {
        url: '/in-room-service',
        templateUrl: 'partial/in-room-service/in-room-service.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('external-url', {
        url: '/external-url',
        templateUrl: 'partial/external-url/external-url.html',
        params: {url: null},
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('event', {
        url: '/event/:id',
        templateUrl: 'partial/event/event.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('administrator', {
        url: '/administrator/:menuId?',
        templateUrl: 'partial/administrator/administrator.html',
		resolve: {
			init: checkStatusForAdministrator
		}
    });
    $stateProvider.state('administrator.outstanding-issue', {
        url: '/outstanding-issue',
        templateUrl: 'partial/outstanding-issue/outstanding-issue.html',
        resolve: {
            init: checkStatus
        }
    });
    $stateProvider.state('guest-menu', {
        url: '/guest-menu/:menuId?',
        templateUrl: 'partial/guest-menu/guest-menu.html',
        resolve: {
            init: checkStatus
        }
    });
    $stateProvider.state('administrator.jts-report', {
        url: '/jtsReport',
        templateUrl: 'partial/jts-report/jts-report.html',
        resolve: {
            init: checkStatus
        }
    });
	$stateProvider.state('feedback', {
        url: '/feedback',
        templateUrl: 'partial/feedback/feedback.html',
		resolve: {
			init: checkStatus
		}
    });
    $stateProvider.state('administrator.employee-dashboard', {
        url: '/employee-dashboard',
        templateUrl: 'partial/employee-dashboard/employee-dashboard.html',
        resolve: {
            init: checkStatus
        }
    });
    $stateProvider.state('administrator.group-monitor', {
        url: '/group-monitor',
        templateUrl: 'partial/group-monitor/group-monitor.html',
        resolve: {
            init: checkStatus
        }
    });
    $stateProvider.state('administrator.feedback-report', {
        url: '/feedback-report',
        templateUrl: 'partial/feedback-report/feedback-report.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/' + DEFAULT_STATE);
});

angular.module('CWI').config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('top-center');
    growlProvider.globalTimeToLive({success: 2000, error: 2000, warning: 2000, info: 3000});
    growlProvider.globalDisableCountDown(true);
}]);

angular.module('CWI').config(function(ChartJsProvider) {
    ChartJsProvider.setOptions({ 
        colors : ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
        animation: false
    });
});

angular.module('CWI').run(function($rootScope) {
    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
});
