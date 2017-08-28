var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', '$uibModal','notifications', function ($rootScope, $timeout, market, $uibModal,notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './toolbar/toolbar.html',
        link: function (scope, element, attrs) {

            var reloadPrivileges = async () => {
                try {
                    var instance = scope.instance;
                    var isAdmin, isSeller = false;
                    scope.isAdmin = await instance.isAdmin(scope.account);
                    scope.isSeller = await instance.isSeller(scope.account);
                    scope.isOwner = await instance.owner() == scope.account;
                    scope.$apply();
                } catch (error) {
                    console.log(error);
                }

            }

            reloadPrivileges();

            scope.openSellers = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'sellers',
                    resolve: {
                    }
                });

                modalInstance.result.then(() => {
                    reloadPrivileges();
                }, () => { });
            };

            scope.openAdmins = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'admins',
                    resolve: {
                    }
                });

                modalInstance.result.then(() => {
                    reloadPrivileges();
                }, () => { });
            }

            scope.addProduct = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'addProduct',
                    resolve: {
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
