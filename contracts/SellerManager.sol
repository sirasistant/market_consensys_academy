pragma solidity ^0.4.6;

contract SellerManager{
    event LogAddSeller(address account);
    event LogRemoveSeller(address account);
    
    struct SellerStruct{
        bool isIndeed;
        uint index;
    }
    
    mapping(address=>SellerStruct) private sellerStructs;
    
    address[] private sellers;
    
    function isSeller(address account)
    public
    constant
    returns (bool isIndeed){
        return sellerStructs[account].isIndeed;
    }
    
    function insertSellerInternal(address account)
    internal
    returns(bool success){
        require(!isSeller(account));
        uint index = sellers.push(account)-1;
        SellerStruct memory sellerStruct;
        sellerStruct.isIndeed = true;
        sellerStruct.index = index;
        sellerStructs[account] = sellerStruct;
        
        LogAddSeller(account);
        return true;
    }
    
    function removeSellerInternal(address account)
    internal
    returns(bool success){
        require(isSeller(account));
        sellerStructs[account].isIndeed = false;
        uint index = sellerStructs[account].index;
        delete sellers[index];
        if(index!=sellers.length-1){
            //Move the item
            address toMove = sellers[sellers.length-1];
            sellerStructs[toMove].index = index;
            sellers[index]= toMove;
        }
        sellers.length--;
        
        LogRemoveSeller(account);
        return true;
    }
    
    function getSellersCount()
    public
    constant
    returns (uint amount){
        return sellers.length;
    }
    
    function getSellerAt(uint index)
    public
    constant
    returns (address seller){
        require(sellers.length>index);
        return sellers[index];
    }
}