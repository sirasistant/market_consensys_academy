var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market',function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './toolbar/addProduct/addProduct.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.instance;
            var account = scope.$root.account;

            scope.addProduct = ()=>{
                instance.addProduct(web3.toWei(scope.price,'ether'),scope.amount,web3.fromAscii(scope.name),{from:account,gas:200000}).then(()=>{
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }

        }
    };
}];
