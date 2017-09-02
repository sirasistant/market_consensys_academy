var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {

        },
        templateUrl: './tokenToolbar/addToken/addToken.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.marketInstance;
            var account = scope.$root.account;

            scope.addToken = async () => {
                try {
                    //Ensure that it looks like a ERC20 token
                    var tokenInstance = await $rootScope.ERC20.at(scope.tokenAddress);
                    await tokenInstance.name();
                    await tokenInstance.totalSupply();
                    await tokenInstance.balanceOf(account);
                    await tokenInstance.decimals();
                    await tokenInstance.symbol();
                    //Ok, let's do this
                    var hash = await instance.addAllowedToken.sendTransaction(scope.tokenAddress, { from: account, gas: 300000 });
                    notifications.addTransactionNotification(hash);
                    scope.$parent.$uibModalInstance.close();
                    $rootScope.$apply();
                }
                catch (error) {
                    alert("Address is not a ERC20 compatible token");
                }
            }

            scope.cancel = () => {
                scope.$parent.$uibModalInstance.dismiss();
            }

        }
    };
}];
