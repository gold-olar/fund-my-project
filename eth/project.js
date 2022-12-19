import web3 from "./web3";
import Project from "./build/Project.json";

const projectWeb3Instance = (CONTRACT_ADDRESS) => {
    return new web3.eth.Contract(
        Project.abi,
      CONTRACT_ADDRESS
    );
}



export default projectWeb3Instance;
