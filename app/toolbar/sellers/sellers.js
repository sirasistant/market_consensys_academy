var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {

        },
        templateUrl: './toolbar/sellers/sellers.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.marketInstance;
            var account = scope.$root.account;

            async function reload() {
                var count = await instance.getSellersCount();
                count = count.toNumber();
                scope.sellers = [];
                for (var i = 0; i < count; i++) {
                    scope.sellers.push(await instance.getSellerAt(i));
                }
                scope.$apply();
            }

            reload();

            scope.createSeller = async () => {
                var hash = await instance.addSeller.sendTransaction(scope.newSeller, { from: account });
                notifications.addTransactionNotification(hash);
                scope.$parent.$uibModalInstance.close();
                $rootScope.$apply();
            }

            scope.deleteSeller = async (seller) => {
                var hash = await instance.deleteSeller.sendTransaction(seller, { from: account });
                notifications.addTransactionNotification(hash);
                scope.$parent.$uibModalInstance.close();
                $rootScope.$apply();
            }
        }
    };
}];
