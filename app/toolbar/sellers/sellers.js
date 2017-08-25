var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market',function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './toolbar/sellers/sellers.html',
        link: function (scope, element, attrs) {
            var instance =scope.$root.instance;
            var account = scope.$root.account;

            instance.getSellersCount()
            .then(count => {
                count = count.toNumber();
                var getSellersPromises = [];
                for (var i = 0; i < count; i++) {
                    getSellersPromises.push(instance.getSellerAt(i));
                }
                return Promise.all(getSellersPromises);
            }).then(sellers=>{
                scope.sellers = sellers;
                scope.$apply();
            })
            
            scope.createSeller=()=>{
                instance.addSeller(scope.newSeller,{from:account}).then(()=>{
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }

            scope.deleteSeller = (seller)=>{
                instance.deleteSeller(seller,{from:account}).then(()=>{
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }
        }
    };
}];
