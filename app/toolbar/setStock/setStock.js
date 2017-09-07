var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {

        },
        templateUrl: './toolbar/setStock/setStock.html',
        link: function (scope, element, attrs) {
            var shopInstances = scope.$parent.$resolve.shopInstances;
            var hubInstance = scope.$parent.$resolve.hubInstance;
            var account = scope.$parent.$resolve.account;

            async function reloadProducts() {
                scope.products = await market.getProductsWithTokens(shopInstances, hubInstance, account);
                scope.$apply();
            }

            reloadProducts();

            scope.setStock = async (product) => {
                var hash = await scope.product.shop.setProductStock.sendTransaction(scope.product.id, scope.product.amount, { from: account });
                notifications.addTransactionNotification(hash);
                scope.$parent.$uibModalInstance.close();
                $rootScope.$apply();
            }

            scope.cancel = () => {
                scope.$parent.$uibModalInstance.dismiss();
            }

        }
    };
}];
