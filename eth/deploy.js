const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledGenerator = require("./build/Generator.json");
require("dotenv").config({ path: __dirname + "/../.env" });

const deploy = async () => {
  const provider = new HDWalletProvider({
    mnemonic: {
      phrase: process.env.MNEMONIC,
    },
    providerOrUrl: process.env.GOERLI_NETWORK_HTTP_URL
  });
  try {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    console.log("Deploying from personal account", accounts[0]);

    const result = await new web3.eth.Contract(compiledGenerator.abi)
      .deploy({ data: compiledGenerator.evm.bytecode.object })
      .send({ gas: "3400000", from: accounts[0] });

    console.log("Generator Contract Address -", result.options.address);
    provider.engine.stop();
  } catch (error) {
    console.log(error);
    provider.engine.stop();
  }
};
deploy();
