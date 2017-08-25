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
                var isAdmin,isSeller= false;
                return instance.isAdmin(scope.account)
                .then(_isAdmin=>{
                    isAdmin = _isAdmin;
                    return instance.isSeller(scope.account);
                })
                .then(_isSeller => {
                    isSeller = _isSeller;
                    return instance.owner();
                }).then(owner => {
                    scope.isOwner = scope.account == owner;
                    scope.isAdmin = isAdmin;
                    scope.isSeller = isSeller;
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
