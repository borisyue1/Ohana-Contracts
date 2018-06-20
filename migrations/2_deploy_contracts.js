var Utilities = artifacts.require("Utilities");
var OhanaCoin = artifacts.require("OhanaCoin");
var Owned = artifacts.require("Owned");
var Leaderboard = artifacts.require("Leaderboard");

module.exports = function(deployer) {
  deployer.deploy([Utilities, Owned, Leaderboard]);
  deployer.link(Utilities, OhanaCoin);
  deployer.deploy(OhanaCoin, 100000, {value:10000});
};
