var Market = artifacts.require("./Market.sol");
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
  var instance;
  var fee = 4;

  beforeEach(async () => {
    instance = await Market.new(fee);
  });

  describe("Lifecycle", () => {
    it("should set the owner as admin", async () => {
      var isAdmin = await instance.isAdmin(accounts[0]);
      assert.equal(isAdmin, true);
    });

    it("should kill itself", async () => {
      await instance.kill({ from: accounts[0] });
      var code = web3.eth.getCode(instance.address)
      assert.equal(code, "0x0", "Did not kill itself");
    });
  });

  describe("Users", () => {

    it("should add sellers", async () => {
      await instance.addSeller(accounts[0], { from: accounts[0] });
      var isSeller = await instance.isSeller(accounts[0]);
      assert.equal(isSeller, true);
    });

    it("should delete sellers", async () => {
      await instance.addSeller(accounts[0], { from: accounts[0] });
      var isSeller = await instance.isSeller(accounts[0]);
      assert.equal(isSeller, true);
      await instance.deleteSeller(accounts[0], { from: accounts[0] });
      isSeller = await instance.isSeller(accounts[0]);
      assert.equal(isSeller, false);
    });

    it("should add admins", async () => {
      await instance.addAdmin(accounts[1], { from: accounts[0] });
      var isAdmin = await instance.isAdmin(accounts[1]);
      assert.equal(isAdmin, true);
    });
    it("should delete admins", async () => {
      await instance.addAdmin(accounts[1], { from: accounts[0] });
      var isAdmin = await instance.isAdmin(accounts[1]);
      assert.equal(isAdmin, true);
      await instance.deleteAdmin(accounts[1], { from: accounts[0] });
      isAdmin = await instance.isAdmin(accounts[1]);
      assert.equal(isAdmin, false);
    });
  });

  describe("Manage products", () => {
    var price = 100;
    var overpay = 5;
    var gasPrice = 40000000;
    var owner = accounts[0];
    var buyer = accounts[1];
    var seller = accounts[2];

    beforeEach(async () => {
      await instance.addSeller(seller, { from: owner });
      await instance.addProduct(price, 2, "Producto", { from: seller });
    });

    it("Should add products", async () => {
      var productsCount = await instance.getProductsCount();
      assert.equal("1", productsCount.toString(10), "Did not add the product correctly");
    });

    it("Should allow buying products", async () => {
      await instance.buy(0, { from: buyer, value: price });
      var sellerBalance = await instance.balances(seller);
      assert.equal(sellerBalance.toString(10), "" + (price - fee), "Did not update the amount of the seller correctly");
      var ownerBalance = await instance.balances(owner);
      assert.equal(ownerBalance.toString(10), "" + (fee ), "Did not update the amount of the owner correctly");
    });

    it("Shouldn't allow buying products paying less", async () => {
      await web3.eth.expectedExceptionPromise(() => instance.buy(0, { from: owner, gas: 3000000 }), 3000000);
    });

    it("Should allow retrieving money", async () => {
      await instance.buy(0, { from: buyer, value: price + overpay });

      var accountBalances = await Promise.all([owner, seller].map(account => getBalance(account)));
      var ownerAccountBalance = accountBalances[0];
      var sellerAccountBalance = accountBalances[1];

      var receipts = await Promise.all([owner, seller].map(account => instance.withdraw({ from: account, gasPrice: gasPrice })));
      ownerAccountBalance = ownerAccountBalance.minus(receipts[0].receipt.gasUsed * gasPrice);
      sellerAccountBalance = sellerAccountBalance.minus(receipts[1].receipt.gasUsed * gasPrice);
      accountBalances = await Promise.all([owner, seller].map(account => getBalance(account)));

      assert.equal(accountBalances[0].toString(10), ownerAccountBalance.add(fee + overpay).toString(10), "Did not retrieve the amount of the owner correctly");
      assert.equal(accountBalances[1].toString(10), sellerAccountBalance.add(price - fee).toString(10), "Did not retrieve the amount of the seller correctly");
    });
  });

});