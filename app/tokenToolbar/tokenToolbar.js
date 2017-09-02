var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', '$uibModal','notifications', function ($rootScope, $timeout, market, $uibModal,notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './tokenToolbar/tokenToolbar.html',
        link: function (scope, element, attrs) {

            var reloadPrivileges = async () => {
                try {
                    var instance = scope.instance;
                    scope.isAdmin = await instance.isAdmin(scope.account);
                    scope.$apply();
                } catch (error) {
                    console.log(error);
                }

            }

            reloadPrivileges();

            scope.addToken = () => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'addToken',
                    resolve: {
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            };

        }
    };
}];
