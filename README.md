# Ohana-Contracts

## Set Up Geth Locally:

1. Install Ethereum and Geth
2. Start Geth node:
To initialize the blockchain, you need to create a genesis.json file, which specifies some configurations and generates the first block. Refer to this file for an example that I used.
Once you’ve created the file, initialize the blockchain with geth --datadir ./path/to/blockchain init genesis.json. If no datadir is specified, the blockchain data will be stored in your current directory.
To start up the node, run geth --rpc --rpccorsdomain "*" --datadir ./path/to/blockchain --rpcapi "db,eth,net,web3,txpool,miner,admin" --networkid  <any_number> console. The console command starts an interactive Javascript environment as well. Again, if no datadir is specified, the node will be referring to the blockchain data stored in your current directory.
Refer to this doc for all the available geth command line options.
Refer to this guide for a more comprehensive explanation of how to start up a geth node.
3. Create root account (etherbase) and start miner:
Once you’ve started the geth node and are in the Javascript console, type personal.newAccount(“<password>”) to create a new account, which automatically gets set as the etherbase.
To start the miner type miner.start(), which will deposit the ether rewards into the etherbase’s account. To stop, type miner.stop()
Refer to this doc for all the available APIs and functions. **To use a specific API in the console, make sure it’s included in the --rpcapi command when starting the geth node up

## Project Folder Structure:

Git Repo: https://git.soma.salesforce.com/byue/Ohana-Contracts

App:
/app/routes - routing files
/app/controllers - controller files
/app/contracts - create the web3 contract instances
Build:
/build/contracts - compiled contracts (includes ABI)
Config:
/config/config.js - sets up the web3 instance and specifies address of etherbase
Contracts:
/contracts - all Solidity contracts
/contracts/storage - storage contracts
Migrations (AKA contract deployment):
/migrations/1_initial_migration.js - default migration file that is run first (comes with Truffle)
/migrations/2_deploy_storage.js - deploys storage contracts
/migrations/3_deploy_logic.js - deploys logic contracts
Test:
/test - solidity/javascript code that tests the contracts
To run all tests, type truffle test. To test a specific file, type truffle test ./test/<file_name>

## Edit Contracts and Redeploy:
Once you’ve finished editing the contract, make sure the web3.eth.defaultAccount value in /config/config.js matches the root account of the nodes you are deploying to. Also, make sure the truffleConfig variable is referring to the correct network: 
const truffleConfig = require('../truffle.js').networks.<network_name>
To see and edit the available networks, refer to the truffle.js file. 
Run truffle migrate -f 3 --network <network_name> to just deploy the logic (not storage) contracts.
This will only run /migrations/3_deploy_logic.js. If you’d like the add more migration files, name it <number>_<file_name>.js. For example, if you create 4_deploy_other_files.js, run truffle migrate -f 4 --network <network_name> to run it.
If, however, you’d like to redeploy all contracts (including storage ones), run truffle migrate --reset --network <network_name>.  
After deployment, re-push the project to the remote instances since the build files have been modified, and Truffle will need the updated build files to allow web3 to connect to the Ethereum nodes.


## Shortcomings/To-Do
Upgradeability - Upgradeability is implemented for the OhanaCoin and Admin contracts, but for some reason calling another contract’s functions does not work on the remote geth nodes. For now, I’ve commented out the upgrade-able code in the OhanaCoins contract.
Because external function calls don’t work, the Admin contract doesn’t work (still using the “upgrade-able” code), and adminBurnFrom(), transferFrom(), and resetBalances() in the OhanaCoins contract don’t work either since they rely on functions from the Admin contract
Error Codes - Return errors from the contracts. Hopefully web3 will be able to read messages from require statements in the future, but for now the best solution would be to emit an Error event.
GUS Event Timeline - The activity timeline can only handle automated deposit and transfer transactions, not burns or balance resets.
Gus Admins - Implement admin functionality in the front-end
ETHER FLUCTUATIONS - Transactions that seemingly come out of nowhere are draining the etherbase’s ether 
A possible solution for this would be to drastically increase the mining rewards in consensus.go to offset the losses that these transactions incur. Refer to here for more info
However, registration still works since the users are getting ether from the OhanaCoins contract, not the etherbase (etherbase deposits ether into contract upon deployment)

## Node.js API:
User API:
 /user/count 
Method - GET
Description - returns number of users registered
/user/balances 
Method - POST
Request body params: 
userId - String
Description - returns personal and transferable balances for the user 
/user/balances 
Method - POST
Request body params: 
userId - String
numEvents - Integer
Description - returns the past numEvents transactions the user was involved in
/user/transferredUsers 
Method - POST
Request body params 
userId - String
Description - returns an array of users that the user has transferred to
/user/userTransferredAmount 
Method - POST
Request body params
fromId - String
toId - String
Description - returns how much user fromId has transferred to toId so far
/user/pastBalances 
Method - POST
Request body params
userId - String
Description - returns past week of coin earnings for the user (all 0 if just registered)
/user/transfer
Method - POST
Request body params
userId - String
toId - String
value - Integer
fromBalance - Integer (0 for personal and 1 for transferable)
message - String 
password - String
Description - transfers value Ohana Coins from user userId to user toId along with the specified message 
/user/register 
Method - POST
Request body params
password - String
Description - creates a new user and returns the address
etherbase account needs to be unlocked for this
		
Admin API:
/admin/userTransferLimit 
Method - GET
Description - global variable, returns the max amount that admins can transfer to a particular users 
/admin/totalTransferLimit 
Method - GET
Description - global variable, returns the total amount that admins can transfer
/admin/totalBurnLimit 
Method - GET
Description - global variable, returns the total amount that admins can burn
/admin/transferableBalance 
Method - POST
Request body params: 
adminId - String
Description - returns total amount left that particular admin is allowed to transfer
/admin/userAllowance 
Method - POST
Request body params: 
adminId - String
userId - String
Description - returns amount left that admin is allowed to transfer to user userId
/admin/burnBalance 
Method - POST
Request body params: 
adminId - String
userId - String
Description - returns amount left that admin is allowed to burn from user userId’s balance
/admin/isAdmin 
Method - POST
Request body params
adminId - String
Description - returns whether user is an admin or not
/admin/team 
Method - POST
Request body params
adminId - String
Description - returns admin’s team members
/admin/isTeamMember
Method - POST
Request body params
adminId - String
userId - String
Description - returns whether user userId is on admin’s team
/admin/transferFrom 
Method - POST
Request body params
adminId - String
toId - String
value - Integer
password - String
message - String
Description - transfers value coins to user toId from common pool along with specified message
user adminId must be an admin
/admin/burnFrom 
Method - POST
Request body params
adminId - String
toId - String
value - Integer
password - String
Description - burns value coins from user toId 
user adminId must be an admin
/admin/addAdmin 
Method - POST
Request body params
adminId - String
userId - String
team - String[]
password - String
Description - admin adminId adds user userId as an admin 
user adminId must be an admin
/admin/removeAdmin 
Method - POST
Request body params
adminId - String
userId - String
password - String
Description - admin adminId removes user userId’s admin status
user adminId must be an admin
/admin/addTeamMember 
Method - POST
Request body params
adminId - String
userId - String
password - String
Description - admin adminId adds user userId to his/her team
user adminId must be an admin
/admin/removeTeamMember 
Method - POST
Request body params
adminId - String
userId - String
password - String
Description - admin adminId removes user userId from his/her team
user adminId must be an admin

Owner API:
/owner/burnFrom 
Method - POST
Request body params
userId - String
value - Integer
balanceType - (0 for personal, 1 for transferable)
password - String
Description - etherbase burns value coins from user userId’s personal or transferable balance (depending on balanceType); used for scheduled burns 
password must be etherbase’s password
/owner/depositAllowance 
Method - POST
Request body params
userId - String
password - String
Description - etherbase deposits monthly allowance into user userId’s transferable balance along with some ether
password must be etherbase’s password
/owner/resetBalances 
Method - POST
Request body params
userId - String
password - String
Description - resets user userId’s personal balance to 0 and transferable balance to 30
password must be etherbase’s password

Leaderboard API:
/leaderboard
Method - GET
Description - returns the top 10 users
/leaderboard/reset
Method - POST
Request body params
password - String
Description - etherbase resets the leaderboard
password must be etherbase’s password

Scheduler API:
/scheduler/nextDeposit
Method - GET
Description - returns days and hours left until next allowance deposit date
/scheduler/nextReset
Method - GET
Description - returns days and hours left until next balance reset date
/scheduler/setDepositDate
Method - POST
Request body params
year - Integer
month - Integer
day - Integer
Description - sets the next allowance deposit date
/scheduler/setResetDate
Method - POST
Request body params
year - Integer
month - Integer
day - Integer
Description - sets the next balance reset date
