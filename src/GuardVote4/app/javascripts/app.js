// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
// import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

let candidates = {}

let tokenPrice = null;

window.voteForCandidate = function (candidate) {
  let candidateName = $("#candidate").val();
  let voteTokens = $("#vote-tokens").val();
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  $("#candidate").val("");
  $("#vote-tokens").val("");

  /* Voting.deployed() returns an instance of the contract. Every call
   * in Truffle returns a promise which is why we have used then()
   * everywhere we have a transaction call
   */
  Voting.deployed().then(function (contractInstance) {
    contractInstance.voteForCandidate(candidateName, voteTokens, { gas: 140000, from: web3.eth.accounts[0] }).then(function () {
      let div_id = candidates[candidateName];
      return contractInstance.totalVotesFor.call(candidateName).then(function (v) {
        $("#" + div_id).html(v.toString());
        $("#msg").html("");
      });
    });
  });
}

/* The user enters the total no. of tokens to buy. We calculate the total cost and send it in
 * the request. We have to send the value in Wei. So, we use the toWei helper method to convert
 * from Ether to Wei.
 */

window.buyTokens = function () {
  let tokensToBuy = $("#buy").val();
  let price = tokensToBuy * tokenPrice;
  $("#buy-msg").html("Purchase order has been submitted. Please wait.");
  Voting.deployed().then(function (contractInstance) {
    contractInstance.buy({ value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0] }).then(function (v) {
      $("#buy-msg").html("");
      web3.eth.getBalance(contractInstance.address, function (error, result) {
        $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
      });
    })
  });
  populateTokenData();
}

window.lookupVoterInfo = function () {
  let address = $("#voter-info").val();
  Voting.deployed().then(function (contractInstance) {
    contractInstance.voterDetails.call(address).then(function (v) {
      $("#tokens-bought").html("Total Tokens bought: " + v[0].toString());
      let votesPerCandidate = v[1];
      $("#votes-cast").empty();
      $("#votes-cast").append("Votes cast per candidate: <br>");
      let allCandidates = Object.keys(candidates);
      for (let i = 0; i < allCandidates.length; i++) {
        $("#votes-cast").append(allCandidates[i] + ": " + votesPerCandidate[i] + "<br>");
      }
    });
  });
}

/* Instead of hardcoding the candidates hash, we now fetch the candidate list from
 * the blockchain and populate the array. Once we fetch the candidates, we setup the
 * table in the UI with all the candidates and the votes they have received.
 */
function populateCandidates() {
  Voting.deployed().then(function (contractInstance) {
    contractInstance.allCandidates.call().then(function (candidateArray) {
      for (let i = 0; i < candidateArray.length; i++) {
        /* We store the candidate names as bytes32 on the blockchain. We use the
         * handy toUtf8 method to convert from bytes32 to string
         */
        candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
      }
      setupCandidateRows();
      populateCandidateVotes();
      populateTokenData();
    });
  });
}

function populateCandidateVotes() {
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function (contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function (v) {
        $("#" + candidates[name]).html(v.toString());
      });
    });
  }
}

function setupCandidateRows() {
  Object.keys(candidates).forEach(function (candidate) {
    $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
}

/* Fetch the total tokens, tokens available for sale and the price of
 * each token and display in the UI
 */
function populateTokenData() {
  Voting.deployed().then(function (contractInstance) {
    contractInstance.totalTokens().then(function (v) {
      $("#tokens-total").html(v.toString());
    });
    contractInstance.tokensSold.call().then(function (v) {
      $("#tokens-sold").html(v.toString());
    });
    contractInstance.tokenPrice().then(function (v) {
      tokenPrice = parseFloat(web3.fromWei(v.toString()));
      $("#token-cost").html(tokenPrice + " Ether");
    });
    web3.eth.getBalance(contractInstance.address, function (error, result) {
      $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
    });
  });
}

/**
 * Added by Nam
 */
import votingEvent_artifacts from '../../build/contracts/VotingEvent.json';

var VotingEvent = contract(votingEvent_artifacts);

window.myCreateEvent = function (obj) {
  // web3.eth.contract(VotingEvent).new(votingEvent_artifacts.abi, "0x6e88b5a88716cf33d704a9da190c96f1443dbb1c", );
  // var votingEventInstance = VotingEvent.new(
  //   web3.eth.accounts[1],
  //   ["A", "B", "C"],
  //   {from: web3.eth.accounts[0], gas: 1000000});


  // VotingEvent.deployed().then(function(votingEventInstance)) {

  // }
}


var votingEventAddresses = ["0x55ac092eb5ac1d60fbb1d0238b7fa5d9ce175b87", "0x6a9fbd0fc63a47e7592cd6d6f66900d45b25828b"];
var votingEventInfo = [  
  {
    organizer: 'WC 2018',
    candidates: ['Brazil', 'France', 'Germany', 'Spain'],
    voteData: [
      ['Candidate', 'Votes'],
      ['Brazil', 15],
      ['France', 6],
      ['Germany', 12],
      ['Spain', 9],
    ]
  },
  {
    organizer: 'Vietnam Diva',
    candidates: ['Hong Nhung', 'My Linh', 'Thanh Lam', 'Thu Ha'],
    voteData: [
      ['Candidate', 'Votes'],
      ['Hong Nhung', 18],
      ['My Linh', 20],
      ['Thanh Lam', 8],
      ['Tran Thu Ha', 12],
    ]
  },
]


var votingEvents;
var votingEventsLoaded = false;

function loadExistingVotingEvents() {
  votingEvents = [];

  var count = 0;
  var async = require('async');
  async.whilst(
    function () { return count < votingEventAddresses.length; },
    function (callback) {
      var _instance = VotingEvent.at(votingEventAddresses[count]);
      var _address = _instance.address;
      // var _name = _instance.name.call({ from: web3.eth.accounts[0], gas: 100000 }).then(function (rs, err) {
      //   return new Promise((reject, resolve) => {
      //     if (err)
      //       return reject(err);
      //     else
      //       return resolve(rs);
      //   })
      // }).then((name) => {
      //   votingEvents[count] = {
      //     instance: _instance,
      //     address: _address,
      //     name: name,
      //   }, function(err) {
      //   }
      // });

      _instance.name.call({ from: web3.eth.accounts[0], gas: 100000 }).then(function (rs, err) {
        votingEvents[count] = {
          instance: _instance,
          address: _address,
          name: rs,
        }
        count++;
        callback();
      });
    },
    function (err, n) {
      // 5 seconds have passed, n = 5
    }
  );

  // for (var i = 0; i < votingEventAddresses.length; ++i) {
  //   var _instance = VotingEvent.at(votingEventAddresses[i]);
  //   var _address = _instance.address;
  //   var _name = _instance.name.call({ from: web3.eth.accounts[0], gas: 100000 }).then(function (rs, err) {
  //     return new Promise((reject, cb) => {
  //       if (err)
  //         return reject(err);
  //       else
  //         return cb(rs);
  //     })
  //   }).then((name) => {

  //   });

  //   var _name = _instance.name.call({ from: web3.eth.accounts[0], gas: 100000 }).then(function (rs, err) {
  //     votingEvents[i] = {
  //       instance: _instance,
  //       address: _address,
  //       name: rs,
  //     }
  //   });

  // }
  // setupEventRows();
}

function loadVotingEvent(addr) {
  var _instance = VotingEvent.at(addr);
  var _address = _instance.address;
  _instance.name.call({ from: web3.eth.accounts[0], gas: 100000 }).then(function (name, err) {
    return {
      instance: _instance,
      address: _address,
      name: name,
    }
    callback();
  });
}

window.setupEventRows = function () {

  var i = 0;

  // $("#votingEvent-rows").clear();

  votingEvents.forEach(function (votingEvent) {
    $("#votingEvent-rows").append(
      "<tr><td><a href='event.html?addr=" + votingEvent.address + "&name=" + votingEvent.name + "'>"
      + votingEvent.name
      + "</a></td><td><a href='https://etherscan.io/address/0xdba5b14e58ce9baa956d77eec99c05921255d4f7'>" + votingEvent.address + "</a></td></tr>");
  });
}


function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var currentVotingEvent;

function showEventDetails() {
  var addr = getParameterByName('addr');
  var name = getParameterByName('name');
  currentVotingEvent = loadVotingEvent(addr);
  $('#eventName').text(name);
}

window.loadVotingEventResults = function () {


  var addr = getParameterByName('addr');
  var index;
  for (var i = 0; i < votingEventAddresses.length; ++i) {
    if (votingEventAddresses[i] == addr) {
      index = i;
    }
  }

  index = 0;




  var votingEventInstance;
  if (currentVotingEvent != null) {
    votingEventInstance = currentVotingEvent.instance;
  } else {
    votingEventInstance = VotingEvent.at(addr);
  }

  if (votingEventInstance == null) {
    return;
  }




  // votingEventInstance.getCandidateVotesReceived.call(0, { from: web3.eth.accounts[0], gas: 100000 }).
  //   then((rs) => {
  //   }, err => {
  //   });

  // var candidateNames;



  // Load google charts
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  // Draw the chart and set the chart values
  function drawChart() {
    var data = google.visualization.arrayToDataTable(votingEventInfo[index].voteData);

    // Optional; add a title and set the width and height of the chart
    var options = { 'title': 'Voting results', 'width': 550, 'height': 400 };

    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
  }

}




$(document).ready(function () {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Voting.setProvider(web3.currentProvider);
  populateCandidates();

  VotingEvent.setProvider(web3.currentProvider);
  loadExistingVotingEvents();

  if ($('#eventName').length) {
    showEventDetails();
  }

});



