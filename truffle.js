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
	    },
	    gcp: {
	    	host: "35.230.48.31",
	    	port: 8545,
	    	network_id: "*",
	    	gas: 8000000,
			gasPrice: 1
	    }
	   //35.236.66.200, 35.233.220.74,  35.230.48.31, 35.235.79.11  ff3d09eb37ed2a2d55a41819ede5b6ca9860e69c
    }
};
