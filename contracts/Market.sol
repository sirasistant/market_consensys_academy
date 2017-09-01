pragma solidity ^0.4.6;

import "./Owned.sol";
import "./Wallet.sol";
import "./AdminManager.sol";
import "./SellerManager.sol";
import "./AllowedTokenManager.sol";
import "./ERC20.sol";

contract Market is Owned,Wallet,AdminManager,SellerManager,AllowedTokenManager {
    
    event LogAddProduct(uint indexed id);
    event LogStockChanged(uint indexed id);
    event LogBuy(uint indexed id);
    event LogDeleteProduct(uint indexed id);
    
    struct Product{
        uint amount;
        uint price;
        bytes32 name;
        address seller;
        address token;
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
    
    modifier onlyAllowedToken(address account){
        require(isAllowedToken(account)||account==address(0));
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
    
    function addProduct(uint price,uint amount,bytes32 name,address tokenAddress)
    public 
    onlySeller()
    onlyAllowedToken(tokenAddress)
    returns(bool success){
        require(price>fee);
        require(amount>0);

        Product memory newProduct;
        newProduct.price = price;
        newProduct.amount = amount;
        newProduct.name = name;
        newProduct.seller = msg.sender;
        newProduct.token = tokenAddress;
        
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
    
    function buyWithTokens(uint id)
    public
    productExists(id)
    returns (bool success){
        require(savedProduct.amount>0);
        Product storage savedProduct = products[id];
        require(savedProduct.token != address(0));
        require(tokenBalances[savedProduct.token][msg.sender]>=savedProduct.price);
        
        savedProduct.amount--;
        tokenTransfer(msg.sender,savedProduct.seller,savedProduct.token,savedProduct.price-fee);
        tokenTransfer(msg.sender,owner,savedProduct.token,fee);
        
        LogBuy(id);
        return true;
    }
    
    function buy(uint id)
    public
    payable
    productExists(id)
    returns (bool success){
        require(savedProduct.amount>0);
        addMoney(msg.sender,msg.value);
        Product storage savedProduct = products[id];
        require(savedProduct.token == address(0));
        require(balances[msg.sender]>=savedProduct.price);
        
        savedProduct.amount--;
        transfer(msg.sender,savedProduct.seller,savedProduct.price-fee);
        transfer(msg.sender,owner,fee);
        
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
    
    function addAllowedToken(address account)
    public
    onlyAdmin()
    returns(bool success){
        return insertAllowedTokenInternal(account);
    }
    
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData)
    public{
        require(_token == msg.sender);
        require(_extraData.length==0);
        ERC20 token = ERC20(_token);
        token.transferFrom( _from, this, _value);
        addToken(_from,msg.sender,_value);
    }

    function tokenFallback(address _from, uint _value, bytes _data)
    public
    onlyAllowedToken(msg.sender){
        require(_data.length==0);
        addToken(_from,msg.sender,_value);
    }
    
}




