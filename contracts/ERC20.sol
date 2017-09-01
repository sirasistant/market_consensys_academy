pragma solidity ^0.4.6;

contract ERC20 {
    uint public totalSupply;
    function balanceOf(address who) constant returns (uint);
    function transfer(address to, uint value);
    function transfer(address to, uint value, bytes data);
    function transferFrom(address _from, address _to, uint256 _value);
    event Transfer(address indexed from, address indexed to, uint value, bytes indexed data);
}