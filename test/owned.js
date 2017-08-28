const Owned = artifacts.require("./Owned.sol");
Promise = require('bluebird');

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

web3.eth.getTransactionReceiptMined = require("../app/lib/getTransactionReceiptMined.js");
web3.eth.expectedPayableExceptionPromise = require("../app/lib/expectedPayableExceptionPromise.js");
web3.eth.expectedExceptionPromise = require("../app/lib/expectedExceptionPromise.js");
web3.eth.makeSureAreUnlocked = require("../app/lib/makeSureAreUnlocked.js");
web3.eth.makeSureHasAtLeast = require("../app/lib/makeSureHasAtLeast.js");

contract('Owned', (accounts) => {

    // PREPARATION

    let owner, owner2, owner3;

    before("should prepare accounts", async () => {
        assert.isAtLeast(accounts.length, 3, "should have at least 3 accounts");
        owner = accounts[0];
        owner2 = accounts[1];
        owner3 = accounts[2];
        await web3.eth.makeSureAreUnlocked([owner, owner2])
        await web3.eth.getTransactionReceiptMined(await web3.eth.makeSureHasAtLeast(owner, [owner2], web3.toWei(2)));
    });

    describe("Deployment", () => {
        it("should deploy a new Owned with no value", async () => {
            var instance = await Owned.new({ from: owner });
            assert.strictEqual(await instance.getOwner(), owner, "should have registered the owner");
        });
    });

    describe("Set Owner", () => {
        let created;

        beforeEach("should create an Owned", async () => {
            created = await Owned.new({ from: owner });
        })

        it("should not be possible to change owner if you are not the owner", async () => {
            await web3.eth.expectedExceptionPromise(() => created.setOwner(owner2, { from: owner2, gas: 3000000 }), 3000000);
        });

        it("should not be possible to change owner if you pass value", async () => {
            await web3.eth.expectedPayableExceptionPromise(
                () => created.setOwner(owner2, { from: owner, value: 1 }));
        });

        it("should not be possible to change owner to a 0 address", async () => {
            await web3.eth.expectedExceptionPromise(
                () => created.setOwner(0, { from: owner, gas: 3000000 }),
                3000000);
        });

        it("should not act if same owner", async () => {
            assert.isFalse(await created.setOwner.call(owner, { from: owner }), "should not be possible to change to same owner");

            var txObject = await created.setOwner(owner, { from: owner });
            assert.equal(txObject.logs.length, 0, "should have not created any events");
        });

        it("should be possible to change owners", async () => {
            assert.isTrue(await created.setOwner.call(owner2, { from: owner }), "should be possible to change owners");

            var txObject = await created.setOwner(owner2, { from: owner });
            assert.equal(txObject.logs.length, 1, "should have received 1 event");
            assert.equal(txObject.logs[0].args.oldOwner, owner, "should be the first account");
            assert.equal(txObject.logs[0].args.newOwner, owner2, "should be the second account");

            assert.strictEqual(await created.getOwner(), owner2, "should have registered the changed owner");
        });

        it("should be possible to change owners twice", async () => {
            await created.setOwner(owner2, { from: owner })

            var success = await created.setOwner.call(owner3, { from: owner2 });
            assert.isTrue(success, "should be possible to change owner again");

            var txObject = await created.setOwner(owner3, { from: owner2 });
            assert.equal(txObject.logs.length, 1, "should have had 1 event");
            assert.equal(txObject.logs[0].args.oldOwner, owner2, "should be the second account");
            assert.equal(txObject.logs[0].args.newOwner, owner3, "should be the third account");

            assert.strictEqual(await created.getOwner(), owner3, "should have registered the changed owner");
        });
    });

    describe("Monkey Proof", function () {
        let created;

        beforeEach("should create an Owned", async () => {
            created = await Owned.new({ from: owner });
        })

        it("should not be possible to pass value with getOwner", async () => {
            await web3.eth.expectedPayableExceptionPromise(
                () => created.getOwner.sendTransaction({ from: owner, value: 1 }));
        });

        it("should not be possible to send ether to it", async () => {
            await web3.eth.expectedExceptionPromise(
                () => web3.eth.sendTransactionPromise({
                    from: owner,
                    to: created.address,
                    value: 1,
                    gas: 3000000
                }),
                3000000);
        });
    });
});
