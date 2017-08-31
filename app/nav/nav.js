module.exports = ['$rootScope', '$timeout','$location', function ($rootScope, $timeout,$location) {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: './nav/nav.html',
        link: function (scope, element, attrs) {

            var routeChangeListener = $rootScope.$on('$routeChangeSuccess', function (event,route) {
                scope.currentPath = route.$$route.originalPath;
            });

            scope.navigate = function(path){
                $location.path(path).search({});
            }

            web3.eth.getAccountsPromise()
                .then(accounts => {
                    if (accounts.length == 0) {
                        scope.account = "NO ACCOUNT"
                    }
                    scope.account = accounts[0];
                    scope.$apply();
                })
                .catch(console.error);

            scope.$on("destroy", () => {
                routeChangeListener()
            });

        }
    };
}];
