// Deploy contracts that store data

const OhanaCoinStorage = artifacts.require("OhanaCoinStorage");
const AdminStorage = artifacts.require("AdminStorage");


module.exports = function(deployer) {
  deployer.deploy(OhanaCoinStorage, 1000000); //initialize storage with tokens
  deployer.deploy(AdminStorage);
};
