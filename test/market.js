var Market = artifacts.require("./Market.sol");

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

  it("should set the owner as admin", async () => {
    var isAdmin = await instance.isAdmin(accounts[0]);
    assert.equal(isAdmin, true);
  });

  it("should add and delete sellers", async () => {
    await instance.addSeller(accounts[0], { from: accounts[0] });
    var isSeller = await instance.isSeller(accounts[0]);
    assert.equal(isSeller, true);
    await instance.deleteSeller(accounts[0], { from: accounts[0] });
    isSeller = await instance.isSeller(accounts[0]);
    assert.equal(isSeller, false);
  });

  it("should add and delete admins", async () => {
    await instance.addAdmin(accounts[1], { from: accounts[0] });
    var isAdmin = await instance.isAdmin(accounts[1]);
    assert.equal(isAdmin, true);
    await instance.deleteAdmin(accounts[1], { from: accounts[0] });
    isAdmin = await instance.isAdmin(accounts[1]);
    assert.equal(isAdmin, false);
  });

  it("should manage products", async () => {
    var price = 100;
    var overpay = 5;
    await instance.addSeller(accounts[2], { from: accounts[0] });
    await instance.addProduct(price, 2, "Producto", { from: accounts[2] });
    var productsCount = await instance.getProductsCount();
    assert.equal("1", productsCount.toString(10), "Did not add the product correctly");
    await instance.buy(0, { from: accounts[1], value: price + overpay });
    var sellerBalance = await instance.balances(accounts[2]);
    assert.equal(sellerBalance.toString(10), "" + (price - fee), "Did not update the amount of the seller correctly");
    var ownerBalance = await instance.balances(accounts[0]);
    assert.equal(ownerBalance.toString(10), "" + (fee + overpay), "Did not update the amount of the owner correctly");
  });

  it("should manage money", async () => {
    var price = 100;
    var overpay = 5;
    var gasPrice = 40000000;
    var ownerAccountBalance, sellerAccountBalance;

    await instance.addSeller(accounts[2], { from: accounts[0] });

    await instance.addProduct(price, 2, "Producto", { from: accounts[2] });

    var productsCount = await instance.getProductsCount();

    await instance.buy(0, { from: accounts[1], value: price + overpay });

    var accountBalances = await Promise.all([accounts[0], accounts[2]].map(account => getBalance(account)));
    ownerAccountBalance = accountBalances[0];
    sellerAccountBalance = accountBalances[1];

    var receipts = await Promise.all([accounts[0], accounts[2]].map(account => instance.withdraw({ from: account, gasPrice: gasPrice })));
    ownerAccountBalance = ownerAccountBalance.minus(receipts[0].receipt.gasUsed * gasPrice);
    sellerAccountBalance = sellerAccountBalance.minus(receipts[1].receipt.gasUsed * gasPrice);
    accountBalances = await Promise.all([accounts[0], accounts[2]].map(account => getBalance(account)));

    assert.equal(accountBalances[0].toString(10), ownerAccountBalance.add(fee + overpay).toString(10), "Did not retrieve the amount of the owner correctly");
    assert.equal(accountBalances[1].toString(10), sellerAccountBalance.add(price - fee).toString(10), "Did not retrieve the amount of the seller correctly");
  });

  it("should kill itself", async () => {
    await instance.kill({ from: accounts[0] });
    var code = web3.eth.getCode(instance.address)
    assert.equal(code, "0x0", "Did not kill itself");
  });


});