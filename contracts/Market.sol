pragma solidity ^0.4.6;

import "./Owned.sol";
import "./Wallet.sol";

contract AdminManager{
    event LogAddAdmin(address account);
    event LogRemoveAdmin(address account);
    
    struct AdminStruct{
        bool isIndeed;
        uint index;
    }
    
    mapping(address=>AdminStruct) private adminStructs;
    
    address[] private admins;
    
    function isAdmin(address account)
    public
    constant
    returns (bool isIndeed){
        return adminStructs[account].isIndeed;
    }
    
    function insertAdminInternal(address account)
    internal
    returns(bool success){
        require(!isAdmin(account));
        uint index = admins.push(account)-1;
        AdminStruct memory adminStruct;
        adminStruct.isIndeed = true;
        adminStruct.index = index;
        adminStructs[account] = adminStruct;
        
        LogAddAdmin(account);
        return true;
    }
    
    function removeAdminInternal(address account)
    internal
    returns(bool success){
        require(isAdmin(account));
        adminStructs[account].isIndeed = false;
        uint index = adminStructs[account].index;
        delete admins[index];
        if(index!=admins.length-1){
            //Move the item
            address toMove = admins[admins.length-1];
            adminStructs[toMove].index = index;
            admins[index]= toMove;
        }
        admins.length--;
        
        LogRemoveAdmin(account);
        return true;
    }
    
    function getAdminsCount()
    public
    constant
    returns (uint amount){
        return admins.length;
    }
    
    function getAdminAt(uint index)
    public
    constant
    returns (address admin){
        require(admins.length>index);
        return admins[index];
    }
    
}


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

contract Market is Owned,Wallet,AdminManager,SellerManager {
    
    event LogAddProduct(uint id);
    event LogStockChanged(uint id);
    event LogBuy(uint id);
    event LogDeleteProduct(uint id);
    
    struct Product{
        uint amount;
        uint price;
        bytes32 name;
        address seller;
        uint index;
    }
    
    uint[] public productIds;
    
    uint fee;
    uint nextProductId = 0;
    
    mapping(uint=>Product) public products;
    
    modifier onlySeller(){
        require(isSeller(msg.sender));
        _;
    }
    
    modifier onlyAdmin(){
        require(isAdmin(msg.sender));
        _;
    }
    
    modifier productExists(uint id){
        require(productIds[products[id].index]==id);
        _;
    }
    
    
    function Market(uint _fee) {
        insertAdminInternal(msg.sender);
        fee = _fee;
    }
    
    function addProductInternal(Product memory newProduct)
    internal
    returns (uint id){
        id = nextProductId++;
        productIds.push(id);
        newProduct.index = productIds.length-1;
        products[id] = newProduct;
    }
    
    function deleteProductInternal(uint id)
    internal
    productExists(id){
        uint index = products[id].index;
        delete productIds[index];
        if(index!=productIds.length-1){
            uint idToSwap = productIds[productIds.length-1];
            products[idToSwap].index = index;
            productIds[index] = idToSwap;
        }
        productIds.length--;
    }
    
    function addProduct(uint price,uint amount,bytes32 name)
    public 
    onlySeller()
    returns(bool success){
        require(price>fee);
        require(amount>0);

        Product memory newProduct;
        newProduct.price = price;
        newProduct.amount = amount;
        newProduct.name = name;
        newProduct.seller = msg.sender;
        
        uint id = addProductInternal(newProduct);
        
        LogAddProduct(id);
        
        return true;
    }
    
    function deleteProduct(uint id)
    public 
    onlySeller()
    productExists(id)
    returns(bool success){
        require(msg.sender==products[id].seller);
        deleteProductInternal(id);
        
        LogDeleteProduct(id);
        return true;
    }
    
    function setProductStock(uint id,uint amount)
    public 
    onlySeller()
    productExists(id)
    returns (bool success){
        Product storage savedProduct = products[id];
        require(savedProduct.seller== msg.sender);
        
        savedProduct.amount = amount;
        
        LogStockChanged(id);
        
        return true;
    }
    
    function buy(uint id)
    public
    payable
    productExists(id)
    returns (bool success){
          Product storage savedProduct = products[id];
          require(savedProduct.amount>0);
          require(msg.value>=savedProduct.price);
          
          addMoney(savedProduct.seller,savedProduct.price-fee);
          addMoney(owner,msg.value-savedProduct.price + fee);
          
          savedProduct.amount--;
          
          LogBuy(id);
          return true;
    }
    
    function getProductsCount()
    public
    constant
    returns (uint amount){
        return productIds.length;
    }
    
    function addAdmin(address account)
    public
    onlyAdmin()
    returns(bool success){
        return insertAdminInternal(account);
    }
    
    function deleteAdmin(address account)
    public
    onlyAdmin()
    returns(bool success){
        require(account!=owner); //Owner cant stop being admin. Sorry!
        return removeAdminInternal(account);
    }
        
    function addSeller(address account)
    public
    onlyAdmin()
    returns(bool success){
        return insertSellerInternal(account);
    }
    
    function deleteSeller(address account)
    public
    onlyAdmin()
    returns(bool success){
        return removeSellerInternal(account);
    }
    
}




