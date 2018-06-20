pragma solidity ^0.4.24;

library Utilities {
	/**
     * Can't compare strings directly in Solidity, so compare their hashes
     * 
     * @param a The first string 
     * @param b The second string
     */
    function compareStrings (string a, string b) public pure returns (bool) {
       return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
