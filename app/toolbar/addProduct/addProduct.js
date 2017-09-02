var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {

        },
        templateUrl: './toolbar/addProduct/addProduct.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.marketInstance;
            var account = scope.$root.account;

            market.getAllowedTokens(instance, account).then(tokens => {
                scope.tokens = tokens;
                scope.$apply();
            });

            scope.addProduct = () => {
                instance.addProduct.sendTransaction(scope.token ? scope.price*(Math.pow(10,scope.token.decimalUnits)) : web3.toWei(scope.price, 'ether'), scope.amount, web3.fromAscii(scope.name), scope.token ? scope.token.address : "", { from: account }).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    scope.$parent.$uibModalInstance.close();
                    $rootScope.$apply();
                }).catch(err => console.error(err));
            }

            scope.cancel = () => {
                scope.$parent.$uibModalInstance.dismiss();
            }

        }
    };
}];
