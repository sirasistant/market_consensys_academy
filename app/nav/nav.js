module.exports = ['$rootScope', '$timeout',function ($rootScope, $timeout) {
    return {
        restrict: 'E',
        scope: {
           instance:"=instance"
        },
        templateUrl: './nav/nav.html',
        link: function (scope, element, attrs) {

            web3.eth.getAccountsPromise()
                .then(accounts => {
                    if (accounts.length == 0) {
                        scope.account = "NO ACCOUNT"
                    }
                    scope.account = accounts[0];
                    scope.$apply();
                })
                .catch(console.error);

        }
    };
}];
