pragma solidity ^0.4.0;

contract VotingEvent {
    
    enum State {
        NotStarted,
        Voting,
        Closed
    }
    
    // struct Organizer {
    //     bytes32 name;
    //     address addr;
    // }
    
    struct Vote {
        uint candidateIndex;
        uint votes;
        uint timeStamp;
    }
    
    struct Candidate {
        bytes32 name;
        uint votes;
    }
    
    address public guardSystem;
    address public organizer;
    uint public startTime;
    uint public endTime;
    uint public votePriceInToken;
    uint public maxTokensBeUsed;
    uint public maxCandidatesBeVoted;
    
    Candidate[] public candidates;
    
    mapping(bytes32 => uint) public voters;
    Vote[] votes;

    function VotingEvent(
        address _organizer,
        bytes32[] _candidateNames,
        uint _startTime,
        uint _endTime,
        uint _votePriceInToken,
        uint _maxTokensBeUsed,
        uint _maxCandidatesBeVoted)
        public
    {
        require(_startTime <= _endTime);

        guardSystem = msg.sender;
        organizer = _organizer;
        
        candidates = new Candidate[](_candidateNames.length);
        // for (uint i = 0; i < _candidateNames.length; ++i) {
        //     candidates[i] = Candidate({name: _candidateNames[i], votes: 0});
        // }
        
        startTime = _startTime;
        endTime = _endTime;
        
        votePriceInToken = _votePriceInToken;
        maxTokensBeUsed = _maxTokensBeUsed;
        maxCandidatesBeVoted = _maxCandidatesBeVoted;
    }
    
    modifier condition(bool _condition) {
        require(_condition);
        _;
    }
    
    modifier onlyWhen(uint timeStamp, State state) {
        require(getState(timeStamp) == state);
        _;
    }
    
    modifier onlyValidCandidate(uint candidateIndex) {
        require(isValidCandidate(candidateIndex));
        _;
    }
    
    function getState(uint timeStamp) view public returns (State) {
        if (timeStamp < startTime) {
            return State.NotStarted;
        } else if (timeStamp < endTime) {
            return State.Voting;
        } else {
            return State.Closed;
        }
    }
    
    function isValidCandidate(uint candidateIndex) view public returns (bool) {
        return candidateIndex >= 0 && candidateIndex < candidates.length;
    }
    
    function voteForCandidate(bytes32 voter, uint timeStamp, uint candidateIndex)
        public
        onlyWhen(timeStamp, State.Voting)
        onlyValidCandidate(candidateIndex)
        returns (uint)
    {
        uint voteIndex = voters[voter];
        require(voteIndex == 0);
        
        uint voteNumber = 1;  // TODO: add weight or token
        
        candidates[candidateIndex].votes += voteNumber;
        
        uint[] arr;
        arr.push(1);
        
        // Vote storage vote = Vote(candidateIndex, votes, timeStamp);

        voteIndex = votes.push(Vote(candidateIndex, voteNumber, timeStamp));
        
        voters[voter] = voteIndex;
        
        return voteIndex;
    }
    

    
}