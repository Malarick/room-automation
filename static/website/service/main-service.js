angular.module('CWI').factory('mainService',function(
    $http,
    $q,
    growl
) {
    var navigationCallback = null;
    var navigationWithParamsCallback = null;
    var connectionStateCallback = null;
    var comfortEventNotifierCallback = null;
    var notifierConnectionCallback = null;
    var showBackgroundCallback = null;
    var soundClickCallback = null;
    var taskNotificationCallback = null;
    var transformRequestObjectUrlEncodedFunction = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += transformRequestObjectUrlEncodedFunction(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += transformRequestObjectUrlEncodedFunction(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    var mainService = {
        setNavigationCallback: function(callback) {
            navigationCallback = callback;
        },
        navigate: function(state) {
            if (typeof navigationCallback === 'function') {
                navigationCallback(state);
            }
        },
        setNavigationWithParamsCallback: function(callback) {
            navigationWithParamsCallback = callback;
        },
        navigateWithParams: function(state, params) {
            if (typeof navigationWithParamsCallback === 'function') {
                navigationWithParamsCallback(state, params);
            }
        },
        setConnectionStateCallback: function(callback) {
            connectionStateCallback = callback;
        },
        setConnectionState: function(state) {
            if (typeof connectionStateCallback === 'function') {
                connectionStateCallback(state);
            }
        },
        setComfortEventNotifierCallback: function(callback) {
            comfortEventNotifierCallback = callback;
        },
        notifyComfortEvent: function(data) {
            if(typeof comfortEventNotifierCallback === "function") {
                comfortEventNotifierCallback(data);
            }
        },
        setNotifierConnectionCallback: function(callback) {
            notifierConnectionCallback = callback;
        },
        notifyIssue: function(data) {
            if(typeof notifierConnectionCallback === "function") {
                notifierConnectionCallback(data);
            }
        },
        setShowBackgroundCallback: function(callback) {
            showBackgroundCallback = callback;
        },
        setShowBackground: function(state) {
            if (typeof showBackgroundCallback === 'function') {
                showBackgroundCallback(state);
            }
        },
        setSoundClickCallback: function(callback) {
            soundClickCallback = callback;
        },
        playSoundClick: function() {
            if(typeof soundClickCallback === "function") {
                soundClickCallback();
            }
        },
        setTaskNotificationCallback: function(callback) {
            taskNotificationCallback = callback;
        },
        setTaskNotification: function(outstandingTask) {
            if(typeof taskNotificationCallback === "function") {
                taskNotificationCallback(outstandingTask);
            }
        },
        sendCommand: function(command) {
            $http({
                method: 'GET',
                url: '/sendCommand/' + command
            }).success(function(response) {
                return true;
            }).error(function(response) {
                growl.error("Unable to connect to the server.");
                return false;
            });
        },
        transformRequestObjectUrlEncoded: function(obj) {
            transformRequestObjectUrlEncodedFunction(obj);
        },
        transformRequestObject: function(obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        appendTransform: function(defaults, transform) {
            // We can't guarantee that the default transformation is an array
            defaults = angular.isArray(defaults) ? defaults : [defaults];

            // Append the new transformation to the defaults
            return defaults.concat(transform);
        },
        findIndexByKeyValue: function(arraytosearch, key, valuetosearch) { 
            for (var i = 0; i < arraytosearch.length; i++) {             
                if (arraytosearch[i][key] == valuetosearch) {
                    return i;
                }
            }
            return -1;
        },
        kalmanFilter: function(models) {
            var deferred = $q.defer();

            return $http({
                method: "POST",
                url: "/kalmanFilter",
                data: angular.toJson(models),
                transformRequest: function(obj) {
                    return obj;
                }
            }).then(function onSuccess(response) {
                deferred.resolve(response);
                return deferred.promise;
            }, function onError(response) {
                deferred.reject(false);
                return deferred.promise;
            });
        }
    };

    return mainService;
});