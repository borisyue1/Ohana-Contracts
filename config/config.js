const truffleConfig = require('../truffle.js').networks.aws;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 = require('web3'),
	  web3 = new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = "0x60b60b61e1400db6028abf8bf43e1e8a3c911fb0";

module.exports = {
	web3: {
		instance: web3,
		url: url,
		defaultAccount: web3.eth.defaultAccount
	},
	gasLimit: 1000000
}