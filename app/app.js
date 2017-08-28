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

var app = angular.module('Market', ['ui.bootstrap']);

app.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
});

app.run(['$rootScope', 'market', function ($rootScope, market) {
    web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length > 0) {
                $rootScope.account = accounts[0];
                $rootScope.$apply();
            }
        }).catch(console.error);

    market.getContract().deployed().then(_instance => {
        console.log("Contract at "+_instance.address);
        $rootScope.instance = _instance;
        $rootScope.$apply();
        var events = _instance.allEvents((error, log) => {
            if (!error)
                $rootScope.$broadcast(log.event,log.args);
            $rootScope.$apply();
        });
    });

}]);

app.service("market", require("./market.service.js"));
app.service("notifications", require("./notifications.service.js"));

app.directive("products", require("./products/products.js"));
app.directive("navigation", require("./nav/nav.js"));
app.directive("toolbar", require("./toolbar/toolbar.js"));

app.directive("sellers", require("./toolbar/sellers/sellers.js"));
app.directive("admins", require("./toolbar/admins/admins.js"));
app.directive("addProduct", require("./toolbar/addProduct/addProduct.js"));
app.directive("setStock", require("./toolbar/setStock/setStock.js"));
app.directive("money", require("./money/money.js"));
app.directive("notifications", require("./notifications/notifications.js"));
