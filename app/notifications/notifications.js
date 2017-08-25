var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'notifications', function ($rootScope, $timeout, notifications) {
    return {
        restrict: 'E',
        scope: {
            notifications:"=notifications"
        },
        templateUrl: './notifications/notifications.html',
        link: function (scope, element, attrs) {



            scope.$on("destroy", () => {

            })
            

            scope.dismiss = function (notification) {
                scope.notifications.splice(scope.notifications.indexOf(notification),1);
            }
        }
    };
}];
