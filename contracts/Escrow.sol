//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Escrow {
    // Address of the ERC721 NFT contract that this escrow contract interacts with.
    address public nftAddress;
    // Address of the seller who is authorized to list NFTs for sale.
    address payable public seller;
    // Address of the inspector who is responsible for inspecting the NFTs listed for sale.
    address public inspector;
    // Address of the lender, potentially involved in financing the transactions.
    address public lender;

    mapping(uint nftId => bool isListed) public isListedMapping;
    mapping(uint nftId => uint purchasePrice) public purchasePriceMapping;
    mapping(uint nftId => uint escrowAmount) public escrowAmountMapping;
    mapping(uint nftId => address buyer) public buyerMapping;
    mapping(uint nftId => bool isInspected) public isInspectedMapping;
    mapping(uint nftId => mapping(address approvalAddress => bool approval))
        public approvalMapping;

    // Ensures that only the seller can call the modified function.
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    // Ensures that only the designated buyer of a specific NFT can call the modified function.
    modifier onlyBuyer(uint _nftId) {
        require(
            msg.sender == buyerMapping[_nftId],
            "Only buyer can call this method"
        );
        _;
    }

    // Ensures that the function is called only if the specified NFT is currently listed for sale.
    modifier isListed(uint _nftId) {
        require(isListedMapping[_nftId], "NFT is not listed");
        _;
    }

    // Ensures that only the inspector can call the modified function.
    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    receive() external payable {}

    /**
     * @dev Returns the current balance of the contract.
     *      This balance represents the total amount of Ether held by the contract.
     *
     * @return uint The balance of the contract in wei.
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     * @dev Lists an NFT for sale by transferring it from the seller to the contract and
     *      setting sale details.
     *
     * @param _nftId The identifier of the NFT to list.
     * @param _buyer The intended buyer's address.
     * @param _purchasePrice The price at which the NFT is to be sold.
     * @param _escrowAmount The amount to be held in escrow for the transaction.
     *
     * Requirements:
     * - The function caller must be the seller of the NFT.
     */
    function list(
        uint _nftId,
        address _buyer,
        uint _purchasePrice,
        uint _escrowAmount
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListedMapping[_nftId] = true;
        purchasePriceMapping[_nftId] = _purchasePrice;
        escrowAmountMapping[_nftId] = _escrowAmount;
        buyerMapping[_nftId] = _buyer;
    }

    /**
     * @dev Allows the designated buyer of an NFT to deposit the required earnest money into escrow.
     *
     * @param _nftId The identifier of the listed NFT.
     *
     * Requirements:
     * - The function caller must be the buyer specified when the NFT was listed.
     * - The deposit amount must be at least equal to the escrow amount required for the transaction.
     */
    function depositEarnest(
        uint _nftId
    ) public payable isListed(_nftId) onlyBuyer(_nftId) {
        require(
            msg.value >= escrowAmountMapping[_nftId],
            "Invalid escrow amount"
        );
    }

    /**
     * @dev Updates the inspection status of a listed NFT, recording whether it has passed inspection.
     *
     * @param _nftId The identifier of the NFT being inspected.
     * @param _passed Boolean indicating whether the NFT passed the inspection.
     *
     * Requirements:
     * - The NFT must be currently listed.
     * - The caller must be the designated inspector.
     * - The NFT must not have been previously inspected.
     */
    function updateInpectionStatus(
        uint _nftId,
        bool _passed
    ) public isListed(_nftId) onlyInspector {
        require(!isInspectedMapping[_nftId], "NFT is already inspected");

        isInspectedMapping[_nftId] = _passed;
    }

    /**
     * @dev Records approval for a sale. For the sale to be finalised this function
     *      must be called by the buyer, seller, and lender.
     *
     * @param _nftId The identifier for the NFT that is subject to the sale approval.
     */
    function approveSale(uint _nftId) public {
        approvalMapping[_nftId][msg.sender] = true;
    }

    /**
     * @dev Finalises the sale of an NFT after all conditions are met.
     *      This function transfers the sale amount to the seller and the NFT to the buyer.
     *      It also updates the state to reflect that the NFT is no longer listed.
     *
     * @param _nftId The identifier for the NFT being sold.
     *
     * Requirements:
     * - The NFT must be listed
     * - The NFT must have been inspected.
     * - The buyer, seller and lender must have approved tx.
     * - The contract must hold sufficient balance to cover the purchase price.
     * - The funds transfer to the seller must be successful.
     */
    function finaliseSale(uint _nftId) public isListed(_nftId) {
        require(isInspectedMapping[_nftId], "NFT is not inspected");
        require(
            approvalMapping[_nftId][buyerMapping[_nftId]],
            "Buyer not approved"
        );
        require(approvalMapping[_nftId][seller], "Seller not approved");
        require(approvalMapping[_nftId][lender], "Lender not approved");
        require(
            address(this).balance >= purchasePriceMapping[_nftId],
            "Insufficient balance"
        );

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success, "Transfer failed");

        IERC721(nftAddress).transferFrom(
            address(this),
            buyerMapping[_nftId],
            _nftId
        );

        isListedMapping[_nftId] = false;
    }

    /**
     * @dev Cancels an ongoing sale of an NFT and refunds the escrow amount to the appropriate party.
     *
     * @param _nftId The identifier for the NFT involved in the transaction.
     *
     * Requirements:
     * - The function caller must be either the seller or the buyer of the NFT.
     * - The NFT must be currently listed in the escrow contract.
     */
    function cancelSale(uint _nftId) public isListed(_nftId) {
        // Verify that the caller is the seller or the buyer
        require(
            msg.sender == seller || msg.sender == buyerMapping[_nftId],
            "Only seller or buyer can call this method"
        );

        payable(buyerMapping[_nftId]).transfer(escrowAmountMapping[_nftId]);

        // Reset the escrow contract state for the given NFT
        buyerMapping[_nftId] = address(0);
        isInspectedMapping[_nftId] = false;
        approvalMapping[_nftId][buyerMapping[_nftId]] = false;
        approvalMapping[_nftId][seller] = false;
        approvalMapping[_nftId][lender] = false;
    }
}
