pragma solidity ^0.4.23;

import './ERC721Token.sol';

contract StarNotary is ERC721Token { 

// Define type of Star 
    struct Star { 
        string name;
        string deg;
        string mag;
        string cent;
        string story;
    }
    
    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    // Array to store all Ids to be able to interate over mapping 
    uint[] public allTokenIds;


    function createStar(string _name, string _deg, string _mag, string _cent, string _story,uint256 _tokenId) public { 
        require(checkifStarExist(allTokenIds, _deg, _mag,_cent),"This star is already claimed.");
        ERC721Token.mint(_tokenId);
        Star memory newStar = Star(_name, _deg,_mag,_cent,_story);
        tokenIdToStarInfo[_tokenId] = newStar;
        allTokenIds.push(_tokenId);

    }

    function tokenIdToStarInfo(uint256 _tokenId) public view returns(string _a, string _b, string _c, string _d, string _f) {
        string storage name = tokenIdToStarInfo[_tokenId].name;
        string storage mag = tokenIdToStarInfo[_tokenId].mag;
        string storage deg = tokenIdToStarInfo[_tokenId].deg;
        string storage cent = tokenIdToStarInfo[_tokenId].cent;
        string storage story = tokenIdToStarInfo[_tokenId].story;
        // TODO: if _tokenId does not exist return warning message to avoid [''..]
        return (name,deg,mag,cent,story);
         
    }

    // Looping over array of Ids to ensure that (deg,mag,cent) is not already taken 
    function checkifStarExist(uint[] _arr, string _deg, string _mag, string _cent) public view returns(bool){
        for(uint i = 0;i < _arr.length; i++){
            string storage mag = tokenIdToStarInfo[_arr[i]].mag;
            string storage deg = tokenIdToStarInfo[_arr[i]].deg;
            string storage cent = tokenIdToStarInfo[_arr[i]].cent;
            if(compareStrings(mag,_mag) && compareStrings(deg,_deg) && compareStrings(cent,_cent) ){
                return false;
                }
            }
        return true; 
    }
    

    // Helper function to compare if 2 strings are equal 
    function compareStrings (string a, string b) public pure returns (bool){
        if(bytes(a).length != bytes(b).length) {
            return false;
              } else {
                return keccak256(a) == keccak256(b);
            }
                
    }



    function append(string a, string b, string c) public pure returns (string) {

        return string(abi.encodePacked(a, b, c));

    }




    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);

        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }
}