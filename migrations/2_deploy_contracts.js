var Market = artifacts.require("./Market.sol");
var GroupBuy = artifacts.require("./GroupBuy.sol");


module.exports = function(deployer) {
  deployer.deploy(Market,100000).then(function() {
    return deployer.deploy(GroupBuy, Market.address);
  });
};
