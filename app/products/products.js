var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications','$location', function ($rootScope, $timeout, market, notifications,$location) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            marketInstance: "=marketInstance"
        },
        templateUrl: './products/products.html',
        link: function (scope, element, attrs) {

            var idSearch = $location.search().productId;
            var nameSearch = $location.search().productName;

            scope.search = {id:idSearch,name:nameSearch};

            var marketInstance = scope.marketInstance;

            var buyListener = $rootScope.$on("LogBuy", (event, args) => {
                market.getProduct(marketInstance, args.index).then((product) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = product;
                    scope.$apply();
                });
            });

            var stockChangedListener = $rootScope.$on("LogStockChanged", (event, args) => {
                market.getProduct(marketInstance, args.index).then((product) => {
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
                market.getProducts(marketInstance).then(products => {
                    scope.products = products;
                    scope.$apply();
                })
            };

            reloadProducts();

            scope.buy = async (product) => {
                var hash = await marketInstance.buy.sendTransaction(product.id, { from: scope.account, value: product.price })
                notifications.addTransactionNotification(hash);
                $rootScope.$apply();
            }

            scope.delete = async (product) => {
                var hash = await marketInstance.deleteProduct.sendTransaction(product.id, { from: scope.account });
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
