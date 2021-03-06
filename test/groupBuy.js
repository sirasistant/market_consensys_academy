var MarketHub = artifacts.require("./MarketHub.sol");
var Shop = artifacts.require("./Shop.sol");
var ERC20 = artifacts.require("./ERC20.sol");
var GroupBuy = artifacts.require("./GroupBuy.sol");

web3.eth.expectedExceptionPromise = require("../app/lib/expectedExceptionPromise.js");

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));


contract('GroupBuy', function (accounts) {
  var groupBuyInstance;
  var shopInstance;
  var hubInstance;
  var price = 20;
  var fee = 4;

  beforeEach(async () => {
    hubInstance = await MarketHub.new(fee);
    await hubInstance.deployShop(accounts[0]);
    shopInstance = await Shop.at(await hubInstance.trustedShopAddresses(0));
    tokenInstance = await ERC20.new(10000, 'MarketCoin', 1, '&', { from: accounts[0] });
    groupBuyInstance = await GroupBuy.new(hubInstance.address);
    await shopInstance.addProduct(10, 10, "Producto 1", "0x0", { from: accounts[0] });
    await shopInstance.addProduct(price, 3, "Producto 2", "0x0", { from: accounts[0] });
    await shopInstance.addProduct(30, 1, "Producto 3", "0x0", { from: accounts[0] });
    var product1Id = await shopInstance.productIds(0);
    var product2Id = await shopInstance.productIds(1);
    var product3Id = await shopInstance.productIds(2);
    await groupBuyInstance.addBuyRequest(product1Id,shopInstance.address, { from: accounts[0] });
    await groupBuyInstance.addBuyRequest(product2Id,shopInstance.address,  { from: accounts[1] });
    await groupBuyInstance.addBuyRequest(product3Id,shopInstance.address,  { from: accounts[2] });
  });

  it("Should add buy requests", async () => {
    assert.equal("3", (await groupBuyInstance.getBuyRequestCount()).toString(10));
  });

  it("Should allow collaborating to a request", async () => {
    var requestId = await groupBuyInstance.buyRequestIds(1);
    await groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: 5 });
    var buyRequest = await groupBuyInstance.buyRequests(requestId);
    assert.equal("5", buyRequest[1].toString(10), "Did not update the amount contributed");
  });

  it("Should execute buy requests", async () => {
    var requestId = await groupBuyInstance.buyRequestIds(1);
    await groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: price + 10 });
    var buyRequest = await groupBuyInstance.buyRequests(requestId);
    var productId = buyRequest[2];
    var paid = buyRequest[3];
    assert.equal(paid, true);
    var ownerAccountBalance = await hubInstance.balances(accounts[0]);
    assert.equal(ownerAccountBalance.toString(10), "" + (price));
  });

  it("Shouldn't allow collaborating to paid buy requests", async () => {
    var requestId = await groupBuyInstance.buyRequestIds(1);
    await groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: price + 10 });
    var buyRequest = await groupBuyInstance.buyRequests(requestId);
    var productId = buyRequest[2];
    var paid = buyRequest[3];
    assert.equal(paid, true);
    await web3.eth.expectedExceptionPromise(() => groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: price + 10, gas: 3000000 }), 3000000);
  });

  it("Should allow exiting buy requests", async () => {
    var requestId = await groupBuyInstance.buyRequestIds(1);
    await groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: price - 1 });
    await groupBuyInstance.exitBuyRequest(requestId, { from: accounts[0] });
    assert.equal((await groupBuyInstance.balances(accounts[0])).toString(10), "" + (price - 1));
    var buyRequest = await groupBuyInstance.buyRequests(requestId);
    assert.equal(buyRequest[1].toString(10), "0");
  });

  it("Shouldn't allow exiting paid buy requests", async () => {
    var requestId = await groupBuyInstance.buyRequestIds(1);
    await groupBuyInstance.joinBuyRequest(requestId, { from: accounts[0], value: price + 10 });
    var buyRequest = await groupBuyInstance.buyRequests(requestId);
    var productId = buyRequest[2];
    var paid = buyRequest[3];
    assert.equal(paid, true);
    await web3.eth.expectedExceptionPromise(() => groupBuyInstance.exitBuyRequest(requestId, { from: accounts[0], gas: 3000000 }), 3000000);
  });


});