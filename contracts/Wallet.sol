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
        LogMoneyAdded(account,amount);
    }
}