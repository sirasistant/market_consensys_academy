var Market = artifacts.require("./Market.sol");

module.exports = function(deployer) {
  deployer.deploy(Market,100000);
};
