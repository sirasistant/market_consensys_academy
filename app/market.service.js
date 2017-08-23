var truffleContract = require("truffle-contract");
var marketJson = require("../build/contracts/Market.json");
var Market = truffleContract(marketJson);

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    Market.setProvider(web3.currentProvider);
    return {
        getContract:function(){return Market;}
    };
}];    