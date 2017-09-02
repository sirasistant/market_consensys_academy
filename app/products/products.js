var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications', '$location', function ($rootScope, $timeout, market, notifications, $location) {
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

            scope.search = { id: idSearch, name: nameSearch };

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
                reload();
            })

            var deleteProductListener = $rootScope.$on("LogDeleteProduct", (event, args) => {
                reload();
            });

            async function reload() {
                scope.products = await market.getProducts(marketInstance);
                scope.tokens = await market.getAllowedTokens(marketInstance, scope.account);
                scope.products = scope.products.map(product => {
                    product.token = scope.tokens.filter(token => token.instance.address == product.token)[0];
                    product.priceToShow = product.token? (product.price/(Math.pow(10,product.token.decimalUnits))): web3.fromWei(product.price, 'ether');
                    return product;
                });
                scope.$apply();
            };

            reload();

            scope.buy = async (product) => {
                var hash;
                if(product.token){ //TODO fill data
                    var callData = marketInstance.contract.buyWithTokens.getData(product.id);
                    hash = await product.token.instance.approveAndCall.sendTransaction(marketInstance.address,product.price,callData, { from: scope.account });
                }else{
                    hash = await marketInstance.buy.sendTransaction(product.id, { from: scope.account, value: product.price });                    
                }
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
