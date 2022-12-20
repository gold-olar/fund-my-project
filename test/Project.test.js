const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledGeneratorContract = require("../eth/build/Generator.json");
const compiledProjectContract = require("../eth/build/Project.json");

const SPEND_REQUEST_DESCRIPTION = "This is the spend request description";
const SPEND_REQUEST_VALUE = "300";

let accounts;
let generator;
let project;
let projectAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  try {
    generator = await new web3.eth.Contract(compiledGeneratorContract.abi)
      .deploy({
        data: compiledGeneratorContract.evm.bytecode.object,
      })
      .send({
        from: accounts[0],
        gas: "2000000",
      });

    await generator.methods.createProject("100", "Sample project").send({
      from: accounts[0],
      gas: "2000000",
    });

    const projectAddresseses = await generator.methods
      .getDeployedProjects()
      .call();
    projectAddress = projectAddresseses[0];

    project = await new web3.eth.Contract(
      compiledProjectContract.abi,
      projectAddress
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
});

describe("Project Tests", () => {
  it("Deploys the project generator", () => {
    assert.ok(generator.options.address);
  });

  it("Deploys the project contract", () => {
    assert.ok(project.options.address);
  });

  // Write tests for the following
  it("Allows user to fund project", async () => {
    await project.methods.fundProject().send({
      value: "200",
      from: accounts[1],
      gas: "2000000",
    });
    const isProjectSupporter = project.methods.supporters(accounts[1]).call();
    assert(isProjectSupporter);
  });

  it("Adds project creator as project owber", async () => {
    const projectOwner = await project.methods.projectOwner().call();
    assert.equal(accounts[0], projectOwner);
  });

  it("Requires a minimum amount to support a project", async () => {
    try {
      await project.methods.fundProject().send({
        value: "90",
        from: accounts[1],
        gas: "2000000",
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Creates a spending request", async () => {
    await project.methods.fundProject().send({
      value: "2000",
      from: accounts[1],
      gas: "2000000",
    });

    await project.methods
      .createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      )
      .send({
        from: accounts[0],
        gas: "2000000",
      });

    const spendRequestsCount = await project.methods
      .spendRequestsCount()
      .call();

    assert.equal(spendRequestsCount, 1);
  });

  it("Prevents none project owners from creating a spending request", async () => {
    try {
      await project.methods.fundProject().send({
        value: "2000",
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        )
        .send({
          from: accounts[2],
          gas: "2000000",
        });

      const spendRequestsCount = await project.methods
        .spendRequestsCount()
        .call();

      assert(false);
    } catch (error) {
      assert(true);
    }
  });

  it("Ensures you dont create spending request more than project balance", async () => {
    try {
      await project.methods
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        )
        .send({
          from: accounts[2],
          gas: "2000000",
        });

      const spendRequestsCount = await project.methods
        .spendRequestsCount()
        .call();

      assert(false);
    } catch (error) {
      assert(true);
    }
  });

  it("Allows users to approve spending request", async () => {
    await project.methods.fundProject().send({
      value: "2000",
      from: accounts[1],
      gas: "2000000",
    });

    await project.methods
      .createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      )
      .send({
        from: accounts[0],
        gas: "2000000",
      });

    await project.methods.approveRequest(0).send({
      from: accounts[1],
      gas: "2000000",
    });

    const data = await project.methods.getSpendingRequest(0).call();

    assert.equal(data["4"], 1);
  });

  it("Does not allow to approve unexisting spending requests", async () => {
    try {
      await project.methods.approveRequest(0).send({
        from: accounts[1],
        gas: "2000000",
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Allows project owners to disburse spending request", async () => {
    await project.methods.fundProject().send({
      value: "2000",
      from: accounts[1],
      gas: "2000000",
    });

    await project.methods
      .createSpendRequest(
        SPEND_REQUEST_DESCRIPTION,
        SPEND_REQUEST_VALUE,
        accounts[3]
      )
      .send({
        from: accounts[0],
        gas: "2000000",
      });

    await project.methods.approveRequest(0).send({
      from: accounts[1],
      gas: "2000000",
    });

    await project.methods.disbursePayment(0).send({
      from: accounts[0],
      gas: "2000000",
    });

    const data = await project.methods.getSpendingRequest(0).call();

    assert.equal(data["3"], true);
  });

  it("Does not allow none project owners to disburse request", async () => {
    try {
      await project.methods.fundProject().send({
        value: "2000",
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        )
        .send({
          from: accounts[0],
          gas: "2000000",
        });

      await project.methods.approveRequest(0).send({
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods.disbursePayment(0).send({
        from: accounts[3],
        gas: "2000000",
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Does not allow to disburse spending request twice", async () => {
    try {
      await project.methods.fundProject().send({
        value: "2000",
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        )
        .send({
          from: accounts[0],
          gas: "2000000",
        });

      await project.methods.approveRequest(0).send({
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods.disbursePayment(0).send({
        from: accounts[0],
        gas: "2000000",
      });

      await project.methods.disbursePayment(0).send({
        from: accounts[0],
        gas: "2000000",
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("Does not allow project owners to disburse unapproved requests", async () => {
    try {
      await project.methods.fundProject().send({
        value: "2000",
        from: accounts[1],
        gas: "2000000",
      });

      await project.methods
        .createSpendRequest(
          SPEND_REQUEST_DESCRIPTION,
          SPEND_REQUEST_VALUE,
          accounts[3]
        )
        .send({
          from: accounts[0],
          gas: "2000000",
        });

      await project.methods.disbursePayment(0).send({
        from: accounts[0],
        gas: "2000000",
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });
});
