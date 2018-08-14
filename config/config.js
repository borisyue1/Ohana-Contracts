const truffleConfig = require('../truffle.js').networks.gcp;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 = require('web3'),
	  web3 = new Web3(new Web3.providers.HttpProvider(url));
// 0xd4b76fca59aaab8e3aab5c1db6092ebb9df41d74
// 0xba21eac1ae5cafc66e3e5f1e49dea4be6a36c988
web3.eth.defaultAccount = "0x046800e5f322dc43b46abe5e49d2d9f6b1e75482";

module.exports = {
	web3: {
		instance: web3,
		url: url,
		defaultAccount: web3.eth.defaultAccount
	},
	gasLimit: 8000000,
	gasPrice: 1
}