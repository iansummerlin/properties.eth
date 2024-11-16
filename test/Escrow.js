const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseEther(n.toString());
};

const MINT_TOKEN_URI =
  "https://ipfs.io/ipfs/QmWuYbV1hvZTui9DHZthqcfANqbKbQccbScx1DUUp2a33G";
const MINT_TOKEN_NFT_ID = 1;
const PURCHASE_PRICE = tokens(10);
const ESCROW_AMOUNT = tokens(5);

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let property, escrow;

  beforeEach(async () => {
    // Setup Accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploy
    const Property = await ethers.getContractFactory("Property");
    property = await Property.deploy();

    // Mint
    let transaction = await property.connect(seller).mint(MINT_TOKEN_URI);
    await transaction.wait();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      await property.getAddress(),
      await seller.getAddress(),
      await inspector.getAddress(),
      await lender.getAddress()
    );

    // Approve property
    transaction = await property
      .connect(seller)
      .approve(await escrow.getAddress(), MINT_TOKEN_NFT_ID);
    await transaction.wait();

    // List property
    transaction = await escrow
      .connect(seller)
      .list(
        MINT_TOKEN_NFT_ID,
        await buyer.getAddress(),
        PURCHASE_PRICE,
        ESCROW_AMOUNT
      );
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Returns NFT address correctly", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.equal(await property.getAddress());
    });

    it("Returns seller address correctly", async () => {
      const result = await escrow.seller();
      expect(result).to.equal(await seller.getAddress());
    });

    it("Returns inspector address correctly", async () => {
      const result = await escrow.inspector();
      expect(result).to.equal(await inspector.getAddress());
    });

    it("Returns lender address correctly", async () => {
      const result = await escrow.lender();
      expect(result).to.equal(await lender.getAddress());
    });
  });

  describe("Listing", () => {
    it("Lists property", async () => {
      const result = await escrow.isListedMapping(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(true);
    });

    it("Updates ownership", async () => {
      const result = await property.ownerOf(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(await escrow.getAddress());
    });

    it("Returns buyer", async () => {
      const result = await escrow.buyerMapping(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(await buyer.getAddress());
    });

    it("Returns purchase price amount", async () => {
      const result = await escrow.purchasePriceMapping(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(PURCHASE_PRICE);
    });

    it("Returns escrow amount", async () => {
      const result = await escrow.escrowAmountMapping(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(ESCROW_AMOUNT);
    });
  });

  describe("Deposits", () => {
    it("Deposits escrow amount", async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEarnest(MINT_TOKEN_NFT_ID, { value: ESCROW_AMOUNT });
      await transaction.wait();

      const result = await escrow.getBalance();
      expect(result).to.equal(ESCROW_AMOUNT);
    });
  });

  describe("Inpection", () => {
    it("Updates inspection status", async () => {
      const transaction = await escrow
        .connect(inspector)
        .updateInpectionStatus(MINT_TOKEN_NFT_ID, true);
      await transaction.wait();

      const result = await escrow.isInspectedMapping(MINT_TOKEN_NFT_ID);
      expect(result).to.equal(true);
    });
  });

  describe("Approval", () => {
    it("Updates approval status", async () => {
      let transaction = await escrow
        .connect(buyer)
        .approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();
      transaction = await escrow.connect(seller).approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();
      transaction = await escrow.connect(lender).approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();

      expect(
        await escrow.approvalMapping(
          MINT_TOKEN_NFT_ID,
          await buyer.getAddress()
        )
      ).to.equal(true);
      expect(
        await escrow.approvalMapping(
          MINT_TOKEN_NFT_ID,
          await seller.getAddress()
        )
      ).to.equal(true);
      expect(
        await escrow.approvalMapping(
          MINT_TOKEN_NFT_ID,
          await lender.getAddress()
        )
      ).to.equal(true);
    });
  });

  describe("Sale", () => {
    beforeEach(async () => {
      // Deposit earnest
      let transaction = await escrow
        .connect(buyer)
        .depositEarnest(MINT_TOKEN_NFT_ID, { value: ESCROW_AMOUNT });
      await transaction.wait();

      // Update inspection status
      transaction = await escrow
        .connect(inspector)
        .updateInpectionStatus(MINT_TOKEN_NFT_ID, true);
      await transaction.wait();

      // Update approval status
      transaction = await escrow.connect(buyer).approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();
      transaction = await escrow.connect(seller).approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();
      transaction = await escrow.connect(lender).approveSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();

      // Sale
      await lender.sendTransaction({
        to: await escrow.getAddress(),
        value: PURCHASE_PRICE - ESCROW_AMOUNT,
      });

      transaction = await escrow
        .connect(seller)
        .finaliseSale(MINT_TOKEN_NFT_ID);
      await transaction.wait();
    });

    it("Updates balance", async () => {
      const balance = Number(await escrow.getBalance());
      expect(balance).to.equal(0);
    });

    it("Updates ownership", async () => {
      const owner = await property.ownerOf(MINT_TOKEN_NFT_ID);
      expect(owner).to.equal(await buyer.getAddress());
    });
  });

  describe("Cancels", () => {
    beforeEach(async () => {
      let transaction = await escrow
        .connect(buyer)
        .depositEarnest(MINT_TOKEN_NFT_ID, { value: ESCROW_AMOUNT });
      await transaction.wait();
      transaction = await escrow
        .connect(inspector)
        .updateInpectionStatus(MINT_TOKEN_NFT_ID, true);
      await transaction.wait();
      await escrow.connect(buyer).approveSale(MINT_TOKEN_NFT_ID);
      await escrow.connect(seller).approveSale(MINT_TOKEN_NFT_ID);
      await escrow.connect(lender).approveSale(MINT_TOKEN_NFT_ID);
    });

    describe("Seller cancels", () => {
      let initialSellerBalance, initialBuyerBalance;
      beforeEach(async () => {
        // Fetch and store the initial balances before the cancellation
        initialSellerBalance = Number(
          await ethers.provider.getBalance(seller.address)
        );
        initialBuyerBalance = Number(
          await ethers.provider.getBalance(buyer.address)
        );

        // Execute cancellation
        const transaction = await escrow
          .connect(seller)
          .cancelSale(MINT_TOKEN_NFT_ID);
        await transaction.wait();
      });

      it("Refunds earnest", async () => {
        // Fetch balances after the cancellation
        const finalSellerBalance = Number(
          await ethers.provider.getBalance(seller.address)
        );
        const finalBuyerBalance = Number(
          await ethers.provider.getBalance(buyer.address)
        );

        // Check if the escrow balance is reset to zero
        const escrowBalance = Number(await escrow.getBalance());
        expect(escrowBalance).to.equal(0);

        // Expect buyer balance to receive the escrow
        expect(finalBuyerBalance).to.be.greaterThan(initialBuyerBalance);
      });
    });

    describe("Buyer cancels", () => {
      let initialSellerBalance, initialBuyerBalance;
      beforeEach(async () => {
        // Fetch and store the initial balances before the cancellation
        initialSellerBalance = Number(
          await ethers.provider.getBalance(seller.address)
        );
        initialBuyerBalance = Number(
          await ethers.provider.getBalance(buyer.address)
        );

        // Execute cancellation
        const transaction = await escrow
          .connect(buyer)
          .cancelSale(MINT_TOKEN_NFT_ID);
        await transaction.wait();
      });

      it("Refunds earnest", async () => {
        // Fetch balances after the cancellation
        const finalSellerBalance = Number(
          await ethers.provider.getBalance(seller.address)
        );
        const finalBuyerBalance = Number(
          await ethers.provider.getBalance(buyer.address)
        );

        // Check if the escrow balance is reset to zero
        const escrowBalance = Number(await escrow.getBalance());
        expect(escrowBalance).to.equal(0);

        // Expect buyer balance to receive the escrow
        expect(finalBuyerBalance).to.be.greaterThan(initialBuyerBalance);
      });
    });
  });
});
