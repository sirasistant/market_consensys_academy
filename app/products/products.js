var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './products/products.html',
        link: function (scope, element, attrs) {

            function mapProduct(array) {
                return {
                    amount: array[0].toNumber(),
                    priceToShow: web3.fromWei(array[1].toNumber(), 'ether'),
                    price: array[1],
                    name: web3.toAscii(array[2]),
                    seller: array[3]
                }

            }

            var instance = scope.instance;
            var buyListener;

            buyListener = $rootScope.$on("LogBuy", (event, args) => {
                instance.products(args.index).then((array) => {
                    if (scope.products)
                        scope.products[args.index.toNumber()] = mapProduct(array);
                    scope.$apply();
                })
            })

            addProductListener = $rootScope.$on("LogAddProduct", (event, args) => {
                reloadProducts();
            })

            function reloadProducts() {
                instance.getProductsCount().then(count => {
                    count = count.toNumber();
                    var getProductPromises = [];
                    for (var i = 0; i < count; i++) {
                        getProductPromises.push(instance.products(i));
                    }
                    return Promise.all(getProductPromises);
                }).then(products => {
                    scope.products = products.map(mapProduct);
                })
            };

            reloadProducts();

            scope.buy = (product) => {
                var index = scope.products.indexOf(product);
                instance.buy(index, { from: scope.account, value: product.price }).then(() => {
                    alert("Successfully bought " + product.name);
                }).catch(err => console.error(err));
            }

            scope.$on("destroy", () => {
                buyListener();
                addProductListener();
            })
        }
    };
}];
