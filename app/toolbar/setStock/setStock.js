var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {

        },
        templateUrl: './toolbar/setStock/setStock.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.instance;
            var account = scope.$root.account;
            scope.search = { seller: account };

            async function reloadProducts() {
                scope.products = await market.getProducts(instance)
                scope.$apply();
            };

            reloadProducts();

            scope.setStock = async () => {
                var hash = await instance.setProductStock.sendTransaction(scope.product.id, scope.product.amount, { from: account });
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
