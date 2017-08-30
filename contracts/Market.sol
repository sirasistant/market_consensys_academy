pragma solidity ^0.4.6;

import "./Owned.sol";
import "./Wallet.sol";
import "./AdminManager.sol";
import "./SellerManager.sol";

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
        insertSellerInternal(msg.sender);
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
    
    function getProduct(uint id)
    public
    constant
    productExists(id)
    returns(uint amount,uint price,bytes32 name,address seller){
        Product memory product = products[id];
        return (product.amount,product.price,product.name,product.seller);
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




