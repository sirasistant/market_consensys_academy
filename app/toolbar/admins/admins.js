var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market','notifications', function ($rootScope, $timeout, market,notifications) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './toolbar/admins/admins.html',
        link: function (scope, element, attrs) {
            var instance =scope.$root.marketInstance;
            var account = scope.$root.account;

            instance.getAdminsCount()
            .then(count => {
                count = count.toNumber();
                var getAdminsPromises = [];
                for (var i = 0; i < count; i++) {
                    getAdminsPromises.push(instance.getAdminAt(i));
                }
                return Promise.all(getAdminsPromises);
            }).then(admins=>{
                scope.admins = admins;
                scope.$apply();
            })
            
            scope.createAdmin=()=>{
                instance.addAdmin.sendTransaction(scope.newAdmin,{from:account}).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    scope.$parent.$uibModalInstance.close();
                    $rootScope.$apply();
                }).catch(err => console.error(err));
            }

            scope.deleteAdmin = (admin)=>{
                instance.deleteAdmin.sendTransaction(admin,{from:account}).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    scope.$parent.$uibModalInstance.close();
                    $rootScope.$apply();
                }).catch(err => console.error(err));
            }
            
        }
    };
}];
