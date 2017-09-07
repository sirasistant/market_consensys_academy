var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', '$uibModal', 'notifications', function ($rootScope, $timeout, market, $uibModal, notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            hubInstance: "=hubInstance",
            shopInstances: "=shopInstances"
        },
        templateUrl: './toolbar/toolbar.html',
        link: function (scope, element, attrs) {

            var reloadPrivileges = async () => {
                scope.isSeller = (await Promise.all(scope.shopInstances.map(shop => shop.getSeller())))
                    .reduce((last, address) => { return last || (address == scope.account); }, false);
                scope.isOwner = await scope.hubInstance.owner() == scope.account;
                scope.$apply();
            }

            reloadPrivileges();
         
            scope.addProduct = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'addProduct',
                    resolve: {
                        shopInstances : ()=>scope.shopInstances,
                        account: ()=>scope.account,
                        hubInstance: ()=>scope.hubInstance
                    }
                });

                modalInstance.result.then(() => {
                }, () => { });
            };

            scope.setStock = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'setStock',
                    resolve: {
                        shopInstances : ()=>scope.shopInstances,
                        account: ()=>scope.account,
                        hubInstance: ()=>scope.hubInstance
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            };

            scope.kill = async () => {
                notifications.addTransactionNotification(await scope.instance.kill.sendTransaction({ from: scope.account }));
                alert("KILLED CONTRACT");
                scope.$apply();
            }

        }
    };
}];
