pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Utilities.sol";

contract TestUtilities {

	function testCompareStrings() public {
	    Assert.equal(Utilities.compareStrings("hello", "hello"), true, "Strings should be equal but are not");
	    Assert.equal(Utilities.compareStrings("1!@fda", "a!@fda"), false, "Strings should not be equal but are");
  	}

}
