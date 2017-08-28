pragma solidity ^0.4.6;

contract Owned{
    event LogOwnerChanged(address oldOwner,address newOwner);

    address public owner;
       
    function Owned(){
          owner = msg.sender;
    }

    function setOwner(address newOwner)
    public
    returns (bool success){
        require(msg.sender == owner);
        require(newOwner!=address(0));
        if(newOwner!=owner){
            owner = newOwner;
            LogOwnerChanged(msg.sender,newOwner);
            return true;
        }else{
            return false;
        }
    }

    function getOwner()
    public
    constant
    returns (address){
        return owner;
    }
    
    function kill()
    public
    returns(bool success){
        require(msg.sender==owner);
        suicide(owner);
        return true;
    }
}