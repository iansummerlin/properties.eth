//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Property is ERC721URIStorage {
    uint private _tokenIds;

    constructor() ERC721("Properties.eth", "PROP") {}

    function mint(string memory tokenURI) public returns (uint) {
        uint tokenId = _tokenIds + 1;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIds +=1;

        return _tokenIds;
    }

    function totalSupply() public view returns (uint) {
        return _tokenIds;
    }
}
