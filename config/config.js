const truffleConfig = require('../truffle.js').networks.gcp;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 = require('web3'),
	  web3 = new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = "0x7f7e36010a62e022f234a1e5719a2dae9cd00c39";

module.exports = {
	web3: {
		instance: web3,
		url: url,
		defaultAccount: web3.eth.defaultAccount
	},
	gasLimit: 8000000
}