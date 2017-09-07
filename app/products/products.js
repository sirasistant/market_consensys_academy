var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', '$location', function ($rootScope, $timeout, market, notifications, $location) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            shopInstances: "=shopInstances",
            hubInstance: "=hubInstance",
            groupBuyInstance: "=groupBuyInstance"
        },
        templateUrl: './products/products.html',
        link: function (scope, element, attrs) {

            var idSearch = $location.search().productId;
            var nameSearch = $location.search().productName;

            scope.search = { id: idSearch, name: nameSearch };

            var shopInstances = scope.shopInstances;
            var groupBuyInstance = scope.groupBuyInstance;
            var hubInstance = scope.hubInstance;

            var buyListener = $rootScope.$on("LogBuy", (event, args) => {
                market.getProductWithToken(scope.hubInstance, args.shopInstance, scope.account, args.id).then((product) => {
                    scope.products.forEach((savedProduct, index) => {
                        if (savedProduct.id == product.id) {
                            scope.products[index] = product;
                        }
                    });
                    scope.$apply();
                });
            });

            var stockChangedListener = $rootScope.$on("LogStockChanged", (event, args) => {
                market.getProductWithToken(scope.hubInstance, args.shopInstance, scope.account, args.id).then((product) => {
                    scope.products.forEach((savedProduct, index) => {
                        if (savedProduct.id == product.id) {
                            scope.products[index] = product;
                        }
                    });
                    scope.$apply();
                });
            });

            var addProductListener = $rootScope.$on("LogAddProduct", (event, args) => {
                reload();
            })

            var deleteProductListener = $rootScope.$on("LogDeleteProduct", (event, args) => {
                reload();
            });

            async function reload() {
                scope.products = await market.getProductsWithTokens(shopInstances, hubInstance, scope.account);
                scope.$apply();
            };

            reload();

            scope.buy = async (product) => {
                var hash;
                if (product.token) { 
                    var callData = product.shop.contract.buyWithTokens.getData(product.id);
                    hash = await product.token.instance.approveAndCall.sendTransaction(product.shop.address, product.price, callData, { from: scope.account });
                } else {
                    hash = await product.shop.buy.sendTransaction(product.id, { from: scope.account, value: product.price });
                }
                notifications.addTransactionNotification(hash);
                $rootScope.$apply();
            }

            scope.groupBuy = async (product) => {
                var hash = await groupBuyInstance.addBuyRequest.sendTransaction(product.id,product.shop.address, { from: scope.account });
                notifications.addTransactionNotification(hash);
                $location.path("/group");
                $rootScope.$apply();
            }

            scope.delete = async (product) => {
                var hash = await product.shop.deleteProduct.sendTransaction(product.id, { from: scope.account });
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
