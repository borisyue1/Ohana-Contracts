const truffleConfig = require('../../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 		    = require('web3'),
	  web3 			= new Web3(new Web3.providers.HttpProvider(url)),
	  Contract  	= require("truffle-contract");

const ohanaCoinABI  = require('../../build/contracts/OhanaCoin.json');

// Read JSON and attach RPC connection (Provider)
const OhanaCoin = Contract(ohanaCoinABI);
OhanaCoin.setProvider(web3.currentProvider);

//dirty hack for web3@1.0.0 support for localhost testrpc
if (typeof OhanaCoin.currentProvider.sendAsync !== "function") {
  OhanaCoin.currentProvider.sendAsync = function() {
    return OhanaCoin.currentProvider.send.apply(
      OhanaCoin.currentProvider, arguments
    );
  };
}


module.exports = OhanaCoin;