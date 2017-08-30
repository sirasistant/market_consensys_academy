pragma solidity ^0.4.6;

import "./Market.sol";

contract GroupBuy is Owned,Wallet {
    
    //TODO logs
    
    struct BuyRequest{
        uint id;
        address creator;
        uint totalAmount;
        uint productId;
        bool paid;
        uint price;
        mapping(address=>uint) collaborators;
        uint index;
    }
    
    uint nextBuyRequestId = 0;
    
    mapping(uint=>BuyRequest) public buyRequests;
    
    uint[] public buyRequestIds;
    
    Market public market;
    
    function GroupBuy(address marketAddress){
        market = Market(marketAddress);
    }
    
    modifier existsBuyRequest(uint id){
        require(buyRequestIds[buyRequests[id].index]==id);
        _;
    }
    
    modifier productExists(uint id){
        market.getProduct(id);
        _;
    }
    
    modifier productHasStock(uint id){
        var ( amount, price, name, seller) = market.getProduct(id);
        require(amount>0);
        _;
    }
    
    function addBuyRequestInternal(BuyRequest memory request)
    internal
    returns(uint id){
        id = nextBuyRequestId++;
        uint index = buyRequestIds.push(id)-1;
        request.id = id;
        request.index = index;
        buyRequests[id] = request;
    }
    
    function deleteBuyRequestInternal(uint id)
    internal
    existsBuyRequest(id){
        uint index = buyRequests[id].index;
        delete buyRequestIds[index];
        if(index!=buyRequestIds.length-1){
            uint idToSwap = buyRequestIds[buyRequestIds.length-1];
            buyRequests[idToSwap].index = index;
            buyRequestIds[index] = idToSwap;
        }
        buyRequestIds.length--;
    }
    
    function executeBuyRequest(uint requestId)
    internal
    productHasStock(buyRequests[requestId].productId){
        buyRequests[requestId].paid = true;
        market.buy.value(buyRequests[requestId].totalAmount)(buyRequests[requestId].productId);
    }
    
    function addBuyRequest(uint productId)
    public
    productExists(productId)
    productHasStock(productId)
    returns(bool success){
        var ( , price, ,) = market.getProduct(productId);
        BuyRequest memory newBuyRequest;
        newBuyRequest.creator = msg.sender;
        newBuyRequest.productId = productId;
        newBuyRequest.price = price;
        addBuyRequestInternal(newBuyRequest);
        return true;
    }
    
    function deleteBuyRequest(uint requestId)
    public
    existsBuyRequest(requestId)
    returns(bool success){
        require(buyRequests[requestId].creator==msg.sender);
        deleteBuyRequestInternal(requestId);
        return true;
    }
    
    function joinBuyRequest(uint requestId)
    public
    payable
    existsBuyRequest(requestId)
    returns(bool success){
        require(!buyRequests[requestId].paid);
        buyRequests[requestId].totalAmount += msg.value;
        buyRequests[requestId].collaborators[msg.sender] += msg.value;
        if(buyRequests[requestId].totalAmount>=buyRequests[requestId].price){
            executeBuyRequest(requestId);
        }
        return true;
    }
    
    function exitBuyRequest(uint requestId)
    public
    existsBuyRequest(requestId)
    returns(bool success){
        require(!buyRequests[requestId].paid);
        uint amountContributed = buyRequests[requestId].collaborators[msg.sender];
        buyRequests[requestId].totalAmount -=  amountContributed;
        buyRequests[requestId].collaborators[msg.sender] =0;
        addMoney(msg.sender,amountContributed);
        return true;
    }
    
    function getBuyRequestCount()
    public
    constant
    returns (uint amount){
        return buyRequestIds.length;
    }
    
}

