// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.parseEther(n.toString());
};

const PURCHASE_PRICE = tokens(10);
const ESCROW_AMOUNT = tokens(5);

const propertyURIs = [
  "https://ipfs.io/ipfs/QmWuYbV1hvZTui9DHZthqcfANqbKbQccbScx1DUUp2a33G",
  "https://ipfs.io/ipfs/QmbeLXDAXF8u13dxsssZ6SqsVoNUPkDMV1e6bAFkfob77p",
  "https://ipfs.io/ipfs/QmcVvAPtURovpZmhy8MPMeu5ufMW2jXWqn3pdH51dLzj42",
  "https://ipfs.io/ipfs/QmSp3ZWiGwGQGg7rUBmbK1GbDMr2yuCxJQrREmyzdFugVR",
  "https://ipfs.io/ipfs/QmSejKeVTrEDzZXw4SQrmNyEyxwNLuqY2wKRahTXm42b24",
  "https://ipfs.io/ipfs/QmVLqs98UBp4bsYrmwEAqSrYFo6TwWGCTk1Sxnopw8idE4",
  "https://ipfs.io/ipfs/QmdTrBBFADV5JdNTcHiA2cmNRG73rTzFC8DMT31RDCFE9o",
  "https://ipfs.io/ipfs/QmPb1vg2NPwzfhQk5mrFoHNZ52HvthB3hcBEQP4Br6iegh",
  "https://ipfs.io/ipfs/QmWDjMHW8S9LwwCS9h8qPgvjxDxwy2hydzCJ6MUW2BbEdt",
  "https://ipfs.io/ipfs/QmVkH3ZTkNhwzLP7G3Gfj1pz2GwnmJ48STqNTVCRLpCXhW",
  "https://ipfs.io/ipfs/QmQyPQ4VtGLpTLkWqt7qcAzhDra59qfY49go3sFxQGrxMU",
  "https://ipfs.io/ipfs/QmZ8tiW1gSceXGZRfTpRDweTksW9e3r1ehyN8asTuWxS62",
  "https://ipfs.io/ipfs/QmUiNr9PDxWPe3gHTHXnWmWGdkXtU8KpSZBhGx4HTfHXns",
  "https://ipfs.io/ipfs/QmR4bLFtZpCjbmk728n3rEt3rig27erPRCfNCjoCbWcKwN",
  "https://ipfs.io/ipfs/Qmd6YUR1ji199m9TjuCQuShqZ3NpWBgf8g4su3i95pGVN1",
  "https://ipfs.io/ipfs/QmXaQhNbbJeY77RUKrEJSYzEsCVANqAN1oPJ8H6ydPLPEQ",
  "https://ipfs.io/ipfs/QmNSCUuK2miYtjgoJMzuVreKcKLq72dPo9cmAtaFmF9412",
  "https://ipfs.io/ipfs/QmeVWZqn4Kh11Qiv2sJmngCjHRaSS5gQasMp3WxtVKnyp9",
  "https://ipfs.io/ipfs/QmPEM3jbPbxMnr1BL22RUU8g9FcuwvcQ8wjhR8hRh5vE3d",
  "https://ipfs.io/ipfs/QmZH7Zz91hqvPpgTxMysdF4YuvLconsNqcczxcjjdoUVJ8",
  "https://ipfs.io/ipfs/QmQfz5zA352s53sLYSaxBD9kkTJNcWPvG3tWrEvmRi1nNs",
  "https://ipfs.io/ipfs/QmcnpK8J8SYFFaxf5RykU71x4JMwDw5j1myfWNCgzBz8SL",
  "https://ipfs.io/ipfs/QmSz1Nc2P1tKG8f6tF1ZBMTHYfMGXAyrGNfLhrednXbLLu",
  "https://ipfs.io/ipfs/QmNQP4vAweMgQXAjye9KwjX7zJTBZJiNV2HwU1XukJzysG",
  "https://ipfs.io/ipfs/Qmd5Htug5qMpeCxS9KAnY7JJJ4VD6DLzxzmKhrXpkNMJWu",
  "https://ipfs.io/ipfs/QmZ7bt1td3XzF7PfSXpeAcYiBcisdYbpXBzJVMqn2dYu4V",
  "https://ipfs.io/ipfs/QmZstmMcnKBbWe3jxXWBXYUkHLQo7URvTY8BG9VqcKDj3z",
  "https://ipfs.io/ipfs/QmX1B9GZAadtxojjTDcHkdA7vPzC98Vq1TYK299sZdF5Gq",
  "https://ipfs.io/ipfs/QmTUsQ1boPutCYRbL3JvUY4KFvh8ThKhdor8aNcLXbt9La",
  "https://ipfs.io/ipfs/QmSvbE4cSChNVD8WivwXfEdvDST4eAuEb3oWm44wndxBHL",
];

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();
  const buyerAddress = await buyer.getAddress();
  const sellerAddress = await seller.getAddress();
  console.log("🚀 ~ main ~ sellerAddress:", sellerAddress);
  const inspectorAddress = await inspector.getAddress();
  const lenderAddress = await lender.getAddress();

  // Deploy Property Contract
  const Property = await ethers.getContractFactory("Property");
  const property = await Property.deploy();

  const propertyAddress = await property.getAddress();
  console.log(`Deployed property contract: ${propertyAddress}`);

  // Deploy Escrow Contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    propertyAddress,
    sellerAddress,
    inspectorAddress,
    lenderAddress
  );
  const escrowAddress = await escrow.getAddress();
  console.log(`Deployed escrow contract: ${escrowAddress}`);

  // Mint, approve and list properties
  const promises = [];
  for (let index = 1; index <= propertyURIs.length; index++) {
    const uri = propertyURIs[index - 1];
    console.log(
      `Minting, approving and listing property ${index} with uri: ${uri}`
    );

    const promise = (async () => {
      let transaction;
      // Handle mint
      try {
        transaction = await property.connect(seller).mint(uri);
        await transaction.wait();
      } catch (error) {
        console.error(`🔥🔥 Error minting property: ${index}`);
        throw error; // Consider whether to continue or stop execution
      }

      // Handle approve
      try {
        transaction = await property
          .connect(seller)
          .approve(escrowAddress, index);
        await transaction.wait();
      } catch (error) {
        console.error(`🔥🔥 Error approving property: ${index}`);
        throw error; // Consider whether to continue or stop execution
      }

      // Handle list
      try {
        transaction = await escrow
          .connect(seller)
          .list(index, buyerAddress, PURCHASE_PRICE, ESCROW_AMOUNT);
        await transaction.wait();
      } catch (error) {
        console.error(`🔥🔥 Error listing property: ${index}`);
        throw error; // Consider whether to continue or stop execution
      }
    })();

    promises.push(promise);
  }

  await Promise.all(promises);

  console.log("Deploy successful 🚀");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
