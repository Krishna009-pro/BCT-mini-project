// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CollegeFeePayment {

    address public collegeAccount;
    uint public feeAmount = 50000;
    mapping(address => bool) public hasPaid;

    event FeePaid(address indexed student, uint amount);

    constructor(address _collegeAccount) {
        collegeAccount = _collegeAccount;
    }

    function payFee() public payable {
        require(msg.value == feeAmount, "Incorrect fee amount");
        require(!hasPaid[msg.sender], "Fee already paid");
        payable(collegeAccount).transfer(msg.value);
        hasPaid[msg.sender] = true;
        emit FeePaid(msg.sender, msg.value);
    }
}
