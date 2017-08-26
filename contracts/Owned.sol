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