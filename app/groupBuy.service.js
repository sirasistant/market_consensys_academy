var truffleContract = require("truffle-contract");
var groupBuyJson = require("../build/contracts/GroupBuy.json");
var GroupBuy = truffleContract(groupBuyJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    GroupBuy.setProvider(web3.currentProvider);
    function mapRequest(array) {
        return {
            id: array[0].toNumber(),
            creator: array[1],
            totalAmount: array[2].toNumber(),
            productId: array[3].toNumber(),
            paid: array[4],
            price: array[5]
        }

    }
    return {
        getContract:function(){return GroupBuy;},
        getRequests:async function(instance){
            var count = await instance.getBuyRequestCount();
            var requests = [];
            for(var i = 0;i<count;i++){
                var id = await instance.buyRequestIds(i);
                var request = mapRequest(await instance.buyRequests(id));
                requests.push(request);
            }
            return requests;
        },
        getRequest:function(instance,id){
            return instance.buyRequests(id).then((array) => {
                return Promise.resolve(mapRequest(array));
            })
        }
    };
}];    