module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
    networks: {
	    development: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*"
	    }, 
	    aws: {
	    	host: "ec2-34-212-171-159.us-west-2.compute.amazonaws.com",
			port: 8545,
			network_id: "*",
			gas: 8000000,
			gasPrice: 1
	    }
    }
};
