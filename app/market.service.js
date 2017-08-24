var truffleContract = require("truffle-contract");
var marketJson = require("../build/contracts/Market.json");
var Market = truffleContract(marketJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    Market.setProvider(web3.currentProvider);
    function mapProduct(array) {
        return {
            amount: array[0].toNumber(),
            priceToShow: web3.fromWei(array[1].toNumber(), 'ether'),
            price: array[1],
            name: web3.toAscii(array[2]),
            seller: array[3]
        }

    }
    return {
        getContract:function(){return Market;},
        getProducts:function(instance){
            return instance.getProductsCount().then(count => {
                count = count.toNumber();
                var getProductPromises = [];
                for (var i = 0; i < count; i++) {
                    getProductPromises.push(instance.products(i));
                }
                return Promise.all(getProductPromises);
            }).then((products)=>{
                return Promise.resolve(products.map(mapProduct));
            })
        },
        getProduct:function(instance,index){
            return instance.products(index).then((array) => {
                return Promise.resolve(mapProduct(array));
            })
        }
    };
}];    