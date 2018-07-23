const config = require('../../config/config.js'),
	  web3 = config.web3.instance,
 	  Contract = require("truffle-contract");

const adminABI  = require('../../build/contracts/Admin.json');

// Read JSON and attach RPC connection (Provider)
const Admin = Contract(adminABI);
Admin.setProvider(web3.currentProvider);

//dirty hack for web3@1.0.0 support for localhost testrpc
if (typeof Admin.currentProvider.sendAsync !== "function") {
  Admin.currentProvider.sendAsync = function() {
    return Admin.currentProvider.send.apply(
      Admin.currentProvider, arguments
    );
  };
}


module.exports = Admin;