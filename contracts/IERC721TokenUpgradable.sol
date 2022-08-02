// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

interface IERC721TokenUpgradable {
	struct AssetData {
		//紐づけシリアル総量
		//the total number of serial ids in this asset id
		uint256 totalNumberOfSerialId;
		string assetName;
		string uri;
	}

	function getTokenId(uint256 _index) external view returns (uint256);

	function getTokenList(uint256 _start, uint256 _end)
		external
		view
		returns (uint256[] memory tokenIdList);

	function getOwnerTokenList(address _owner)
		external
		view
		returns (uint256[] memory tokenIdList);

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
