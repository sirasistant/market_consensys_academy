var truffleContract = require("truffle-contract");
var groupBuyJson = require("../build/contracts/GroupBuy.json");
var GroupBuy = truffleContract(groupBuyJson);
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    GroupBuy.setProvider(web3.currentProvider);
    function mapRequest(array) {
        return {
            creator: array[0],
            totalAmount: web3.fromWei(array[1],"ether"),
            productId: array[2],
            paid: array[3],
            price: array[4]
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
                request.id = id;
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