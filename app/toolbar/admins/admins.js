var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market',function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './toolbar/admins/admins.html',
        link: function (scope, element, attrs) {
            var instance =scope.$root.instance;
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
                instance.addAdmin(scope.newAdmin,{from:account}).then((receipt)=>{
                    console.log(receipt);
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }

            scope.deleteAdmin = (admin)=>{
                instance.deleteAdmin(admin,{from:account}).then(()=>{
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }
            
        }
    };
}];
