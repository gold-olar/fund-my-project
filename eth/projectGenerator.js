import web3 from "./web3";
import Generator from "./build/Generator.json";
import { GENERATOR_CONTRACT_ADDRESS } from "./constant";


const generatorWeb3Instance = new web3.eth.Contract(
    Generator.abi,
  GENERATOR_CONTRACT_ADDRESS
);

export default generatorWeb3Instance;
