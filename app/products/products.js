var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            account:"=account"
        },
        templateUrl: './products/products.html',
        link: function (scope, element, attrs) {
            var instance;

            market.getContract().deployed().then(_instance => {
                instance = _instance;
                return instance.getProductsCount();
            }).then(count => {
                count = count.toNumber();
                var getProductPromises = [];
                for (var i = 0; i < count; i++) {
                    getProductPromises.push(instance.products(i));
                }
                return Promise.all(getProductPromises);
            }).then(products=>{
                scope.products = products;
            })
        }
    };
}];
