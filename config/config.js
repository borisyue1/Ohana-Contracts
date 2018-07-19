const truffleConfig = require('../truffle.js').networks.development;
const url = "http://" + truffleConfig.host + ':' + truffleConfig.port;

const Web3 	= require('web3'),
	  web3 	= new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = "0x527f2e7a22a3038CA8503CE411C168D53bf1f553";

module.exports = {
	web3: {
		instance: web3,
		url: url,
		defaultAccount: "0x527f2e7a22a3038CA8503CE411C168D53bf1f553"
	},
	gasLimit: 1000000
}