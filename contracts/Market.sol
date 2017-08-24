pragma solidity ^0.4.6;

contract Owned{
    address public owner;
       
    function Owned(){
          owner = msg.sender;
    }
    
    function kill()
    public
    returns(bool success){
        require(msg.sender==owner);
        suicide(owner);
        return true;
    }
}

contract Wallet{
    event LogMoneyAdded(address account, uint amount);
    event LogWithdraw(address account, uint amount);
    
    mapping(address=>uint) public balances;
    
    function withdraw()
    public
    returns(bool success){
        require(balances[msg.sender]>0);
        uint amount =  balances[msg.sender];
        balances[msg.sender]=0;
        msg.sender.transfer(amount);
        LogWithdraw(msg.sender, amount);
        return true;
    }
    
    function addMoney(address account, uint amount)
    internal{
        balances[account] += amount;
    }
}


contract Market is Owned,Wallet {
    event LogAddAdmin(address account);
    event LogRemoveAdmin(address account);
    event LogAddSeller(address account);
    event LogRemoveSeller(address account);
    
    event LogAddProduct(uint index);
    event LogStockChanged(uint index);
    event LogBuy(uint index);
    
    struct Product{
        uint amount;
        uint price;
        bytes32 name;
        address seller;
    }
    
    uint fee;
    
    address[] public admins;
    Product[] public products;
    address[] public sellers;
    
    modifier onlyAdmin(){
        bool found = false;
        for(uint i =0;i<admins.length;i++){
            if(admins[i]==msg.sender)
                found = true;
        }
        require(found);
        _;
    }
    
    modifier onlySeller(){
        bool found = false;
        for(uint i =0;i<sellers.length;i++){
            if(sellers[i]==msg.sender)
                found = true;
        }
        require(found);
        _;
    }
    
    function Market(uint _fee) {
        admins.push(msg.sender);
        fee = _fee;
    }
    
    function addAdmin(address account)
    public
    onlyAdmin()
    returns(bool success){
        require(account!=owner);
        admins.push(account);
        LogAddAdmin(account);
        return true;
    }
    
    function deleteAdmin(address account)
    public
    onlyAdmin()
    returns(bool success){
        require(account!=owner);
        bool found = false;
        uint index = 0;
        for(uint i =0;i<admins.length;i++){
            if(admins[i]==account){
                found = true;    
                index = i;
                delete admins[i];
                break;
            }
        }
        require(found);
         if(admins.length>1&&index!=admins.length-1){
            admins[index] = admins[sellers.length-1];
        }
        admins.length--;
        LogRemoveAdmin(account);
        return true;
    }
        
    function addSeller(address account)
    public
    onlyAdmin()
    returns(bool success){
        sellers.push(account);
        LogAddSeller(account);
        return true;
    }
    
    function deleteSeller(address account)
    public
    onlyAdmin()
    returns(bool success){
        bool found = false;
        uint index = 0;
        for(uint i =0;i<sellers.length;i++){
            if(sellers[i]==account){
                found = true;
                index = i;
                delete sellers[i];
                break;
            }
        }
        require(found);
        if(sellers.length>1&&index!=sellers.length-1){
            sellers[index] = sellers[sellers.length-1];
        }
        sellers.length--;
        LogRemoveSeller(account);
        return true;
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
        products.push(newProduct);
        
        LogAddProduct(products.length-1);
        
        return true;
    }
    
    function setProductStock(uint index,uint amount)
    public 
    onlySeller()
    returns (bool success){
        Product storage savedProduct = products[index];
        require(savedProduct.seller== msg.sender);
        
        savedProduct.amount = amount;
        
        LogStockChanged(index);
        
        return true;
    }
    
    function buy(uint index)
    public
    payable
    returns (bool success){
          Product storage savedProduct = products[index];
          require(savedProduct.amount>0);
          require(msg.value>=savedProduct.price);
          
          addMoney(savedProduct.seller,savedProduct.price-fee);
          addMoney(owner,msg.value-savedProduct.price + fee);
          
          savedProduct.amount--;
          
          LogBuy(index);
          return true;
    }
    
    function getProductsCount()
    public
    constant
    returns (uint amount){
        return products.length;
    }
    
    function getSellersCount()
    public
    constant
    returns (uint amount){
        return sellers.length;
    }
    
    function getAdminsCount()
    public
    constant
    returns (uint amount){
        return admins.length;
    }
}




