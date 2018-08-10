// Deploy contracts that implement backend logic

const Utilities = artifacts.require("Utilities");
const OhanaCoin = artifacts.require("OhanaCoin");
const Owned = artifacts.require("Owned");
const Leaderboard = artifacts.require("Leaderboard");
const Admin = artifacts.require("Admin");
const SafeMath = artifacts.require("SafeMath");

const OhanaCoinStorage = artifacts.require("OhanaCoinStorage");
const AdminStorage = artifacts.require("AdminStorage");

module.exports = function(deployer) {
  deployer.deploy([Utilities, Owned, SafeMath, Leaderboard]);
  // deployer.link(Utilities, OhanaCoin);
  // deployer.link(SafeMath, Owned);
  // deployer.deploy(Owned);
  deployer.deploy(Admin, AdminStorage.address).then(function() {
  	AdminStorage.deployed().then((instance) => {
  		// Give Admin contract access to AdminStorage functions
  		instance.allowAccess(Admin.address);
  	});
  	return deployer.deploy(OhanaCoin, 10000000, Admin.address, OhanaCoinStorage.address, {value:web3.toWei('9000', 'ether')});
  }).then(() => {
  	OhanaCoinStorage.deployed().then((instance) => {
  		// Give OhanaCoin contract access to OhanaCoinStorage functions
  		instance.allowAccess(OhanaCoin.address);
  	});
  });
};
