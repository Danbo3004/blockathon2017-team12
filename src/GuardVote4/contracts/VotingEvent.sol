pragma solidity ^0.4.0;

contract VotingEvent {
    
    uint public constant MAX_TIME = 0xFFFFFFFF;

    enum State {
        NotStarted,
        Voting,
        Closed
    }
    
    string public name;
    address public admin;
    address public organizer;
    
    bytes32[] public candidateNames;
    uint[] public candidateVotesReceived;
    
    struct Vote {
        uint candidateIndex;
        // uint votes;
        uint timeStamp;
    }
    
    uint public startTime;
    uint public endTime;
    // uint public votePriceInToken;
    // uint public maxTokensBeUsed;
    // uint public maxCandidatesBeVoted;
    
    mapping(bytes32 => uint) public voters;
    Vote[] votes;

    function VotingEvent(
        string _name,
        address _organizer,
        bytes32[] _candidateNames)
        public
    {
        admin = msg.sender;

        name = _name;
        organizer = _organizer;
        // state = State.NotStarted;
        
        candidateNames = _candidateNames;
        candidateVotesReceived = new uint[](_candidateNames.length);
        for (uint i = 0; i < _candidateNames.length; ++i) {
            candidateVotesReceived[i] = 0;
        }
        
        startTime = 0;
        endTime = 0;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyAdminOrOrganizer() {
        require(msg.sender == admin || msg.sender == organizer);
        _;
    }
    
    function start(uint _startTime, uint _endTime) public onlyAdminOrOrganizer {
        require(startTime == 0); // not started yet
        require(_startTime < _endTime);
        startTime = _startTime;
        endTime = _endTime;
    }
    
    function startNow(uint _duration)
        public
        onlyAdminOrOrganizer
        returns (uint _startTime, uint _endTime)
    {
        require(startTime == 0); // not started yet
        require(_duration > 0);
        
        startTime = block.timestamp;
        if (_duration < MAX_TIME) {
            endTime = startTime + _duration;
        } else {
            endTime = MAX_TIME;
        }
        
        _startTime = startTime;
        _endTime = endTime;
    }
    
    function closeNow() public onlyAdminOrOrganizer {
        require(startTime > 0); // started
        uint timestamp = block.timestamp;
        if (endTime > timestamp) {
            endTime = timestamp;
        }
    }
    
    function getState() public view returns (State) {
        uint timestamp = block.timestamp;
        if (startTime == 0 || timestamp < startTime) {
            return State.NotStarted;
        } else if (timestamp <= endTime) {
            return State.Voting;
        } else {
            return State.Closed;
        }
    }
    
    modifier onlyVotingTime(uint timestamp) {
        require(startTime > 0); // started
        require(timestamp > startTime && timestamp < endTime);
        _;
    }
    
    modifier onlyValidCandidate(uint candidateIndex) {
        require(candidateIndex < candidateNames.length);
        _;
    }
    
    function voteForCandidate(bytes32 voterHashCode, uint candidateIndex, uint timeStamp)
        public
        onlyAdmin()
        onlyVotingTime(timeStamp)
        onlyValidCandidate(candidateIndex)
        returns (uint)
    {
        uint voteIndex = voters[voterHashCode];
        require(voteIndex == 0);
        
        candidateVotesReceived[candidateIndex] += 1;
        
        voteIndex = votes.push(Vote(candidateIndex, timeStamp));
        
        voters[voterHashCode] = voteIndex;
        
        return voteIndex;
    }
    
    function getWinnerCandidate()
        public
        view
        returns(
            uint index,
            bytes32 name,
            uint votesReceived)
    {
        uint winnerCandidateIndex = 0;
        uint winnerCandidateVotesReceived = 0;
        for (uint i = 0; i < candidateNames.length; ++i) {
            if (candidateVotesReceived[i] > winnerCandidateVotesReceived) {
                winnerCandidateVotesReceived = candidateVotesReceived[i];
                winnerCandidateIndex = i;
            }
        }
        
        index = winnerCandidateIndex;
        name = candidateNames[index];
        votesReceived = candidateVotesReceived[index];
    }

}