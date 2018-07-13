const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 		= require('web3'),
	  web3 		= new Web3(new Web3.providers.HttpProvider(url)),
	  Contract  = require("truffle-contract");

const leaderboardABI  = require('../../build/contracts/Leaderboard.json');

// Read JSON and attach RPC connection (Provider)
const Leaderboard = Contract(leaderboardABI);
Leaderboard.setProvider(web3.currentProvider);

//dirty hack for web3@1.0.0 support for localhost testrpc
if (typeof Leaderboard.currentProvider.sendAsync !== "function") {
  Leaderboard.currentProvider.sendAsync = function() {
    return Leaderboard.currentProvider.send.apply(
      Leaderboard.currentProvider, arguments
    );
  };
}


module.exports = Leaderboard;