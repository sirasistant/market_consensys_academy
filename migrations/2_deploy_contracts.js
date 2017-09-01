var Market = artifacts.require("./Market.sol");
var MarketCoin = artifacts.require("./MarketCoin.sol");
var GroupBuy = artifacts.require("./GroupBuy.sol");


module.exports = function (deployer) {
  deployer.deploy(MarketCoin,100000000,"MarketCoin",2,"&").then(function () {
    return deployer.deploy(Market, 100000);
  }).then(function () {
    return deployer.deploy(GroupBuy, Market.address);
  });;
};
