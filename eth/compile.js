const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");


const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);


const pathToProjectContract = path.resolve(__dirname, "contracts", "Project.sol");
const source = fs.readFileSync(pathToProjectContract, "utf8");


const input = {
    language: "Solidity",
    sources: {
      "Project.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts["Project.sol"];

  fs.ensureDirSync(buildPath);

  for (let contract in output) {
    fs.outputJsonSync(
      path.resolve(buildPath, contract.replace(":", "") + ".json"),
      output[contract]
    );
  }