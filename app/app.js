require("babel-polyfill");
var Web3 = require("web3");
var Promise = require("bluebird");
var truffleContract = require("truffle-contract");
// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

var app = angular.module('Market', ['ui.bootstrap', 'ngRoute']);

app.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
});

app.run(['$rootScope', 'market', 'groupBuy', function ($rootScope, market, groupBuy) {
    web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length > 0) {
                $rootScope.account = accounts[0];
                $rootScope.$apply();
            }
        }).catch(console.error);

    market.getHub().deployed().then(_instance => {
        console.log("Hub contract at " + _instance.address);
        $rootScope.hubInstance = _instance;
        $rootScope.$apply();
        var events = _instance.allEvents((error, log) => {
            if (!error)
                $rootScope.$broadcast(log.event, log.args);
            $rootScope.$apply();
        });
        market.getShops(_instance).then(shopInstances => {
            console.log(shopInstances.length+" shops at: "+shopInstances.map(instance=>instance.address).join(", "));
            $rootScope.shopInstances = shopInstances;
            $rootScope.$apply();
            shopInstances.forEach((shop) => {
                var events = shop.allEvents((error, log) => {
                    log.args.shopInstance = shop;
                    if (!error)
                        $rootScope.$broadcast(log.event, log.args);
                    $rootScope.$apply();
                });
            });
        });
    });

    groupBuy.getContract().deployed().then(_instance => {
        console.log("Contract groupBuy at " + _instance.address);
        $rootScope.groupBuyInstance = _instance;
        $rootScope.$apply();
        var events = _instance.allEvents((error, log) => {
            if (!error)
                $rootScope.$broadcast(log.event, log.args);
            $rootScope.$apply();
        });
    });

}]);

app.service("market", require("./market.service.js"));
app.service("groupBuy", require("./groupBuy.service.js"));
app.service("notifications", require("./notifications.service.js"));

app.directive("products", require("./products/products.js"));
app.directive("navigation", require("./nav/nav.js"));
app.directive("toolbar", require("./toolbar/toolbar.js"));

app.directive("addProduct", require("./toolbar/addProduct/addProduct.js"));
app.directive("setStock", require("./toolbar/setStock/setStock.js"));
app.directive("money", require("./money/money.js"));
app.directive("notifications", require("./notifications/notifications.js"));

app.directive("tokenList", require("./tokenList/tokenList.js"));
app.directive("tokenToolbar", require("./tokenToolbar/tokenToolbar.js"));
app.directive("addToken", require("./tokenToolbar/addToken/addToken.js"));

app.directive("buyRequests", require("./buyRequests/buyRequests.js"));
app.directive("collaborate", require("./buyRequests/collaborate.js"));


app.controller('marketController', require('./market/marketController.js'));
app.controller('groupBuyController', require('./groupBuy/groupBuyController.js'));
app.controller('tokensController', require('./tokens/tokensController.js'));


app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            controller: "marketController",
            templateUrl: "market/market.html"
        }).when("/group", {
            controller: "groupBuyController",
            templateUrl: "groupBuy/groupBuy.html"
        }).when("/tokens", {
            controller: "tokensController",
            templateUrl: "tokens/tokens.html"
        }).otherwise({ redirectTo: '/' });

}]);