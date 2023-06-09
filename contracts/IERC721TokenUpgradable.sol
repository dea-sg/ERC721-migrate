// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.16;

interface IERC721TokenUpgradable {
	struct AssetData {
		//紐づけシリアル総量
		//the total number of serial ids in this asset id
		uint256 totalNumberOfSerialId;
		string assetName;
		string uri;
	}

	struct TokenOwner {
		uint256 tokenId;
		address owner;
		uint256 assetId;
	}

	function getAssetData(uint256 _assetId)
		external
		view
		returns (
			// solhint-disable-next-line var-name-mixedcase
			uint256 total_number,
			// solhint-disable-next-line var-name-mixedcase
			string memory asset_name,
			string memory uri
		);

	function bulkMint(
		address _user,
		uint256 _assetId,
		string calldata _assetName,
		string calldata _tokenUri,
		uint256 _total
	) external returns (bool);
}
