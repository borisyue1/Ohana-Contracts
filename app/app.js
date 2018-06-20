App = {
  web3Provider: null,
  contracts: {},

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('../build/contracts/OhanaCoin.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      App.contracts.OhanaCoin = TruffleContract(data);

      // Set the provider for our contract
      App.contracts.OhanaCoin.setProvider(App.web3Provider);

      return App.createListeners();
    });

    // return App.doSomething();
  },

  createListeners: function() {
    var es = EventSource("/sse");
    es.addEventListener("connected", (e) => {
      console.log(e.data)
    });
  }

};

$(function() {
  App.initWeb3();
  // $(window).on("load", function() {
  //   App.initWeb3();
  // });
});
