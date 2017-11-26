var Voting = artifacts.require("./Voting.sol");
var VotingEvent = artifacts.require("./VotingEvent.sol");

module.exports = function(deployer) {
  deployer.deploy(Voting, 1000, web3.toWei('0.1', 'ether'), ['Rama', 'Nick', 'Jose']);
  deployer.deploy(VotingEvent, 'World Cup 2018 Champion', web3.eth.accounts[1], ['Brazil', 'France', 'Germany', 'Spain']);
  deployer.deploy(VotingEvent, 'Vietnam Diva', web3.eth.accounts[1], ['Hong Nhung', 'My Linh', 'Thanh Lam', 'Thu Ha']);
  // deployer.deploy(VotingEvent)
  //   .then(function() {
  //     let addr = VotingEvent.address;
  //     VotingEvent.
  //   })
};
