const { ethers } = require("hardhat");
const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

function encodeLeaf(address, spot) {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spot]
  );
}

describe("Check if the merke root is working", () => {
  it("it should be verify and show the whether it's working or not", async () => {
    const [deployer, user1, user2, user3, user4, user5] =
      await ethers.getSigners();
    const list = [
      encodeLeaf(deployer.address, 2),
      encodeLeaf(user1.address, 2),
      encodeLeaf(user2.address, 2),
      encodeLeaf(user3.address, 2),
      encodeLeaf(user4.address, 2),
      encodeLeaf(user5.address, 2),
    ];
    const merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });

    const root = merkleTree.getHexRoot();

    const airDrop = await ethers.getContractFactory("AirDrop");
    const airDropDeployed = await airDrop.deploy(root);
    await airDropDeployed.deployed();

    const leaf = keccak256(list[0]);
    const proof = merkleTree.getHexProof(leaf);
    let verified = await airDropDeployed.checkInList(proof, 2);
    expect(verified).to.equal(true);

    verified = await airDropDeployed.checkInList([], 2);
    expect(verified).to.equal(false);
    
  });
});
