pragma solidity ^0.4.6;

contract AdminManager{
    event LogAddAdmin(address indexed account);
    event LogRemoveAdmin(address indexed account);
    
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