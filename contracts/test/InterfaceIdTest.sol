// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/draft-IERC1822Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "../IERC721TokenUpgradable.sol";

contract InterfaceIdTest {
	function getERC721TokenUpgradableId() external pure returns (bytes4) {
		return type(IERC721TokenUpgradable).interfaceId;
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
