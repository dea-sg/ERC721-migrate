// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.16;

import {IAccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/IAccessControlEnumerableUpgradeable.sol";
import {IERC1822ProxiableUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/draft-IERC1822Upgradeable.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {IERC721TokenUpgradableV2} from "../IERC721TokenUpgradableV2.sol";

contract InterfaceIdTest {
	function getERC721TokenUpgradableV2Id() external pure returns (bytes4) {
		return type(IERC721TokenUpgradableV2).interfaceId;
	}

	function getERC721UpgradeableId() external pure returns (bytes4) {
		return type(IERC721Upgradeable).interfaceId;
	}

	function getERC1822ProxiableUpgradeableId() external pure returns (bytes4) {
		return type(IERC1822ProxiableUpgradeable).interfaceId;
	}

	function getAccessControlEnumerableUpgradeableId()
		external
		pure
		returns (bytes4)
	{
		return type(IAccessControlEnumerableUpgradeable).interfaceId;
	}
}
