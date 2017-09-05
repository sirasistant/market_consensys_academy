var Shop = artifacts.require("./Shop.sol");
var MarketHub = artifacts.require("./MarketHub.sol");
var ERC20 = artifacts.require("./ERC20.sol");
var GroupBuy = artifacts.require("./GroupBuy.sol");


module.exports = function (deployer,network,accounts) {
  var hubInstance;
  deployer.deploy(ERC20,1000000000000000,"MarketCoin",10,"🦄").then(function () {
    return deployer.deploy(MarketHub, 10000000);
  }).then(function () {
    return deployer.deploy(GroupBuy, MarketHub.address);
  }).then(function(){
    return MarketHub.deployed();
  }).then(function(marketHubInstance){
    hubInstance = marketHubInstance;
    return hubInstance.addAllowedToken(ERC20.address, { from: accounts[0] });
  }).then(function(){
    return hubInstance.deployShop(accounts[0], { from: accounts[0] });
  });
};
