var Market = artifacts.require("./Market.sol");
var ERC20 = artifacts.require("./ERC20.sol");
var GroupBuy = artifacts.require("./GroupBuy.sol");


module.exports = function (deployer,network,accounts) {
  deployer.deploy(ERC20,1000000000000000,"MarketCoin",10,"🦄").then(function () {
    return deployer.deploy(Market, 10000000);
  }).then(function () {
    return deployer.deploy(GroupBuy, Market.address);
  }).then(function(){
    return Market.deployed();
  }).then(function(marketInstance){
    return marketInstance.addAllowedToken(ERC20.address, { from: accounts[0] });
  });
};
