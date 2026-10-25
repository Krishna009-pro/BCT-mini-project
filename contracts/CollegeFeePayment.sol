// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CollegeFeePayment
 * @dev Smart contract for managing student college fee payments on the Ethereum blockchain.
 * Features Checks-Effects-Interactions (CEI) security, multi-attribute student records,
 * dual wallet/roll-ID verification, and administrative treasury management.
 */
contract CollegeFeePayment {
    // Contract owner (Administrator / College Authority)
    address public owner;

    // College treasury / fee collection account
    address payable public collegeAccount;

    // Fee amount in Wei (e.g., 0.05 ether = 50000000000000000 Wei)
    uint256 public feeAmount;

    // Payment details struct
    struct PaymentRecord {
        bool hasPaid;
        uint256 amountPaid;
        uint256 timestamp;
        string studentId;
        string studentName;
        string department;
        string semester;
    }

    // Mapping from student wallet address to their payment record
    mapping(address => PaymentRecord) public records;

    // Mapping from student roll ID to their wallet address for instant verification
    mapping(string => address) public rollToAddress;

    // List of student addresses who have paid
    address[] public studentList;

    // Events
    event FeePaid(
        address indexed studentAddress,
        string studentId,
        string studentName,
        string department,
        string semester,
        uint256 amount,
        uint256 timestamp
    );
    event FeeAmountUpdated(uint256 oldFee, uint256 newFee);
    event CollegeAccountUpdated(address oldAccount, address newAccount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only college admin can perform this action");
        _;
    }

    /**
     * @param _collegeAccount The address where collected fees will be forwarded
     * @param _initialFeeAmount The fee amount in Wei (e.g., 0.05 ether)
     */
    constructor(address payable _collegeAccount, uint256 _initialFeeAmount) {
        require(_collegeAccount != address(0), "Invalid college account address");
        owner = msg.sender;
        collegeAccount = _collegeAccount;
        feeAmount = _initialFeeAmount;
    }

    /**
     * @dev Allows a student to pay their college fee.
     * Follows Checks-Effects-Interactions (CEI) to prevent reentrancy attacks.
     * @param _studentId Student Roll / ID number
     * @param _studentName Student Name
     * @param _department Department/Branch (e.g. Blockchain Technology)
     * @param _semester Semester (e.g. Semester 5)
     */
    function payFee(
        string memory _studentId,
        string memory _studentName,
        string memory _department,
        string memory _semester
    ) public payable {
        require(bytes(_studentId).length > 0, "Student ID cannot be empty");
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(msg.value == feeAmount, "Incorrect fee amount sent");
        require(!records[msg.sender].hasPaid, "Fee already paid for this wallet");
        require(rollToAddress[_studentId] == address(0), "Fee already paid for this Roll ID");

        // 1. Effects (Update state before external transfer)
        records[msg.sender] = PaymentRecord({
            hasPaid: true,
            amountPaid: msg.value,
            timestamp: block.timestamp,
            studentId: _studentId,
            studentName: _studentName,
            department: _department,
            semester: _semester
        });
        rollToAddress[_studentId] = msg.sender;
        studentList.push(msg.sender);

        // 2. Interactions (Send funds to college account using .call)
        (bool success, ) = collegeAccount.call{value: msg.value}("");
        require(success, "Transfer to college account failed");

        // 3. Emit event for logging and frontend indexing
        emit FeePaid(
            msg.sender,
            _studentId,
            _studentName,
            _department,
            _semester,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Check if a specific student wallet has paid the fee
     */
    function checkPaymentStatus(address _student)
        external
        view
        returns (
            bool hasPaid,
            uint256 amountPaid,
            uint256 timestamp,
            string memory studentId,
            string memory studentName,
            string memory department,
            string memory semester
        )
    {
        PaymentRecord memory r = records[_student];
        return (
            r.hasPaid,
            r.amountPaid,
            r.timestamp,
            r.studentId,
            r.studentName,
            r.department,
            r.semester
        );
    }

    /**
     * @dev Check payment status directly by student Roll ID
     */
    function checkPaymentStatusByRollId(string memory _studentId)
        external
        view
        returns (
            bool hasPaid,
            address studentAddress,
            uint256 amountPaid,
            uint256 timestamp,
            string memory studentName,
            string memory department,
            string memory semester
        )
    {
        address addr = rollToAddress[_studentId];
        PaymentRecord memory r = records[addr];
        return (
            r.hasPaid,
            addr,
            r.amountPaid,
            r.timestamp,
            r.studentName,
            r.department,
            r.semester
        );
    }

    /**
     * @dev Get total count of students who have paid
     */
    function getTotalStudentsPaid() external view returns (uint256) {
        return studentList.length;
    }

    /**
     * @dev Get all student addresses
     */
    function getAllStudents() external view returns (address[] memory) {
        return studentList;
    }

    /**
     * @dev Admin function to update the required fee amount
     */
    function updateFeeAmount(uint256 _newFeeAmount) external onlyOwner {
        emit FeeAmountUpdated(feeAmount, _newFeeAmount);
        feeAmount = _newFeeAmount;
    }

    /**
     * @dev Admin function to update the college receiving account
     */
    function updateCollegeAccount(address payable _newCollegeAccount) external onlyOwner {
        require(_newCollegeAccount != address(0), "Invalid address");
        emit CollegeAccountUpdated(collegeAccount, _newCollegeAccount);
        collegeAccount = _newCollegeAccount;
    }
}
