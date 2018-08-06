pragma solidity ^0.4.24;

contract Leaderboard {
    mapping (uint => User) leaderboard;
    
    struct User {
        address user;
        uint256 personalBalance;
    }
    
    /**
     * Adds the user and balance to the leaderboard
     * 
     * @param user The address of the user
     * @param balance The balance of the user
     */
    function addBalance(address user, uint256 balance) external returns (bool) {
        if (leaderboard[9].personalBalance >= balance) {
            // user didn't make it into top 10
            return false;
        }
        for (uint i = 0; i < 10; i++) {
            if (leaderboard[i].personalBalance < balance) {
                // resort
                if (leaderboard[i].user != user) {
                    bool duplicate = false;
                    User memory previous = leaderboard[i];
                    // check if same user is already in lower positions of leaderboard
                    for (uint j = i + 1; j < 10; j++) {
                        if (leaderboard[j].user == user) {
                            duplicate = true;
                            delete leaderboard[j];
                        }
                        User memory temp = leaderboard[j];
                        leaderboard[j] = previous;
                        if (duplicate) break;
                        previous = temp;

                    }
                }
                // add new highscore
                leaderboard[i] = User({
                    user: user,
                    personalBalance: balance
                });
                return true;
            }
            if (leaderboard[i].user == user)
                // user is alrady in list with higher or equal score
                return false;
        }
    }

    /**
     * Returns the user at the specified ranking
     * 
     * @param ranking The rank to retrieve the user from
     */
    function getUser(uint ranking) external view returns (address, uint256) {
        // Can't return structs
        return (leaderboard[ranking - 1].user, leaderboard[ranking - 1].personalBalance);
    }

    function resetLeaderboard() external {
        for (uint i = 0; i <  10; i++) {
            delete leaderboard[i];
        }
    }
}