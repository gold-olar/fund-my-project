pragma solidity ^0.8.0;

contract Generator {
    address payable[] public deployedProjects;

    function createProject(uint256 minimum) public {
        address newProject = address(new Project(minimum, msg.sender));
        deployedProjects.push(payable(newProject));
    }

    function getDeployedProjects()
        public
        view
        returns (address payable[] memory)
    {
        return deployedProjects;
    }
}

contract Project {
    uint256 public minimumSupportAmount;
    address public projectOwner;
    uint256 public supportersCount;
    mapping(address => bool) public supporters;
    struct SpendRequest {
        string description;
        uint256 value;
        address vendor;
        bool isDispensed;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        bool exists;
    }
    mapping(uint256 => SpendRequest) public spendRequests;
    uint256 spendRequestsCount;

    constructor(uint256 minimum, address owner) public {
        minimumSupportAmount = minimum;
        projectOwner = owner;
    }

    modifier shouldBeProjectOwner() {
        require(msg.sender == projectOwner);
        _;
    }

    modifier spendingRequestShouldExist(uint256 spendRequestIndex) {
        require(spendRequests[spendRequestIndex].exists);
        _;
    }

    function fundProject() public payable {
        require(msg.value > minimumSupportAmount);

        if (!supporters[msg.sender]) {
            supportersCount++;
        }

        supporters[msg.sender] = true;
    }

    function createSpendRequest(
        string memory description,
        uint256 value,
        address vendor
    ) public shouldBeProjectOwner {
        require(value <= address(this).balance); // Checks to ensure the spend request value is less or equal to than the available balance
        SpendRequest storage newSpendRequest = spendRequests[
            spendRequestsCount
        ];

        newSpendRequest.description = description;
        newSpendRequest.value = value;
        newSpendRequest.vendor = vendor;
        newSpendRequest.isDispensed = false;
        newSpendRequest.exists = true;
        newSpendRequest.approvalCount = 0;

        spendRequestsCount++;
    }

    function approveRequest(uint256 spendRequestIndex)
        public
        spendingRequestShouldExist(spendRequestIndex)
    {
        SpendRequest storage spendRequest = spendRequests[spendRequestIndex];

        require(supporters[msg.sender]); // Checks if the person making this request is a supporter
        require(!spendRequest.approvals[msg.sender]); // Checks to make sure the person is not approving twice

        spendRequest.approvals[msg.sender] = true;
        spendRequest.approvalCount++;
    }

    bool private locked = false;

    function disbursePayment(uint256 spendRequestIndex)
        public
        shouldBeProjectOwner
    {
        // ​​require(locked = false); // Checks to confirm that function is not already locked
        // ​ ​ ​      ​locked = true;

        SpendRequest storage spendRequest = spendRequests[spendRequestIndex];
        require(spendRequest.approvalCount > (supportersCount / 2)); // Checks to confirm that we have enough supporters approval
        require(!spendRequest.isDispensed); // Check to confirm that the payment is not already disbursed;

        payable(spendRequest.vendor).transfer(spendRequest.value);
        spendRequest.isDispensed = true;
        // locked = false;
    }

    function getProjectDetails()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumSupportAmount,
            address(this).balance,
            spendRequestsCount,
            supportersCount,
            projectOwner
        );
    }

    function getSpendRequestsCount() public view returns (uint256) {
        return spendRequestsCount;
    }

    function getSpendingRequest(uint256 spendRequestIndex)
        public
        view
        spendingRequestShouldExist(spendRequestIndex)
        returns (
            string memory,
            uint256,
            address,
            bool,
            uint256
        )
    {
        SpendRequest storage spendRequest = spendRequests[spendRequestIndex];
        return (
            spendRequest.description,
            spendRequest.value,
            spendRequest.vendor,
            spendRequest.isDispensed,
            spendRequest.approvalCount
        );
    }
}
