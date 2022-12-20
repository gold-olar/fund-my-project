const assert = require("assert");
const ganache = require("ganache");
const { ethers } = require("ethers");

const provider = new ethers.providers.Web3Provider(ganache.provider());

const signer = provider.getSigner();
const compiledGeneratorContract = require("../eth/build/Generator.json");
const compiledProjectContract = require("../eth/build/Project.json");

const SPEND_REQUEST_DESCRIPTION = "This is the spend request description";
const SPEND_REQUEST_VALUE = "300";

let generator;
let project;
let projectAddress;
let accounts;
let signers;

beforeEach(async () => {
  accounts = await provider.listAccounts();

  const generatorFactory = new ethers.ContractFactory(
    compiledGeneratorContract.abi,
    compiledGeneratorContract.evm.bytecode.object,
    signer
  );
  generator = await generatorFactory.deploy();

  await generator.createProject("100", "Sample project");

  projectAddress = await generator.getDeployedProjects();

  project = await new ethers.Contract(
    projectAddress[0],
    compiledProjectContract.abi,
    signer
  );
});

describe("Test using Ethers Library", async () => {
  it("Deploys the project generator", async () => {
    assert(generator.address);
  });

  it("Deploys the project contract", () => {
    assert.ok(project.address);
  });

  it("Allows user to fund project", async () => {
    await project.fundProject({ value: "1000" });
    const signerAddress = await signer.getAddress();

    const isProjectSupporter = await project.supporters(accounts[0]); // same as signerAddress

    assert(isProjectSupporter);
  });

  it("Adds project creator as project owber", async () => {
    const projectOwner = await project.projectOwner();
    assert.equal(accounts[0], projectOwner);
  });

  it("Requires a minimum amount to support a project", async () => {
    try {
      await project.fundProject({
        value: "10",
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Creates a spending request", async () => {
    await project.fundProject({
      value: "2000",
    });

    await project.createSpendRequest(
      SPEND_REQUEST_DESCRIPTION,
      SPEND_REQUEST_VALUE,
      accounts[3]
    );

    const spendRequestsCount = await project.spendRequestsCount();

    assert.equal(spendRequestsCount, 1);
  });

  it("Prevents none project owners from creating a spending request", async () => {
    try {
      await project.fundProject({
        value: "2000",
      });

      await project
        .connect(accounts[1])
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        );

      const spendRequestsCount = await project.spendRequestsCount();

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Ensures you dont create spending request more than project balance", async () => {
    try {
      await project.createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      );

      const spendRequestsCount = await project.spendRequestsCount();

      assert.equal(1, spendRequestsCount);
    } catch (error) {
      assert(error);
    }
  });

  it("Allows users to approve spending request", async () => {
    await project.fundProject({
      value: "2000",
    });

    await project.createSpendRequest(
      SPEND_REQUEST_DESCRIPTION,
      SPEND_REQUEST_VALUE,
      accounts[3]
    );
    const secondAddressSigner = await provider.getSigner(accounts[1]);

    await project.connect(secondAddressSigner).fundProject({
      value: "2000",
    });

    await project.connect(secondAddressSigner).approveRequest(0);

    const data = await project.getSpendingRequest(0);

    assert.equal(data["4"], 1);
  });

  it("Does not allow to approve unexisting spending requests", async () => {
    try {
      await project.approveRequest(0);
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Allows project owners to disburse spending request", async () => {
    await project.fundProject({ value: "2000" });

    await project.createSpendRequest(
      SPEND_REQUEST_DESCRIPTION,
      SPEND_REQUEST_VALUE,
      accounts[3]
    );

    await project.approveRequest(0);

    await project.disbursePayment(0);

    const data = await project.getSpendingRequest(0);

    assert.equal(data["3"], true);
  });

  it("Does not allow none project owners to disburse request", async () => {
    try {
      await project.fundProject({ value: "2000" });

      await project.createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      );

      await project.approveRequest(0);
      const secondAddressSigner = await provider.getSigner(accounts[3]);

      await project.connect(secondAddressSigner).disbursePayment(0);

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Does not allow to disburse spending request twice", async () => {
    try {
      await project.fundProject({ value: "4000" });

      await project.createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      );

      await project.approveRequest(0);

      await project.methods.disbursePayment(0);

      await project.methods.disbursePayment(0);
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Does not allow project owners to disburse unapproved requests", async () => {
    try {
      await project.fundProject({ value: "2000" });

      await project.createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      );

      await project.disbursePayment(0);
      assert(false);
    } catch (error) {
      assert(error);
    }
  });
});
