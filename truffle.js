module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
    networks: {
	    development: {
			host: "127.0.0.1",
			port: 7545,
			network_id: "*"
	    }, 
	    production: {
	    	host: "34.230.166.144",
			port: 80,
			network_id: "*"
	    }
    }
};
