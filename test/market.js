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

  beforeEach(function (done) {
    Market.new(fee)
      .then(function (_instance) { //deploy it
        instance = _instance;
        done();
      })
  });

  it("should set the owner as admin", () => {
    return instance.isAdmin(accounts[0]).then((isAdmin) => {
      assert.equal(isAdmin, true);
    });
  });

  it("should add and delete sellers", () => {
    return instance.addSeller(accounts[0], { from: accounts[0] })
      .then(() => {
        return instance.isSeller(accounts[0]);
      })
      .then((isSeller) => {
        assert.equal(isSeller, true);
        return instance.deleteSeller(accounts[0], { from: accounts[0] });
      }).then(() => {
        return instance.isSeller(accounts[0]);
      }).then((isSeller) => {
        assert.equal(isSeller, false);
      });
  });

  it("should add and delete admins", () => {
    return instance.addAdmin(accounts[1], { from: accounts[0] })
      .then(() => {
        return instance.isAdmin(accounts[1]);
      })
      .then((isAdmin) => {
        assert.equal(isAdmin, true);
        return instance.deleteAdmin(accounts[1], { from: accounts[0] });
      }).then(() => {
        return instance.isAdmin(accounts[1]);
      }).then((isAdmin) => {
        assert.equal(isAdmin, false);
      });
  });

  it("should manage products", () => {
    var price = 100;
    var overpay = 5;
    return instance.addSeller(accounts[2], { from: accounts[0] })
      .then(() => {
        return instance.addProduct(price, 2, "Producto", { from: accounts[2] })
      })
      .then(() => {
        return instance.getProductsCount();
      }).then((productsCount) => {
        assert.equal("1", productsCount.toString(10), "Did not add the product correctly");
        return instance.buy(0, { from: accounts[1], value: price + overpay });
      }).then(() => {
        return instance.balances(accounts[2]);
      }).then((sellerBalance) => {
        assert.equal(sellerBalance.toString(10), "" + (price - fee), "Did not update the amount of the seller correctly");
        return instance.balances(accounts[0])
      }).then((ownerBalance) => {
        assert.equal(ownerBalance.toString(10), "" + (fee + overpay), "Did not update the amount of the owner correctly");
      });
  });

  it("should manage money", () => {
    var price = 100;
    var overpay = 5;
    var gasPrice = 40000000;
    var ownerAccountBalance, sellerAccountBalance;
    return instance.addSeller(accounts[2], { from: accounts[0] })
      .then(() => {
        return instance.addProduct(price, 2, "Producto", { from: accounts[2] })
      })
      .then(() => {
        return instance.getProductsCount();
      }).then((productsCount) => {
        return instance.buy(0, { from: accounts[1], value: price + overpay });
      }).then(() => {
        return Promise.all([accounts[0], accounts[2]].map(account => getBalance(account)));
      }).then((accountBalances) => {
        ownerAccountBalance = accountBalances[0];
        sellerAccountBalance = accountBalances[1];
        return Promise.all([accounts[0], accounts[2]].map(account => instance.withdraw({ from: account, gasPrice: gasPrice })));
      }).then((receipts) => {
        ownerAccountBalance = ownerAccountBalance.minus(receipts[0].receipt.gasUsed * gasPrice);
        sellerAccountBalance = sellerAccountBalance.minus(receipts[1].receipt.gasUsed * gasPrice);
        return Promise.all([accounts[0], accounts[2]].map(account => getBalance(account)));
      }).then((accountBalances) => {
        assert.equal(accountBalances[0].toString(10), ownerAccountBalance.add(fee + overpay).toString(10), "Did not retrieve the amount of the owner correctly");
        assert.equal(accountBalances[1].toString(10), sellerAccountBalance.add(price - fee).toString(10), "Did not retrieve the amount of the seller correctly");
      });
  });

  it("should kill itself", () => {
    return instance.kill({ from: accounts[0] }).then(() => {
      return web3.eth.getCode(instance.address);
    }).then((code) => {
      assert.equal(code, "0x0", "Did not kill itself");
    })
  });


});