var MarketHub = artifacts.require("./MarketHub.sol");
var Shop = artifacts.require("./Shop.sol");
var ERC20 = artifacts.require("./ERC20.sol");
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


contract('Market', function (accounts) {
  var shopInstance;
  var hubInstance;
  var tokenInstance;
  var fee = 4;

  var owner = accounts[0];
  var buyer = accounts[1];
  var seller = accounts[2];

  beforeEach(async () => {
    hubInstance = await MarketHub.new(fee);
    await hubInstance.deployShop(seller);
    shopInstance = await Shop.at(await hubInstance.trustedShopAddresses(0));
    tokenInstance = await ERC20.new(10000, 'MarketCoin', 1, '&', { from: owner });
  });

  describe("Manage products", () => {
    var price = 100;
    var gasPrice = 40000000;

    beforeEach(async () => {
      await shopInstance.addProduct(price, 1000, "Producto", "0x0", { from: seller });
    });

    it("Should add products", async () => {
      var productsCount = await shopInstance.getProductsCount();
      assert.equal("1", productsCount.toString(10), "Did not add the product correctly");
    });

    it("Should delete products", async () => {
      await shopInstance.addProduct(price + 10, 2000, "Producto 2", "0x0", { from: seller });
      var secondProductId = await shopInstance.productIds(1);
      await shopInstance.deleteProduct(secondProductId, { from: seller });
      var productsCount = await shopInstance.getProductsCount();
      assert.equal("1", productsCount.toString(10), "Did not delete the product correctly");
    });

    it("Should allow buying products", async () => {
      var id = await shopInstance.productIds(0);
      await shopInstance.buy(id, { from: buyer, value: price });
      var sellerBalance = await hubInstance.balances(seller);
      assert.equal(sellerBalance.toString(10), "" + (price - fee), "Did not update the amount of the seller correctly");
      var ownerBalance = await hubInstance.balances(owner);
      assert.equal(ownerBalance.toString(10), "" + (fee), "Did not update the amount of the owner correctly");
    });

    it("Shouldn't allow buying products paying less", async () => {
      var id = await shopInstance.productIds(0);
      await web3.eth.expectedExceptionPromise(() => shopInstance.buy(id, { from: owner, gas: 3000000 }), 3000000);
    });

    it("Shouldn't allow buying deleted products", async () => {
      await shopInstance.addProduct(price + 10, 2000, "Producto 2", "0x0", { from: seller });
      var firstProductId = await shopInstance.productIds(0);
      await shopInstance.deleteProduct(firstProductId, { from: seller });
      await web3.eth.expectedExceptionPromise(() => shopInstance.buy(firstProductId, { from: owner, gas: 3000000 }), 3000000);
    });

    it("Should allow retrieving money", async () => {
      var id = await shopInstance.productIds(0);
      await shopInstance.buy(id, { from: buyer, value: price  });

      var accountBalances = await Promise.all([owner, seller].map(account => getBalance(account)));
      var ownerAccountBalance = accountBalances[0];
      var sellerAccountBalance = accountBalances[1];

      var receipts = await Promise.all([owner, seller].map(account => hubInstance.withdraw({ from: account, gasPrice: gasPrice })));
      ownerAccountBalance = ownerAccountBalance.minus(receipts[0].receipt.gasUsed * gasPrice);
      sellerAccountBalance = sellerAccountBalance.minus(receipts[1].receipt.gasUsed * gasPrice);
      accountBalances = await Promise.all([owner, seller].map(account => getBalance(account)));

      assert.equal(accountBalances[0].toString(10), ownerAccountBalance.add(fee).toString(10), "Did not retrieve the amount of the owner correctly");
      assert.equal(accountBalances[1].toString(10), sellerAccountBalance.add(price - fee).toString(10), "Did not retrieve the amount of the seller correctly");
    });
  });
  describe("Buying with tokens", () => {
    var price = 100;
    var gasPrice = 40000000;
    var owner = accounts[0];
    var buyer = accounts[1];
    var seller = accounts[2];

    beforeEach(async () => {
      await tokenInstance.transfer(buyer,1000 ,{ from: owner });
      await hubInstance.addAllowedToken(tokenInstance.address, { from: owner });
      await shopInstance.addProduct(price, 1000, "Producto", tokenInstance.address, { from: seller });
    });

    it("Should allow buying products", async () => {
      var id = await shopInstance.productIds(0);
      await tokenInstance.approveAndCall(shopInstance.address, price, shopInstance.contract.buyWithTokens.getData(id), { from: buyer });
      var sellerBalance = await hubInstance.tokenBalances(tokenInstance.address, seller);
      assert.equal(sellerBalance.toString(10), "" + (price - fee), "Did not update the amount of the seller correctly");
      var ownerBalance = await hubInstance.tokenBalances(tokenInstance.address,owner);
      assert.equal(ownerBalance.toString(10), "" + (fee), "Did not update the amount of the owner correctly");
    });

    it("Shouldn't allow buying products paying less", async () => {
      var id = await shopInstance.productIds(0);
      await web3.eth.expectedExceptionPromise(() => tokenInstance.approveAndCall(shopInstance.address, price-1, shopInstance.contract.buyWithTokens.getData(id), { from: buyer, gas: 3000000 }), 3000000);
    });

    it("Should allow retrieving tokens", async () => {
      var id = await shopInstance.productIds(0);
      await tokenInstance.approveAndCall(shopInstance.address, price, shopInstance.contract.buyWithTokens.getData(id), { from: buyer });
      
      var accountBalances = await Promise.all([owner, seller].map(account => tokenInstance.balanceOf(account)));
      var ownerAccountBalance = accountBalances[0];
      var sellerAccountBalance = accountBalances[1];

      var receipts = await Promise.all([owner, seller].map(account => hubInstance.withdrawTokens(tokenInstance.address,{ from: account, gasPrice: gasPrice })));
      accountBalances = await Promise.all([owner, seller].map(account => tokenInstance.balanceOf(account)));

      assert.equal(accountBalances[0].toString(10), ownerAccountBalance.add(fee).toString(10), "Did not retrieve the amount of the owner correctly");
      assert.equal(accountBalances[1].toString(10), sellerAccountBalance.add(price - fee).toString(10), "Did not retrieve the amount of the seller correctly");
    });

    it("Shouldn't allow spending other person's tokens", async () => {
      var id = await shopInstance.productIds(0);
      await web3.eth.expectedExceptionPromise(() => shopInstance.buyWithTokens(id, { from: owner, gas: 3000000 }), 3000000);   
    });
  
  });

});