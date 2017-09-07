var truffleContract = require("truffle-contract");
var marketJson = require("../build/contracts/MarketHub.json");
var shopJson = require("../build/contracts/Shop.json");
var erc20Json = require("../build/contracts/ERC20.json");
var MarketHub = truffleContract(marketJson);
var Shop = truffleContract(shopJson);
var ERC20 = truffleContract(erc20Json);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    MarketHub.setProvider(web3.currentProvider);
    Shop.setProvider(web3.currentProvider);
    ERC20.setProvider(web3.currentProvider);
    $rootScope.ERC20 = ERC20;
    function mapProduct(array) {
        return {
            amount: array[0].toNumber(),
            price: array[1],
            name: web3.toAscii(array[2]),
            token: array[3]
        }

    };
    async function getProducts(shopInstances) {
        var counts = await Promise.all(shopInstances.map(shop => shop.getProductsCount()));

        var productArrays = Promise.all(counts.map(async (count, index) => {
            var shop = shopInstances[index];
            var shopProducts = [];
            for (var i = 0; i < count; i++) {
                var id = await shop.productIds(i);
                var product = mapProduct(await shop.products(id));
                product.id = id;
                product.shop = shop;
                product.seller = await shop.getSeller();
                shopProducts.push(product);
            }
            return shopProducts;
        }))

        return productArrays.reduce((last, next) => {
            return last.concat(next);
        }, []);
    };
    async function getAllowedTokens(hubInstance, account) {
        var count = (await hubInstance.getAllowedTokensCount()).toNumber();
        var tokens = [];
        for (var i = 0; i < count; i++) {
            var token = {};
            token.address = await hubInstance.getAllowedTokenAt(i);
            tokens.push(token);
        }
        tokens = await Promise.all(tokens.map(async token => {
            token.instance = await ERC20.at(token.address);
            token.name = await token.instance.name();
            token.totalSupply = await token.instance.totalSupply();
            token.balance = (await token.instance.balanceOf(account)).toNumber();
            token.marketBalance = (await hubInstance.tokenBalances(token.address, account)).toNumber();
            token.decimalUnits = (await token.instance.decimals()).toNumber();
            token.symbol = await token.instance.symbol();
            return token;
        }));
        return tokens;
    };
    async function getProduct(shop, id) {
        var array = await shop.products(id);
        var product = mapProduct(array);
        product.id = id;
        product.shop = shop;
        product.seller = await shop.getSeller();
        return product;
    };
    return {
        getHub: function () { return MarketHub; },
        getProductsWithTokens: async function (shopInstances, hubInstance, account) {
            var results = await Promise.all([getProducts(shopInstances), getAllowedTokens(hubInstance, account)]);
            var products = results[0];
            var tokens = results[1];
            products = products.map(product => {
                product.token = tokens.filter(token => token.instance.address == product.token)[0];
                product.priceToShow = product.token ? (product.price / (Math.pow(10, product.token.decimalUnits))) : web3.fromWei(product.price, 'ether');
                return product;
            });
            return products;
        },
        getShops: async function (hubInstance) {
            var count = await hubInstance.getTrustedShopCount();
            var requests = [];
            for (var i = 0; i < count; i++) {
                requests.push(i);
            }
            var shopInstances = await Promise.all((
                await Promise.all(requests.map(index => hubInstance.trustedShopAddresses(index))))
                .map(address => Shop.at(address)));
            return shopInstances;
        },
        getProductWithToken: async function (hubInstance, shop, account, id) {
            var allowedTokens = await getAllowedTokens(hubInstance, account);
            var product = await getProduct(shop, id);
            product.token = allowedTokens.filter(token => token.instance.address == product.token)[0];
            product.priceToShow = product.token ? (product.price / (Math.pow(10, product.token.decimalUnits))) : web3.fromWei(product.price, 'ether');
            return product;
        },
        getAllowedTokens: getAllowedTokens
    };
}];    