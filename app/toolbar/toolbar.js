var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', '$uibModal', function ($rootScope, $timeout, market, $uibModal) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance:"=instance"
        },
        templateUrl: './toolbar/toolbar.html',
        link: function (scope, element, attrs) {

            var reloadPrivileges = function () {
                var instance = scope.instance;
                return Promise.all([instance.getAdminsCount(), instance.getSellersCount()])
                .then(counts => {
                    return Promise.all(counts.map((count, index) => {
                        var arr = [];
                        for (var i = 0; i < count.toNumber(); i++) {
                            arr.push(index == 0 ? instance.admins(i) : instance.sellers(i))
                        }
                        return Promise.all(arr);
                    }));
                }).then(privilegedAccounts => {
                    scope.isAdmin = privilegedAccounts[0].indexOf(scope.account) > -1;
                    scope.isSeller = privilegedAccounts[1].indexOf(scope.account) > -1;
                    return instance.owner();
                }).then(owner => {
                    scope.isOwner = scope.account == owner;
                    scope.$apply();
                }).catch(err => console.error(err));
            }

            reloadPrivileges();

            scope.openSellers = function () {
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
            
            scope.openAdmins = function(){
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

            scope.addProduct = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'addProduct',
                    resolve: {
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            };

            scope.setStock = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'setStock',
                    resolve: {
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            };

            scope.kill = function(){
                scope.instance.kill({from:scope.account}).then(()=>alert("KILLED CONTRACT"));
            }

        }
    };
}];
