const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
 	  Contract = require("truffle-contract");

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