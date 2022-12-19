const assert = require("assert");
const ganache = require("ganache");
const options = {};
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());


const compiledGeneratorContract = require('../eth/build/Generator.json')
const compiledProjectContract = require('../eth/build/Project.json')

let accounts;
let generator;
let project;
let projectAddress;



beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

  try {
    generator = await new web3.eth.Contract(compiledGeneratorContract.abi)
    .deploy({
        data: compiledGeneratorContract.evm.bytecode.object,
    })
    .send({
        from: accounts[0],
        gas:'2000000'
    })

    await generator.methods.createProject("100").send({
        from: accounts[0],
        gas:"2000000"
    });

    const projectAddresseses = await generator.methods.getDeployedProjects().call();
    projectAddress = projectAddresseses[0];

    project = await new web3.eth.Contract(compiledProjectContract.abi, projectAddress);

  } catch (error) {
    console.log(error);
    throw error;
  }
})


describe("Project Tests", () => {
    it("Deploys the project generator", () => {
        assert.ok(generator.options.address);
    });

    it("Deploys the project contract", () => {
        assert.ok(project.options.address);
    });

    // Write tests for the following
    // Allows user to fund project
    // Creates a spending request
    // Prevents none project owners from creating a spending request
    // ensures you dont create spending request more than project balance
    // Allows users to approve spending request
    // Does not allow to approve unexisting spending requests
    // Does not allow none project owners to disburse request
    //  Allows project owners to disburse spending request
    //  Does not allow project owners to disburse unapproved requests
    // Does not allow to disburse spending request twice
    // returns correct project details
    // returns correct count for spending requests
    // returns correct details for spending requests

})