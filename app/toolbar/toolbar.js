var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', '$uibModal', function ($rootScope, $timeout, market, $uibModal) {
    return {
        restrict: 'E',
        scope: {
            account: "=account"
        },
        templateUrl: './toolbar/toolbar.html',
        link: function (scope, element, attrs) {

            var reloadPrivileges = function () {
                var instance;
                market.getContract().deployed().then(_instance => {
                    instance = _instance;
                    return Promise.all([instance.getAdminsCount(), instance.getSellersCount()]);
                }).then(counts => {
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
                }, () => {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            };

        }
    };
}];
