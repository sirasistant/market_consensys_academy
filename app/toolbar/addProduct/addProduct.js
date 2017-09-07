var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: './toolbar/addProduct/addProduct.html',
        link: function (scope, element, attrs) {
            var shopInstances = scope.$parent.$resolve.shopInstances;
            var hubInstance = scope.$parent.$resolve.hubInstance;
            var account = scope.$parent.$resolve.account;

            market.getAllowedTokens(hubInstance, account).then(tokens => {
                scope.tokens = tokens;
                scope.$apply();
            });

            scope.addProduct = async () => {
                var sellers = await Promise.all(shopInstances.map(shop => shop.getSeller()));
                var shop = shopInstances[sellers.indexOf(account)];
                shop.addProduct.sendTransaction(
                    scope.token ? scope.price * (Math.pow(10, scope.token.decimalUnits)) : web3.toWei(scope.price, 'ether'),
                    scope.amount,
                    web3.fromAscii(scope.name),
                    scope.token ? scope.token.address : "0x0",
                    { from: account }).then((hash) => {
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
