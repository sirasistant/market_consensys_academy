var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', function ($rootScope, $timeout, market, notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './products/products.html',
        link: function (scope, element, attrs) {

            var instance = scope.instance;

            var buyListener = $rootScope.$on("LogBuy", (event, args) => {
                market.getProduct(instance, args.index).then((product) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = product;
                    scope.$apply();
                });
            });

            var stockChangedListener = $rootScope.$on("LogStockChanged", (event, args) => {
                market.getProduct(instance, args.index).then((product) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = product;
                    scope.$apply();
                });
            });

            var addProductListener = $rootScope.$on("LogAddProduct", (event, args) => {
                reloadProducts();
            })
            
            var deleteProductListener = $rootScope.$on("LogDeleteProduct", (event, args) => {
                reloadProducts();
            });

            function reloadProducts() {
                market.getProducts(instance).then(products => {
                    scope.products = products;
                    scope.$apply();
                })
            };

            reloadProducts();

            scope.buy = async (product) => {
                var hash = await instance.buy.sendTransaction(product.id, { from: scope.account, value: product.price })
                notifications.addTransactionNotification(hash);
                $rootScope.$apply();
            }

            scope.delete = async (product) => {
                var hash = await instance.deleteProduct.sendTransaction(product.id, { from: scope.account });
                notifications.addTransactionNotification(hash);
                $rootScope.$apply();
            }

            scope.$on("destroy", () => {
                buyListener();
                addProductListener();
                stockChangedListener();
                deleteProductListener();
            })
        }
    };
}];
