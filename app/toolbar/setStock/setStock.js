var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market',function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './toolbar/setStock/setStock.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.instance;
            var account = scope.$root.account;
            scope.search = {seller:account};

            function reloadProducts() {
                market.getProducts(instance).then(products => {
                    scope.products = products;
                    scope.$apply();
                })
            };

            reloadProducts();

            scope.setStock = ()=>{
                instance.setProductStock(scope.products.indexOf(scope.product),scope.product.amount,{from:account}).then(()=>{
                    scope.$parent.$uibModalInstance.close();
                }).catch((err)=>console.error(err));
            }

            scope.cancel = ()=>{
                scope.$parent.$uibModalInstance.dismiss();
            }

        }
    };
}];
